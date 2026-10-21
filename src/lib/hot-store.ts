// ==============================================================================
// MathMaster THCS - Bước 2.6: Lưu trữ tách dữ liệu biến động (Hot Store)
// sessions / attempts / topicMastery / reviewQueue được lưu theo TỪNG DÒNG trong các
// bảng mm_user_sessions / mm_exam_attempts / mm_topic_mastery / mm_review_items.
// Phần còn lại (users, exams, questions, ...) vẫn nằm trong JSONB mm_cloud_state.
//
// - Ghi theo diff: chỉ upsert/xoá đúng các dòng thay đổi; chỉ ghi lại payload chính
//   khi nó thực sự thay đổi.
// - Mỗi bản ghi được giữ NGUYÊN VẸN trong cột data JSONB (không mất trường nào).
// - Thứ tự mảng được giữ bằng cột ord (hỗ trợ cả push lẫn unshift mà không phải
//   cập nhật lại toàn bộ các dòng khác).
// ==============================================================================

import crypto from 'node:crypto';

/** Giao diện tối thiểu tới PostgreSQL (Prisma hoặc PGlite trong kiểm thử) */
export interface HotDb {
  query(sql: string, params?: any[]): Promise<any[]>;
  transaction<T>(fn: (db: HotDb) => Promise<T>): Promise<T>;
}

/** Tạo HotDb từ Prisma Client ($queryRawUnsafe + interactive transaction) */
export function hotDbFromPrisma(prisma: any): HotDb {
  const wrap = (client: any): HotDb => ({
    query: (sql, params = []) => client.$queryRawUnsafe(sql, ...params),
    transaction: (fn) =>
      client.$transaction
        ? client.$transaction((tx: any) => fn(wrap(tx)), { timeout: 20000, maxWait: 10000 })
        : fn(wrap(client)),
  });
  return wrap(prisma);
}

type ColumnSpec = { name: string; type: string; get: (r: any) => any };

export interface HotCollectionSpec {
  key: 'sessions' | 'attempts' | 'topicMastery' | 'reviewQueue';
  table: string;
  columns: ColumnSpec[];
}

function toTimestamp(v: any): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export const HOT_COLLECTIONS: HotCollectionSpec[] = [
  {
    key: 'sessions',
    table: 'mm_user_sessions',
    columns: [
      { name: 'expires_at', type: 'timestamptz', get: (r) => toTimestamp(r.expiresAt) },
      { name: 'revoked_at', type: 'timestamptz', get: (r) => toTimestamp(r.revokedAt) },
    ],
  },
  {
    key: 'attempts',
    table: 'mm_exam_attempts',
    columns: [
      { name: 'exam_id', type: 'text', get: (r) => (r.examId == null ? null : String(r.examId)) },
      { name: 'status', type: 'text', get: (r) => (r.status == null ? null : String(r.status)) },
    ],
  },
  {
    key: 'topicMastery',
    table: 'mm_topic_mastery',
    columns: [],
  },
  {
    key: 'reviewQueue',
    table: 'mm_review_items',
    columns: [
      {
        name: 'question_id',
        type: 'text',
        get: (r) => (r.questionId == null ? null : String(r.questionId)),
      },
      { name: 'resolved', type: 'boolean', get: (r) => Boolean(r.resolved) },
      { name: 'next_review_at', type: 'timestamptz', get: (r) => toTimestamp(r.nextReviewAt) },
    ],
  },
];

export const HOT_KEYS = HOT_COLLECTIONS.map((c) => c.key);
export const SPLIT_TABLES = [
  'mm_cloud_state',
  'mm_state_meta',
  'mm_state_backups',
  ...HOT_COLLECTIONS.map((c) => c.table),
];

/** Payload chính (không gồm các tập dữ liệu biến động) */
export function buildMainPayload(state: any): any {
  const main: any = {};
  for (const k of Object.keys(state || {})) {
    if (!(HOT_KEYS as string[]).includes(k)) main[k] = state[k];
  }
  return main;
}

/** Bảo đảm mọi bản ghi có id duy nhất (bản ghi thiếu id được gán id mới, không bị bỏ) */
function ensureRecordIds(key: string, arr: any[]) {
  for (const rec of arr) {
    if (rec && typeof rec === 'object' && !rec.id) {
      rec.id = `auto_${key}_${crypto.randomUUID()}`;
    }
  }
}

// ------------------------------------------------------------------------------
// Bộ theo dõi trạng thái đã lưu trên DB để tính diff
// ------------------------------------------------------------------------------
export class HotTracker {
  rowJson: Record<string, Map<string, string>> = {};
  ord: Record<string, Map<string, number>> = {};
  mainJson: string | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    for (const k of HOT_KEYS) {
      this.rowJson[k] = new Map();
      this.ord[k] = new Map();
    }
    this.mainJson = null;
  }

  seedCollection(key: string, rows: { id: string; ord: number; data: any }[]) {
    const rj = new Map<string, string>();
    const od = new Map<string, number>();
    for (const r of rows) {
      rj.set(r.id, JSON.stringify(r.data));
      od.set(r.id, Number(r.ord));
    }
    this.rowJson[key] = rj;
    this.ord[key] = od;
  }
}

export interface HotDiff {
  mainChanged: boolean;
  mainStr: string;
  upserts: Record<string, { rec: any; ord: number; json: string }[]>;
  deletes: Record<string, string[]>;
  rowChangeCount: number;
}

/** Gán ord cho bản ghi mới dựa trên hàng xóm đã biết (hỗ trợ push, unshift, chèn giữa) */
function assignOrds(ids: string[], known: Map<string, number>): number[] {
  const out: (number | undefined)[] = ids.map((id) => known.get(id));
  let i = 0;
  while (i < out.length) {
    if (out[i] !== undefined) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < out.length && out[j] === undefined) j += 1;
    const prev = i > 0 ? (out[i - 1] as number) : undefined;
    const next = j < out.length ? (out[j] as number) : undefined;
    const m = j - i;
    for (let k = 1; k <= m; k++) {
      let v: number;
      if (prev !== undefined && next !== undefined) v = prev + ((next - prev) * k) / (m + 1);
      else if (next !== undefined) v = next - (m + 1 - k);
      else if (prev !== undefined) v = prev + k;
      else v = i + k - 1;
      out[i + k - 1] = v;
    }
    i = j;
  }
  return out as number[];
}

/**
 * Tính diff giữa state trong bộ nhớ và những gì đã lưu trên DB.
 * allowDeletes = false khi state truyền vào là bản cũ (stale) để không xoá nhầm
 * bản ghi mới do tiến trình khác tạo ra.
 */
export function computeHotDiff(state: any, tracker: HotTracker, allowDeletes = true): HotDiff {
  const mainStr = JSON.stringify(buildMainPayload(state));
  const upserts: HotDiff['upserts'] = {};
  const deletes: HotDiff['deletes'] = {};
  let rowChangeCount = 0;

  for (const spec of HOT_COLLECTIONS) {
    const arr: any[] = Array.isArray(state?.[spec.key]) ? state[spec.key] : [];
    ensureRecordIds(spec.key, arr);
    const seen = new Set<string>();
    const uniq: any[] = [];
    for (const rec of arr) {
      if (!rec || typeof rec !== 'object' || seen.has(rec.id)) continue;
      seen.add(rec.id);
      uniq.push(rec);
    }
    const ords = assignOrds(
      uniq.map((r) => r.id),
      tracker.ord[spec.key]
    );
    const ups: { rec: any; ord: number; json: string }[] = [];
    uniq.forEach((rec, idx) => {
      const json = JSON.stringify(rec);
      if (tracker.rowJson[spec.key].get(rec.id) !== json) {
        ups.push({ rec, ord: ords[idx], json });
      }
    });
    const dels: string[] = [];
    if (allowDeletes) {
      for (const id of tracker.rowJson[spec.key].keys()) {
        if (!seen.has(id)) dels.push(id);
      }
    }
    upserts[spec.key] = ups;
    deletes[spec.key] = dels;
    rowChangeCount += ups.length + dels.length;
  }

  return {
    mainChanged: mainStr !== tracker.mainJson,
    mainStr,
    upserts,
    deletes,
    rowChangeCount,
  };
}

function upsertSql(spec: HotCollectionSpec): string {
  const extraCols = spec.columns.map((c) => `"${c.name}"`);
  const extraDefs = spec.columns.map((c) => `"${c.name}" ${c.type}`);
  const insertCols = ['"id"', '"user_id"', ...extraCols, '"ord"', '"data"', '"updated_at"'];
  const selectCols = [
    'x."id"',
    'x."user_id"',
    ...spec.columns.map((c) => `x."${c.name}"`),
    'x."ord"',
    'x."data"',
    'NOW()',
  ];
  const recDefs = ['"id" text', '"user_id" text', ...extraDefs, '"ord" double precision', '"data" jsonb'];
  const updates = ['"user_id"', ...extraCols, '"ord"', '"data"']
    .map((c) => `${c} = EXCLUDED.${c}`)
    .concat(['"updated_at" = NOW()']);
  return `INSERT INTO "${spec.table}" (${insertCols.join(', ')})
    SELECT ${selectCols.join(', ')}
    FROM jsonb_to_recordset($1::jsonb) AS x(${recDefs.join(', ')})
    ON CONFLICT ("id") DO UPDATE SET ${updates.join(', ')}`;
}

function toRowParam(spec: HotCollectionSpec, rec: any, ord: number) {
  const row: any = { id: String(rec.id), user_id: String(rec.userId ?? ''), ord, data: rec };
  for (const c of spec.columns) row[c.name] = c.get(rec);
  return row;
}

export async function upsertHotRows(
  db: HotDb,
  spec: HotCollectionSpec,
  rows: { rec: any; ord: number }[]
) {
  if (rows.length === 0) return;
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK).map((r) => toRowParam(spec, r.rec, r.ord));
    await db.query(upsertSql(spec), [JSON.stringify(part)]);
  }
}

export interface ApplyResult {
  mainUpdatedAtMs: number | null;
  rowsVersion: number | null;
  prevRowsVersionSeen: number | null;
  statements: number;
  bytesWritten: number;
}

/** Ghi diff trong MỘT giao dịch; chỉ cập nhật tracker sau khi COMMIT thành công */
export async function applyHotDiff(db: HotDb, diff: HotDiff, tracker: HotTracker): Promise<ApplyResult> {
  const result: ApplyResult = {
    mainUpdatedAtMs: null,
    rowsVersion: null,
    prevRowsVersionSeen: null,
    statements: 0,
    bytesWritten: 0,
  };
  if (!diff.mainChanged && diff.rowChangeCount === 0) return result;

  await db.transaction(async (tx) => {
    if (diff.mainChanged) {
      const rows = await tx.query(
        `INSERT INTO mm_cloud_state (id, payload, updated_at)
         VALUES ('main', $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
         RETURNING updated_at`,
        [diff.mainStr]
      );
      result.statements += 1;
      result.bytesWritten += Buffer.byteLength(diff.mainStr);
      result.mainUpdatedAtMs = rows?.[0]?.updated_at
        ? new Date(rows[0].updated_at).getTime()
        : Date.now();
    }
    for (const spec of HOT_COLLECTIONS) {
      const ups = diff.upserts[spec.key] || [];
      if (ups.length > 0) {
        await upsertHotRows(tx, spec, ups);
        result.statements += Math.ceil(ups.length / 500);
        result.bytesWritten += ups.reduce((a, u) => a + Buffer.byteLength(u.json), 0);
      }
      const dels = diff.deletes[spec.key] || [];
      if (dels.length > 0) {
        await tx.query(
          `DELETE FROM "${spec.table}" WHERE "id" IN (SELECT jsonb_array_elements_text($1::jsonb))`,
          [JSON.stringify(dels)]
        );
        result.statements += 1;
      }
    }
    if (diff.rowChangeCount > 0) {
      const vRows = await tx.query(
        `UPDATE mm_state_meta SET rows_version = rows_version + 1, updated_at = NOW()
         WHERE id = 'main' RETURNING rows_version::float8 AS rows_version`
      );
      result.statements += 1;
      result.rowsVersion = vRows?.[0] ? Number(vRows[0].rows_version) : null;
    }
  });

  // COMMIT thành công -> cập nhật tracker
  if (diff.mainChanged) tracker.mainJson = diff.mainStr;
  for (const spec of HOT_COLLECTIONS) {
    for (const u of diff.upserts[spec.key] || []) {
      tracker.rowJson[spec.key].set(u.rec.id, u.json);
      tracker.ord[spec.key].set(u.rec.id, u.ord);
    }
    for (const id of diff.deletes[spec.key] || []) {
      tracker.rowJson[spec.key].delete(id);
      tracker.ord[spec.key].delete(id);
    }
  }
  return result;
}

/** Đọc toàn bộ 4 bảng dữ liệu biến động trong MỘT lượt truy vấn */
export async function loadHotRows(
  db: HotDb
): Promise<{ rows: Record<string, { id: string; ord: number; data: any }[]>; rowsVersion: number }> {
  const parts = HOT_COLLECTIONS.map(
    (spec) =>
      `(SELECT COALESCE(jsonb_agg(jsonb_build_object('id', "id", 'ord', "ord", 'data', "data") ORDER BY "ord", "id"), '[]'::jsonb) FROM "${spec.table}") AS "${spec.key}"`
  );
  const res = await db.query(
    `SELECT ${parts.join(', ')},
       (SELECT rows_version::float8 FROM mm_state_meta WHERE id = 'main') AS rows_version`
  );
  const r0 = res?.[0] || {};
  const rows: Record<string, any[]> = {};
  for (const spec of HOT_COLLECTIONS) {
    const v = r0[spec.key];
    rows[spec.key] = typeof v === 'string' ? JSON.parse(v) : Array.isArray(v) ? v : [];
  }
  return { rows, rowsVersion: Number(r0.rows_version ?? 0) };
}

/**
 * Ghép bản ghi từ bảng vào state. Bảng là nguồn chính; nếu payload JSONB vẫn còn bản ghi
 * (do một tiến trình bản cũ ghi đè), bản ghi có id chưa có trong bảng được giữ lại để không mất.
 */
export function mergeHotRowsIntoState(
  state: any,
  rows: Record<string, { id: string; ord: number; data: any }[]>
): { strayRecordsKept: number } {
  let strayRecordsKept = 0;
  for (const spec of HOT_COLLECTIONS) {
    const fromTable = (rows[spec.key] || []).map((r) => r.data);
    const ids = new Set(fromTable.map((r: any) => r?.id));
    const stray = Array.isArray(state[spec.key])
      ? state[spec.key].filter((r: any) => r && r.id && !ids.has(r.id))
      : [];
    strayRecordsKept += stray.length;
    state[spec.key] = fromTable.concat(stray);
  }
  return { strayRecordsKept };
}

// ------------------------------------------------------------------------------
// Chuyển đổi dữ liệu (dùng bởi scripts/migrate-hot-collections.ts và kiểm thử)
// ------------------------------------------------------------------------------

/** Chuỗi JSON chuẩn hoá (sắp xếp khoá) để so sánh nội dung độc lập thứ tự khoá */
export function canonicalJson(v: any): string {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v)
      .sort()
      .filter((k) => v[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v ?? null);
}

export async function splitTablesExist(db: HotDb): Promise<{ ok: boolean; missing: string[] }> {
  const rows = await db.query(
    `SELECT t AS name, (to_regclass('public.' || t) IS NOT NULL)::boolean AS present
     FROM jsonb_array_elements_text($1::jsonb) AS t`,
    [JSON.stringify(SPLIT_TABLES)]
  );
  const missing = rows.filter((r: any) => !r.present).map((r: any) => r.name);
  return { ok: missing.length === 0, missing };
}

export interface MigrateReport {
  status: 'dry-run' | 'migrated' | 'already-migrated';
  counts: Record<string, number>;
  backupId: number | null;
  payloadKBBefore: number;
  payloadKBAfter: number;
}

export async function migrateToSplit(db: HotDb, opts: { apply: boolean }): Promise<MigrateReport> {
  const tables = await splitTablesExist(db);
  if (!tables.ok) {
    throw new Error(
      `Thiếu bảng ${tables.missing.join(', ')}. Hãy chạy "npx prisma migrate deploy" trước.`
    );
  }

  return db.transaction(async (tx) => {
    const cs = await tx.query(`SELECT payload FROM mm_cloud_state WHERE id = 'main' FOR UPDATE`);
    if (!cs?.[0]?.payload) throw new Error('Không tìm thấy mm_cloud_state.main để chuyển đổi.');
    const raw = cs[0].payload;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const payloadStrBefore = JSON.stringify(payload);

    await tx.query(
      `INSERT INTO mm_state_meta (id, migrated_at, rows_version) VALUES ('main', NULL, 0)
       ON CONFLICT (id) DO NOTHING`
    );
    const meta = (await tx.query(`SELECT migrated_at FROM mm_state_meta WHERE id = 'main' FOR UPDATE`))[0];
    const alreadyMigrated = Boolean(meta?.migrated_at);
    const hasHotKeysInPayload = HOT_KEYS.some((k) => Array.isArray(payload[k]) && payload[k].length > 0);

    const counts: Record<string, number> = {};
    for (const spec of HOT_COLLECTIONS) {
      counts[spec.key] = Array.isArray(payload[spec.key]) ? payload[spec.key].length : 0;
    }

    if (alreadyMigrated && !hasHotKeysInPayload) {
      return {
        status: 'already-migrated' as const,
        counts,
        backupId: null,
        payloadKBBefore: +(Buffer.byteLength(payloadStrBefore) / 1024).toFixed(2),
        payloadKBAfter: +(Buffer.byteLength(payloadStrBefore) / 1024).toFixed(2),
      };
    }

    const mainAfter = buildMainPayload(payload);
    const mainAfterStr = JSON.stringify(mainAfter);
    if (!opts.apply) {
      return {
        status: 'dry-run' as const,
        counts,
        backupId: null,
        payloadKBBefore: +(Buffer.byteLength(payloadStrBefore) / 1024).toFixed(2),
        payloadKBAfter: +(Buffer.byteLength(mainAfterStr) / 1024).toFixed(2),
      };
    }

    // 1. Snapshot sao lưu toàn bộ payload trước khi đụng vào
    const b = await tx.query(
      `INSERT INTO mm_state_backups (reason, payload) VALUES ($1, $2::jsonb) RETURNING id::float8 AS id`,
      [alreadyMigrated ? 'before-remerge-stray-hot-records' : 'before-split-hot-collections', payloadStrBefore]
    );
    const backupId = Number(b?.[0]?.id ?? 0);

    // 2. Ghi dữ liệu vào bảng
    for (const spec of HOT_COLLECTIONS) {
      const arr: any[] = Array.isArray(payload[spec.key]) ? payload[spec.key] : [];
      ensureRecordIds(spec.key, arr);
      const seen = new Set<string>();
      const recs = arr.filter((r) => r && typeof r === 'object' && !seen.has(r.id) && seen.add(r.id));

      if (alreadyMigrated) {
        // Bảng đã là nguồn chính: chỉ bổ sung bản ghi còn sót trong payload, không ghi đè
        const existing = await tx.query(
          `SELECT "id", "ord" FROM "${spec.table}" ORDER BY "ord" DESC LIMIT 1`
        );
        let base = existing?.[0] ? Number(existing[0].ord) : 0;
        const have = new Set(
          (await tx.query(`SELECT "id" FROM "${spec.table}"`)).map((r: any) => r.id)
        );
        const missing = recs.filter((r) => !have.has(r.id));
        await upsertHotRows(
          tx,
          spec,
          missing.map((rec) => ({ rec, ord: (base += 1) }))
        );
      } else {
        // Bảng chưa là nguồn chính: thay bằng đúng nội dung payload (bản sao cũ từ lần rollback trước, nếu có, được thay thế)
        await tx.query(
          `DELETE FROM "${spec.table}" WHERE "id" NOT IN (SELECT jsonb_array_elements_text($1::jsonb))`,
          [JSON.stringify(recs.map((r) => r.id))]
        );
        await upsertHotRows(
          tx,
          spec,
          recs.map((rec, idx) => ({ rec, ord: idx }))
        );
      }

      // 3. Đối chiếu: mọi bản ghi trong payload phải có trong bảng với nội dung giống hệt
      const stored = await tx.query(`SELECT "id", "data" FROM "${spec.table}"`);
      const storedMap = new Map(stored.map((r: any) => [r.id, r.data]));
      for (const rec of recs) {
        const s = storedMap.get(rec.id);
        if (!s) throw new Error(`Đối chiếu thất bại: thiếu ${spec.key}.${rec.id} trong ${spec.table}`);
        const sObj = typeof s === 'string' ? JSON.parse(s) : s;
        if (!alreadyMigrated && canonicalJson(sObj) !== canonicalJson(rec)) {
          throw new Error(`Đối chiếu thất bại: nội dung ${spec.key}.${rec.id} khác bản gốc`);
        }
      }
      if (!alreadyMigrated && stored.length !== recs.length) {
        throw new Error(
          `Đối chiếu thất bại: ${spec.table} có ${stored.length} dòng, payload có ${recs.length}`
        );
      }
    }

    // 4. Gỡ 4 tập khỏi payload chính & bật chế độ tách
    await tx.query(
      `UPDATE mm_cloud_state SET payload = $1::jsonb, updated_at = NOW() WHERE id = 'main'`,
      [mainAfterStr]
    );
    await tx.query(
      `UPDATE mm_state_meta SET migrated_at = COALESCE(migrated_at, NOW()),
         rows_version = rows_version + 1, updated_at = NOW() WHERE id = 'main'`
    );

    return {
      status: 'migrated' as const,
      counts,
      backupId,
      payloadKBBefore: +(Buffer.byteLength(payloadStrBefore) / 1024).toFixed(2),
      payloadKBAfter: +(Buffer.byteLength(mainAfterStr) / 1024).toFixed(2),
    };
  });
}

/** Quay lui: gộp dữ liệu trong bảng trở lại payload JSONB (KHÔNG xoá dữ liệu trong bảng) */
export async function rollbackSplit(db: HotDb): Promise<{ backupId: number; counts: Record<string, number> }> {
  const tables = await splitTablesExist(db);
  if (!tables.ok) throw new Error(`Thiếu bảng ${tables.missing.join(', ')}.`);
  return db.transaction(async (tx) => {
    const cs = await tx.query(`SELECT payload FROM mm_cloud_state WHERE id = 'main' FOR UPDATE`);
    if (!cs?.[0]?.payload) throw new Error('Không tìm thấy mm_cloud_state.main.');
    const raw = cs[0].payload;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    await tx.query(`SELECT id FROM mm_state_meta WHERE id = 'main' FOR UPDATE`);

    const b = await tx.query(
      `INSERT INTO mm_state_backups (reason, payload) VALUES ('before-rollback-split', $1::jsonb) RETURNING id::float8 AS id`,
      [JSON.stringify(payload)]
    );
    const { rows } = await loadHotRows(tx);
    mergeHotRowsIntoState(payload, rows);
    const counts: Record<string, number> = {};
    for (const k of HOT_KEYS) counts[k] = (payload[k] || []).length;

    await tx.query(
      `UPDATE mm_cloud_state SET payload = $1::jsonb, updated_at = NOW() WHERE id = 'main'`,
      [JSON.stringify(payload)]
    );
    await tx.query(
      `UPDATE mm_state_meta SET migrated_at = NULL, rows_version = rows_version + 1, updated_at = NOW() WHERE id = 'main'`
    );
    return { backupId: Number(b?.[0]?.id ?? 0), counts };
  });
}

// ==============================================================================
// MathMaster THCS - Script Chuyển Đổi Dữ Liệu Biến Động (Bước 2.6)
// Tách sessions, attempts, topicMastery, reviewQueue từ mm_cloud_state JSONB
// sang các bảng quan hệ riêng (mm_user_sessions, mm_exam_attempts, mm_topic_mastery, mm_review_items).
//
// Cách dùng:
//   node scripts/migrate-hot-collections.mjs --status
//   node scripts/migrate-hot-collections.mjs --dry-run
//   node scripts/migrate-hot-collections.mjs --apply
//   node scripts/migrate-hot-collections.mjs --rollback
// ==============================================================================

import { PrismaClient } from '@prisma/client';
import {
  hotDbFromPrisma,
  migrateToSplit,
  rollbackSplit,
  splitTablesExist,
  HOT_KEYS,
} from '../src/lib/hot-store.ts';

const prisma = new PrismaClient();
const db = hotDbFromPrisma(prisma);

async function checkStatus() {
  const tables = await splitTablesExist(db);
  if (!tables.ok) {
    console.log('❌ Bảng chưa sẵn sàng. Thiếu:', tables.missing.join(', '));
    return;
  }
  const meta = (
    await db.query(`SELECT migrated_at, rows_version, updated_at FROM mm_state_meta WHERE id = 'main'`)
  )[0];
  const cs = (await db.query(`SELECT updated_at, length(payload::text) as len FROM mm_cloud_state WHERE id = 'main'`))[0];
  const backups = (await db.query(`SELECT count(*)::int as c FROM mm_state_backups`))[0]?.c || 0;

  console.log('================================================================');
  console.log('📊 TRẠNG THÁI LƯU TRỮ (mm_state_meta):');
  console.log(' - Chế độ hiện tại:', meta?.migrated_at ? '✅ TÁCH DÒNG BIẾN ĐỘNG (Split-Hot)' : '📦 GỘP TOÀN BỘ JSONB (Legacy)');
  console.log(' - Thời điểm chuyển đổi:', meta?.migrated_at || 'Chưa chuyển đổi');
  console.log(' - Phiên bản hàng (rows_version):', meta?.rows_version ?? 0);
  console.log(' - Kích thước JSONB mm_cloud_state:', cs ? `${(cs.len / 1024).toFixed(2)} KB` : 'N/A');
  console.log(' - Số bản sao lưu (mm_state_backups):', backups);

  if (meta?.migrated_at) {
    const counts = {};
    for (const k of ['mm_user_sessions', 'mm_exam_attempts', 'mm_topic_mastery', 'mm_review_items']) {
      const c = (await db.query(`SELECT count(*)::int as c FROM "${k}"`))[0]?.c || 0;
      counts[k] = c;
    }
    console.log(' - Số dòng trong các bảng riêng:', counts);
  }
  console.log('================================================================');
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isDryRun = args.includes('--dry-run');
  const isRollback = args.includes('--rollback');
  const isStatus = args.includes('--status') || args.length === 0;

  try {
    if (isRollback) {
      console.log('⏳ Đang tiến hành quay lui (rollback)...');
      const res = await rollbackSplit(db);
      console.log('✅ Đã quay lui thành công!');
      console.log(` - ID bản sao lưu trước khi quay lui: ${res.backupId}`);
      console.log(' - Số bản ghi đã gộp lại vào JSONB:', res.counts);
      await checkStatus();
      return;
    }

    if (isDryRun || isApply) {
      console.log(isApply ? '⏳ Đang thực hiện chuyển đổi dữ liệu...' : '🔎 Chạy thử nghiệm (Dry-Run)...');
      const res = await migrateToSplit(db, { apply: isApply });
      console.log(isApply ? '🎉 Chuyển đổi thành công!' : '📋 Kết quả Dry-Run:');
      console.log(` - Trạng thái: ${res.status}`);
      console.log(` - Kích thước payload mm_cloud_state: ${res.payloadKBBefore} KB -> ${res.payloadKBAfter} KB`);
      console.log(' - Số bản ghi đã chuyển:', res.counts);
      if (res.backupId) console.log(` - Snapshot sao lưu tự động ID: ${res.backupId} trong bảng mm_state_backups`);
      await checkStatus();
      return;
    }

    if (isStatus) {
      await checkStatus();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Lỗi thực thi:', err.message);
  process.exit(1);
});

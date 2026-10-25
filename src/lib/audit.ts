// ==============================================================================
// MathMaster THCS - Dịch vụ Ghi nhận Nhật ký Thao tác Quản trị (Admin Audit Log)
// Cấu trúc tương tự dịch vụ audit.service.js của hệ thống Tuyển Dụng IT
// ==============================================================================

import crypto from 'node:crypto';
import { readServerStateAsync, writeServerStateAsync } from './prisma';

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string; // e.g. "student.create", "student.update", "student.ban", "student.unban", "student.resetPassword", "student.softDelete", "student.restore", "student.hardDelete", "student.bulk"
  targetType: 'Student' | 'Teacher' | 'Question' | 'System';
  targetId: string;
  targetName?: string;
  meta: Record<string, any>;
  ip: string;
  createdAt: string; // ISO date string
}

export interface LogAdminActionParams {
  admin: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
  };
  action: string;
  targetType: 'Student' | 'Teacher' | 'Question' | 'System';
  targetId: string;
  targetName?: string;
  meta?: Record<string, any>;
  ip?: string;
  state?: any;
}

/**
 * Ghi lại thao tác của Admin vào kho lưu trữ (tương đương logAdminAction trong Tuyển Dụng IT)
 */
export async function logAdminAction({
  admin,
  action,
  targetType,
  targetId,
  targetName,
  meta = {},
  ip = '',
  state: passedState,
}: LogAdminActionParams): Promise<AuditLogRecord> {
  const logEntry: AuditLogRecord = {
    id: `audit_${crypto.randomUUID()}`,
    adminId: admin.id,
    adminName: admin.fullName || admin.name || 'Quản trị viên',
    adminEmail: admin.email,
    action,
    targetType,
    targetId: String(targetId),
    targetName: targetName || '',
    meta,
    ip: ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  };

  try {
    const state = passedState || (await readServerStateAsync());
    if (!state.auditLogs) {
      state.auditLogs = [];
    }
    // Đẩy bản ghi mới nhất lên đầu danh sách
    state.auditLogs.unshift(logEntry);

    // Giữ tối đa 5000 logs để tối ưu bộ nhớ
    if (state.auditLogs.length > 5000) {
      state.auditLogs = state.auditLogs.slice(0, 5000);
    }

    if (!passedState) {
      await writeServerStateAsync(state);
    }
  } catch (err: any) {
    console.error('Lỗi khi lưu AuditLog:', err?.message || err);
  }

  return logEntry;
}

/**
 * Truy vấn danh sách nhật ký kiểm toán quản trị kèm bộ lọc và phân trang
 */
export async function getAuditLogs(
  query: {
    targetType?: string;
    targetId?: string;
    adminId?: string;
    action?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  } = {},
  existingState?: any
): Promise<{
  logs: AuditLogRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}> {
  const state = existingState || (await readServerStateAsync());
  let allLogs: AuditLogRecord[] = Array.isArray(state.auditLogs) ? [...state.auditLogs] : [];

  // Lọc theo targetType
  if (query.targetType && query.targetType !== 'ALL') {
    allLogs = allLogs.filter((l) => l.targetType === query.targetType);
  }

  // Lọc theo targetId
  if (query.targetId) {
    allLogs = allLogs.filter((l) => l.targetId === String(query.targetId));
  }

  // Lọc theo adminId
  if (query.adminId) {
    allLogs = allLogs.filter((l) => l.adminId === query.adminId);
  }

  // Lọc theo action
  if (query.action && query.action !== 'ALL') {
    allLogs = allLogs.filter((l) => l.action === query.action);
  }

  // Lọc theo keyword (tìm trong adminName, adminEmail, targetName, meta)
  if (query.keyword && query.keyword.trim()) {
    const kw = query.keyword.trim().toLowerCase();
    allLogs = allLogs.filter((l) => {
      const matchAdmin =
        (l.adminName && l.adminName.toLowerCase().includes(kw)) ||
        (l.adminEmail && l.adminEmail.toLowerCase().includes(kw));
      const matchTarget = l.targetName && l.targetName.toLowerCase().includes(kw);
      const matchAction = l.action.toLowerCase().includes(kw);
      const matchMeta = JSON.stringify(l.meta || {}).toLowerCase().includes(kw);
      return matchAdmin || matchTarget || matchAction || matchMeta;
    });
  }

  // Sắp xếp giảm dần theo thời gian tạo
  allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 20);
  const totalItems = allLogs.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const skip = (page - 1) * limit;
  const paginatedLogs = allLogs.slice(skip, skip + limit);

  return {
    logs: paginatedLogs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  };
}

// ==============================================================================
// MathMaster THCS - API Nhật Ký Hoạt Động Quản Trị Hệ Thống (/api/admin/logs)
// Tương đương adminLog.controller.js trong Tuyển Dụng IT
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/prisma';
import { getAuditLogs } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const action = searchParams.get('action') || 'ALL';
    const targetType = searchParams.get('targetType') || 'ALL';
    const keyword = searchParams.get('keyword') || searchParams.get('search') || '';

    const result = await getAuditLogs(
      {
        page,
        limit,
        action,
        targetType,
        keyword,
      },
      auth.state
    );

    return NextResponse.json({
      ok: true,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

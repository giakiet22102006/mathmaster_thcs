// ==============================================================================
// MathMaster THCS - API Trạng Thái Cá Nhân Đã Cô Lập (/api/state)
// Chỉ trả dữ liệu của chính người dùng đang đăng nhập, tuyệt đối không trả passwordHash
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  buildScopedStateForUser,
  requireUser,
  writeServerStateAsync,
} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const scope = req.nextUrl.searchParams.get('scope');
    const scopedState = buildScopedStateForUser(auth.state, auth.user, scope);
    return NextResponse.json({ ok: true, state: scopedState });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải dữ liệu người dùng.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const userId = auth.user.id;
    const state = auth.state;

    // Nếu client cố tình truyền userId của người khác -> chặn 403
    if (body.userId && body.userId !== userId && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền truy cập hoặc sửa dữ liệu của người dùng khác.' },
        { status: 403 }
      );
    }

    // 1. Cập nhật thông tin hồ sơ của chính người dùng đang đăng nhập
    if (body.profile && typeof body.profile === 'object') {
      const p = body.profile;
      if (typeof p.fullName === 'string' && p.fullName.trim().length >= 2) {
        auth.user.fullName = p.fullName.trim().slice(0, 100);
      }
      if (typeof p.schoolName === 'string') {
        auth.user.schoolName = p.schoolName.trim().slice(0, 120);
      }
      if ([6, 7, 8, 9].includes(Number(p.currentGrade))) {
        auth.user.currentGrade = Number(p.currentGrade);
      }
      if (['KNTT', 'CD', 'CTST'].includes(p.preferredBook)) {
        auth.user.preferredBook = p.preferredBook;
      }
      if (['light', 'dark'].includes(p.theme)) {
        auth.user.theme = p.theme;
      }
      if (typeof p.anonymousLeaderboard === 'boolean') {
        auth.user.anonymousLeaderboard = p.anonymousLeaderboard;
      }
      if (Array.isArray(p.favoriteQuestionIds)) {
        auth.user.favoriteQuestionIds = p.favoriteQuestionIds
          .filter((x: any) => typeof x === 'string')
          .slice(0, 500);
      }
      if (typeof p.onboardingCompleted === 'boolean') {
        auth.user.onboardingCompleted = p.onboardingCompleted;
      }
    }

    // 2. Nếu client gửi payload state đồng bộ từ giao diện, chỉ cập nhật các bản ghi thuộc về chính userId này
    if (body.state && typeof body.state === 'object') {
      const incoming = body.state;

      // Kiểm tra xem client có cố gắng sửa dữ liệu của user khác không
      if (
        incoming.currentUserId &&
        incoming.currentUserId !== userId &&
        auth.user.role !== 'ADMIN'
      ) {
        return NextResponse.json(
          { ok: false, error: 'Không được phép ghi đè dữ liệu của tài khoản khác.' },
          { status: 403 }
        );
      }

      // Cập nhật thông tin cá nhân hợp lệ của chính user
      if (Array.isArray(incoming.users)) {
        const selfUpdate = incoming.users.find((u: any) => u.id === userId);
        if (selfUpdate) {
          if (typeof selfUpdate.fullName === 'string' && selfUpdate.fullName.trim().length >= 2) {
            auth.user.fullName = selfUpdate.fullName.trim();
          }
          if (typeof selfUpdate.schoolName === 'string') {
            auth.user.schoolName = selfUpdate.schoolName.trim();
          }
          if ([6, 7, 8, 9].includes(Number(selfUpdate.currentGrade))) {
            auth.user.currentGrade = Number(selfUpdate.currentGrade);
          }
          if (['KNTT', 'CD', 'CTST'].includes(selfUpdate.preferredBook)) {
            auth.user.preferredBook = selfUpdate.preferredBook;
          }
          if (['light', 'dark'].includes(selfUpdate.theme)) {
            auth.user.theme = selfUpdate.theme;
          }
        }
      }

      // Chỉ đồng bộ các learningGoals của chính userId
      if (Array.isArray(incoming.learningGoals)) {
        const ownGoals = incoming.learningGoals
          .filter((g: any) => !g.userId || g.userId === userId)
          .map((g: any) => ({ ...g, userId }));
        state.learningGoals = (state.learningGoals || [])
          .filter((g: any) => g.userId !== userId)
          .concat(ownGoals);
      }
    }

    await writeServerStateAsync(state);
    return NextResponse.json({
      ok: true,
      savedAt: new Date().toISOString(),
      state: buildScopedStateForUser(state, auth.user),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể lưu dữ liệu người dùng.' },
      { status: 500 }
    );
  }
}

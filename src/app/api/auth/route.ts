import { NextRequest, NextResponse } from 'next/server';
import { readServerStateAsync, writeServerStateAsync, getPrismaClient } from '@/lib/prisma';
import { hashPassword, verifyPassword, signSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export function deleteUserCascadeFromState(state: any, targetUserId: string) {
  const target = (state.users || []).find((u: any) => u.id === targetUserId);
  if (!target) return { deleted: false, error: 'Không tìm thấy tài khoản cần xóa.' };

  state.users = (state.users || []).filter((u: any) => u.id !== targetUserId);
  state.exams = (state.exams || []).filter((e: any) => e.userId !== targetUserId || e.isSeed);
  state.attempts = (state.attempts || []).filter((a: any) => a.userId !== targetUserId);
  state.documents = (state.documents || []).filter((d: any) => d.userId !== targetUserId);
  state.reviewQueue = (state.reviewQueue || []).filter((r: any) => r.userId !== targetUserId);
  state.userAchievements = (state.userAchievements || []).filter((ua: any) => ua.userId !== targetUserId);
  state.learningGoals = (state.learningGoals || []).filter((g: any) => g.userId !== targetUserId);
  state.studySessions = (state.studySessions || []).filter((s: any) => s.userId !== targetUserId);

  if (state.users.length === 0) {
    state.users.push({
      id: 'user_' + Date.now(),
      username: 'hocsinh_moi',
      email: 'hocsinh@mathmaster.edu.vn',
      passwordHash: hashPassword('pass123'),
      fullName: 'Học sinh Mới',
      role: 'STUDENT',
      isGuest: false,
      schoolName: 'THCS Việt Nam',
      currentGrade: 8,
      preferredBook: 'KNTT',
      xp: 0,
      level: 1,
      streakDays: 1,
      lastStudyDate: new Date().toISOString().slice(0, 10),
      theme: 'light'
    });
  }

  if (state.currentUserId === targetUserId) {
    state.currentUserId = state.users[0].id;
  }

  return { deleted: true, deletedUser: target, activeUserId: state.currentUserId };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, currentGrade, preferredBook, userId } = body;
    const state = await readServerStateAsync();

    if (action === 'register') {
      if (!fullName) {
        return NextResponse.json({ ok: false, error: 'Vui lòng nhập họ và tên học sinh.' }, { status: 400 });
      }
      const newUser = {
        id: 'user_' + Date.now(),
        username: String(fullName).toLowerCase().replace(/\s+/g, '_'),
        email: email || `hocsinh_${Date.now()}@mathmaster.edu.vn`,
        passwordHash: hashPassword(password || 'pass123'),
        fullName,
        role: 'STUDENT',
        isGuest: false,
        schoolName: 'THCS Việt Nam',
        currentGrade: Number(currentGrade || 8),
        preferredBook: preferredBook || 'KNTT',
        xp: 0,
        level: 1,
        streakDays: 1,
        lastStudyDate: new Date().toISOString().slice(0, 10),
        theme: 'light'
      };
      state.users.push(newUser);
      state.currentUserId = newUser.id;
      await writeServerStateAsync(state);

      const token = signSessionToken({ userId: newUser.id, role: 'STUDENT', isGuest: false });
      const res = NextResponse.json({ ok: true, user: newUser });
      res.cookies.set('mm_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
      return res;
    }

    if (action === 'login') {
      const user = state.users.find((u: any) => u.email === email || u.username === email || u.id === userId);
      if (!user || (password && !verifyPassword(password, user.passwordHash))) {
        return NextResponse.json({ ok: false, error: 'Thông tin đăng nhập không chính xác.' }, { status: 401 });
      }
      state.currentUserId = user.id;
      await writeServerStateAsync(state);
      const token = signSessionToken({ userId: user.id, role: user.role, isGuest: Boolean(user.isGuest) });
      const res = NextResponse.json({ ok: true, user });
      res.cookies.set('mm_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
      return res;
    }

    if (action === 'delete') {
      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Thiếu ID tài khoản cần xóa.' }, { status: 400 });
      }
      const result = deleteUserCascadeFromState(state, userId);
      if (!result.deleted) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
      }
      await writeServerStateAsync(state);

      try {
        const prisma = await getPrismaClient();
        if (prisma && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('CHANGE_ME')) {
          await prisma.users.delete({ where: { id: userId } }).catch(() => {});
        }
      } catch {}

      return NextResponse.json({
        ok: true,
        deletedUserId: userId,
        activeUserId: result.activeUserId,
        remainingUsersCount: state.users.length
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

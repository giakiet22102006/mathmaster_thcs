// ==============================================================================
// MathMaster THCS - API Quản Trị Danh Sách & Thêm Mới Học Viên (/api/admin/students)
// Tương đương adminCandidate.controller.js (renderList, postCreate) trong Tuyển Dụng IT
// ==============================================================================

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  requireRole,
  writeServerStateAsync,
} from '@/lib/prisma';
import { hashPasswordAsync, sanitizeUserForClient } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const search = (searchParams.get('search') || searchParams.get('keyword') || '').trim().toLowerCase();
    const status = (searchParams.get('status') || 'all').toLowerCase();
    const grade = searchParams.get('grade') || 'ALL';
    const sort = searchParams.get('sort') || 'newest';

    const allUsers = Array.isArray(state.users) ? state.users : [];
    const allAttempts = Array.isArray(state.attempts) ? state.attempts : [];
    const allSessions = Array.isArray(state.sessions) ? state.sessions : [];

    // Chỉ lấy tài khoản Học viên (role === 'STUDENT')
    const studentsOnly = allUsers.filter((u: any) => (u.role || 'STUDENT') === 'STUDENT');

    // Thống kê tổng số lượng theo trạng thái
    const summary = {
      totalAll: studentsOnly.length,
      activeCount: studentsOnly.filter((u: any) => !u.deletedAt && u.status !== 'banned' && !u.isBanned).length,
      bannedCount: studentsOnly.filter((u: any) => !u.deletedAt && (u.status === 'banned' || u.isBanned)).length,
      deletedCount: studentsOnly.filter((u: any) => Boolean(u.deletedAt)).length,
    };

    // Áp dụng bộ lọc
    let filtered = studentsOnly.filter((u: any) => {
      // 1. Lọc theo trạng thái
      if (status === 'deleted') {
        if (!u.deletedAt) return false;
      } else if (status === 'banned') {
        if (u.deletedAt || (u.status !== 'banned' && !u.isBanned)) return false;
      } else if (status === 'active') {
        if (u.deletedAt || u.status === 'banned' || u.isBanned) return false;
      } else {
        // 'all': mặc định không hiển thị tài khoản đã xóa mềm trừ khi chọn rõ 'deleted' hoặc 'all'
        // Trong Tuyển Dụng IT: 'deleted' lọc riêng, còn 'all' hiển thị cả tài khoản chưa xóa
      }

      // 2. Lọc theo Khối lớp (6, 7, 8, 9)
      if (grade !== 'ALL') {
        const userGrade = Number(u.currentGrade || u.grade || 8);
        if (userGrade !== Number(grade)) return false;
      }

      // 3. Lọc theo Từ khóa tìm kiếm (Tên, Email, Username, Trường học)
      if (search) {
        const nameMatch = (u.fullName || '').toLowerCase().includes(search);
        const emailMatch = (u.email || '').toLowerCase().includes(search);
        const usernameMatch = (u.username || '').toLowerCase().includes(search);
        const schoolMatch = (u.schoolName || '').toLowerCase().includes(search);
        if (!nameMatch && !emailMatch && !usernameMatch && !schoolMatch) return false;
      }

      return true;
    });

    // Gom nhóm thống kê lượt làm bài thi (Zero N+1)
    const attemptsMap = new Map<string, any[]>();
    for (const att of allAttempts) {
      if (!att.userId) continue;
      if (!attemptsMap.has(att.userId)) attemptsMap.set(att.userId, []);
      attemptsMap.get(att.userId)!.push(att);
    }

    // Gom nhóm phiên hoạt động
    const now = Date.now();
    const sessionsCountMap = new Map<string, number>();
    for (const sess of allSessions) {
      if (!sess.userId || sess.revokedAt) continue;
      if (sess.expiresAt && new Date(sess.expiresAt).getTime() < now) continue;
      sessionsCountMap.set(sess.userId, (sessionsCountMap.get(sess.userId) || 0) + 1);
    }

    // Gắn thông tin tính toán vào từng học viên
    const enriched = filtered.map((u: any) => {
      const userAtts = attemptsMap.get(u.id) || [];
      const submittedAtts = userAtts.filter((a) => a.status === 'submitted' || a.status === 'graded' || a.score !== undefined);
      const totalAttempts = submittedAtts.length;

      let avgScore = 0;
      let passedCount = 0;
      let latestAttemptDate: string | null = null;

      if (totalAttempts > 0) {
        const sumScore = submittedAtts.reduce((acc, curr) => acc + Number(curr.score || 0), 0);
        avgScore = Number((sumScore / totalAttempts).toFixed(1));
        passedCount = submittedAtts.filter((a) => Number(a.score || 0) >= 5).length;
        const sortedDates = submittedAtts
          .map((a) => a.submittedAt || a.createdAt)
          .filter(Boolean)
          .sort()
          .reverse();
        latestAttemptDate = sortedDates[0] || null;
      }

      let accountStatus = 'active';
      if (u.deletedAt) accountStatus = 'deleted';
      else if (u.status === 'banned' || u.isBanned) accountStatus = 'banned';

      return {
        id: u.id,
        fullName: u.fullName || 'Học viên',
        email: u.email,
        username: u.username || u.email.split('@')[0],
        currentGrade: Number(u.currentGrade || 8),
        preferredBook: u.preferredBook || 'KNTT',
        schoolName: u.schoolName || 'Chưa cập nhật',
        xp: Number(u.xp || 0),
        level: Number(u.level || 1),
        streakDays: Number(u.streakDays || 0),
        status: accountStatus,
        banReason: u.banReason || '',
        deletedAt: u.deletedAt || null,
        createdAt: u.createdAt || new Date().toISOString(),
        totalAttempts,
        avgScore,
        passedCount,
        latestAttemptDate,
        activeSessionsCount: sessionsCountMap.get(u.id) || 0,
      };
    });

    // Sắp xếp
    if (sort === 'oldest') {
      enriched.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'name-asc') {
      enriched.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));
    } else if (sort === 'name-desc') {
      enriched.sort((a, b) => b.fullName.localeCompare(a.fullName, 'vi'));
    } else if (sort === 'attempts-desc') {
      enriched.sort((a, b) => b.totalAttempts - a.totalAttempts);
    } else if (sort === 'xp-desc') {
      enriched.sort((a, b) => b.xp - a.xp);
    } else {
      // 'newest'
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Phân trang
    const totalItems = enriched.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const skip = (page - 1) * limit;
    const paginatedStudents = enriched.slice(skip, skip + limit);

    return NextResponse.json({
      ok: true,
      students: paginatedStudents,
      summary,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      email,
      username,
      password,
      currentGrade = 8,
      preferredBook = 'KNTT',
      schoolName = '',
    } = body;

    const trimmedName = (fullName || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedUsername = (username || '').trim().toLowerCase();

    // Xác thực đầu vào
    if (!trimmedName) {
      return NextResponse.json({ ok: false, error: 'Họ và tên học viên không được để trống.' }, { status: 400 });
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Email học viên không hợp lệ.' }, { status: 400 });
    }
    if (!trimmedUsername || trimmedUsername.length < 3) {
      return NextResponse.json({ ok: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' }, { status: 400 });
    }

    // Kiểm tra trùng lặp
    const existingEmail = (state.users || []).find((u: any) => (u.email || '').toLowerCase() === trimmedEmail);
    if (existingEmail) {
      return NextResponse.json({ ok: false, error: 'Email này đã tồn tại trên hệ thống.' }, { status: 400 });
    }

    const existingUsername = (state.users || []).find((u: any) => (u.username || '').toLowerCase() === trimmedUsername);
    if (existingUsername) {
      return NextResponse.json({ ok: false, error: 'Tên đăng nhập này đã được sử dụng.' }, { status: 400 });
    }

    // Tạo mật khẩu tạm ngẫu nhiên nếu không truyền vào (chuẩn tương tự Tuyển Dụng IT: Mth@<hex>)
    const tempPassword = (password && password.trim().length >= 6)
      ? password.trim()
      : `Math@${crypto.randomBytes(3).toString('hex')}`;

    const passwordHash = await hashPasswordAsync(tempPassword);
    const newStudentId = `user_${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    const newStudent = {
      id: newStudentId,
      email: trimmedEmail,
      username: trimmedUsername,
      passwordHash,
      fullName: trimmedName,
      role: 'STUDENT',
      currentGrade: Number(currentGrade) || 8,
      preferredBook: ['KNTT', 'CD', 'CTST'].includes(preferredBook) ? preferredBook : 'KNTT',
      schoolName: schoolName.trim() || 'THCS',
      status: 'active',
      banReason: '',
      isGuest: false,
      mustChangePassword: true,
      xp: 0,
      level: 1,
      streakDays: 0,
      failedLoginCount: 0,
      lockedUntil: null,
      favoriteQuestionIds: [],
      anonymousLeaderboard: false,
      onboardingCompleted: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!state.users) state.users = [];
    state.users.push(newStudent);

    // Ghi nhật ký kiểm toán Admin
    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.create',
      targetType: 'Student',
      targetId: newStudentId,
      targetName: trimmedName,
      meta: {
        email: trimmedEmail,
        username: trimmedUsername,
        currentGrade: newStudent.currentGrade,
        preferredBook: newStudent.preferredBook,
        tempPasswordGenerated: !password,
      },
      ip: clientIp,
      state,
    });

    await writeServerStateAsync(state);

    return NextResponse.json({
      ok: true,
      message: 'Tạo tài khoản học viên thành công!',
      student: sanitizeUserForClient(newStudent),
      tempPassword, // Mật khẩu hiển thị một lần duy nhất cho admin
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

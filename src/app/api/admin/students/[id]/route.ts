// ==============================================================================
// MathMaster THCS - API Quản Trị Chi Tiết, Chỉnh Sửa & Xóa Học Viên (/api/admin/students/[id])
// Tương đương adminCandidate.controller.js (renderDetail, postEdit, postSoftDelete, postHardDelete)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  requireRole,
  revokeAllOtherSessionsInState,
  writeServerStateAsync,
} from '@/lib/prisma';
import { sanitizeUserForClient } from '@/lib/auth';
import { getAuditLogs, logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const studentId = params.id;

    const student = (state.users || []).find((u: any) => u.id === studentId);
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy thông tin học viên.' }, { status: 404 });
    }

    // Lấy danh sách lượt làm bài thi của học viên
    const allAttempts = (state.attempts || []).filter((a: any) => a.userId === studentId);
    const submittedAttempts = allAttempts.filter((a: any) => a.status === 'submitted' || a.status === 'graded' || a.score !== undefined);

    // Ghép thông tin đề thi cho từng lượt làm bài
    const examsMap = new Map((state.exams || []).map((e: any) => [e.id, e]));
    const enrichedAttempts = submittedAttempts
      .map((att: any) => {
        const exam = examsMap.get(att.examId);
        return {
          id: att.id,
          examId: att.examId,
          examTitle: exam?.title || att.examTitle || 'Đề thi Toán THCS',
          grade: exam?.grade || student.currentGrade || 8,
          score: Number(att.score ?? 0),
          maxScore: 10,
          totalQuestions: att.totalQuestions || att.answers?.length || 0,
          correctCount: att.correctCount || 0,
          durationSeconds: att.durationSeconds || att.spentTimeSeconds || 0,
          status: att.status,
          submittedAt: att.submittedAt || att.createdAt,
        };
      })
      .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // Thống kê học tập
    const totalAttempts = submittedAttempts.length;
    let avgScore = 0;
    let maxScore = 0;
    let passedCount = 0;
    if (totalAttempts > 0) {
      const sum = submittedAttempts.reduce((acc: number, c: any) => acc + Number(c.score || 0), 0);
      avgScore = Number((sum / totalAttempts).toFixed(1));
      maxScore = Math.max(...submittedAttempts.map((c: any) => Number(c.score || 0)));
      passedCount = submittedAttempts.filter((c: any) => Number(c.score || 0) >= 5).length;
    }

    // Phiên thiết bị đang hoạt động
    const now = Date.now();
    const activeSessions = (state.sessions || []).filter(
      (s: any) =>
        s.userId === studentId &&
        !s.revokedAt &&
        (!s.expiresAt || new Date(s.expiresAt).getTime() > now)
    );

    // Lớp học đã tham gia
    const memberships = (state.classroomMembers || []).filter((m: any) => m.studentId === studentId);
    const classroomsMap = new Map((state.classrooms || []).map((c: any) => [c.id, c]));
    const studentClassrooms = memberships.map((m: any) => {
      const cls = classroomsMap.get(m.classroomId);
      return {
        classroomId: m.classroomId,
        name: cls?.name || 'Lớp học',
        grade: cls?.gradeId || 8,
        joinedAt: m.joinedAt,
      };
    });

    // Lấy Audit Logs liên quan đến học viên này (targetId === studentId)
    const auditLogsRes = await getAuditLogs(
      { targetId: studentId, limit: 50 },
      state
    );

    let accountStatus = 'active';
    if (student.deletedAt) accountStatus = 'deleted';
    else if (student.status === 'banned' || student.isBanned) accountStatus = 'banned';

    return NextResponse.json({
      ok: true,
      student: {
        ...sanitizeUserForClient(student),
        status: accountStatus,
        banReason: student.banReason || '',
        bannedAt: student.bannedAt || null,
        deletedAt: student.deletedAt || null,
      },
      stats: {
        totalAttempts,
        avgScore,
        maxScore,
        passedCount,
        passRate: totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0,
        activeSessionsCount: activeSessions.length,
        classroomsCount: studentClassrooms.length,
      },
      recentAttempts: enrichedAttempts.slice(0, 15),
      activeSessions: activeSessions.map((s: any) => ({
        id: s.id,
        deviceName: s.deviceName || 'Trình duyệt Web',
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt || s.createdAt,
      })),
      classrooms: studentClassrooms,
      auditLogs: auditLogsRes.logs,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const studentId = params.id;
    const body = await req.json().catch(() => ({}));

    const student = (state.users || []).find((u: any) => u.id === studentId);
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy học viên.' }, { status: 404 });
    }

    const {
      fullName,
      email,
      username,
      currentGrade,
      preferredBook,
      schoolName,
      xp,
      level,
    } = body;

    const trimmedName = fullName !== undefined ? String(fullName).trim() : student.fullName;
    if (!trimmedName) {
      return NextResponse.json({ ok: false, error: 'Họ tên không được để trống.' }, { status: 400 });
    }

    // Nếu đổi email, kiểm tra trùng lặp
    if (email !== undefined) {
      const trimmedEmail = String(email).trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        return NextResponse.json({ ok: false, error: 'Email không hợp lệ.' }, { status: 400 });
      }
      const dup = (state.users || []).find(
        (u: any) => u.id !== studentId && (u.email || '').toLowerCase() === trimmedEmail
      );
      if (dup) {
        return NextResponse.json({ ok: false, error: 'Email này đã được sử dụng bởi người dùng khác.' }, { status: 400 });
      }
      student.email = trimmedEmail;
    }

    // Nếu đổi username, kiểm tra trùng lặp
    if (username !== undefined) {
      const trimmedUsername = String(username).trim().toLowerCase();
      if (!trimmedUsername || trimmedUsername.length < 3) {
        return NextResponse.json({ ok: false, error: 'Tên đăng nhập phải từ 3 ký tự trở lên.' }, { status: 400 });
      }
      const dup = (state.users || []).find(
        (u: any) => u.id !== studentId && (u.username || '').toLowerCase() === trimmedUsername
      );
      if (dup) {
        return NextResponse.json({ ok: false, error: 'Tên đăng nhập này đã có người dùng khác sử dụng.' }, { status: 400 });
      }
      student.username = trimmedUsername;
    }

    const changes: Record<string, any> = {};
    if (student.fullName !== trimmedName) {
      changes.oldName = student.fullName;
      changes.newName = trimmedName;
      student.fullName = trimmedName;
    }
    if (currentGrade !== undefined && Number(currentGrade) >= 6 && Number(currentGrade) <= 9) {
      changes.grade = Number(currentGrade);
      student.currentGrade = Number(currentGrade);
    }
    if (preferredBook && ['KNTT', 'CD', 'CTST'].includes(preferredBook)) {
      changes.preferredBook = preferredBook;
      student.preferredBook = preferredBook;
    }
    if (schoolName !== undefined) {
      changes.schoolName = String(schoolName).trim();
      student.schoolName = String(schoolName).trim();
    }
    if (xp !== undefined && !isNaN(Number(xp))) {
      changes.xp = Number(xp);
      student.xp = Number(xp);
    }
    if (level !== undefined && !isNaN(Number(level))) {
      changes.level = Number(level);
      student.level = Number(level);
    }

    student.updatedAt = new Date().toISOString();

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.update',
      targetType: 'Student',
      targetId: studentId,
      targetName: student.fullName,
      meta: changes,
      ip: clientIp,
      state,
    });

    await writeServerStateAsync(state);

    return NextResponse.json({
      ok: true,
      message: 'Cập nhật thông tin học viên thành công!',
      student: sanitizeUserForClient(student),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const studentId = params.id;
    const isPermanent = req.nextUrl.searchParams.get('permanent') === 'true';

    const studentIndex = (state.users || []).findIndex((u: any) => u.id === studentId);
    if (studentIndex === -1) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy học viên.' }, { status: 404 });
    }

    const student = state.users[studentIndex];
    const clientIp = getClientIp(req);

    if (isPermanent) {
      // Xóa vĩnh viễn (Hard delete - giống requireSuperAdmin / hard-delete trong Tuyển Dụng IT)
      state.users.splice(studentIndex, 1);

      // Dọn dẹp phiên và các dữ liệu liên kết
      if (Array.isArray(state.sessions)) {
        state.sessions = state.sessions.filter((s: any) => s.userId !== studentId);
      }
      if (Array.isArray(state.passwordResetTokens)) {
        state.passwordResetTokens = state.passwordResetTokens.filter((t: any) => t.userId !== studentId);
      }

      await logAdminAction({
        admin: auth.user,
        action: 'student.hardDelete',
        targetType: 'Student',
        targetId: studentId,
        targetName: student.fullName,
        meta: { email: student.email, username: student.username },
        ip: clientIp,
        state,
      });

      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        message: `Đã xóa vĩnh viễn tài khoản học viên ${student.fullName}.`,
      });
    } else {
      // Xóa mềm (Soft delete)
      student.deletedAt = new Date().toISOString();
      student.updatedAt = new Date().toISOString();

      // Thu hồi toàn bộ phiên đăng nhập
      revokeAllOtherSessionsInState(state, studentId, null);

      await logAdminAction({
        admin: auth.user,
        action: 'student.softDelete',
        targetType: 'Student',
        targetId: studentId,
        targetName: student.fullName,
        meta: { email: student.email },
        ip: clientIp,
        state,
      });

      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        message: `Đã chuyển tài khoản học viên ${student.fullName} vào danh sách xóa mềm.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

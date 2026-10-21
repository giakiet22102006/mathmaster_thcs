// ==============================================================================
// MathMaster THCS - API Quản Lý Lớp Học, Giao Đề & Bảng Điểm (/api/classrooms)
// Dành cho Giáo viên (TEACHER/ADMIN) quản lý lớp và Học sinh tham gia bằng joinCode 6 ký tự
// ==============================================================================

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireUser, writeServerStateAsync } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function generateJoinCode(existingCodes: Set<string>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[crypto.randomInt(0, chars.length)];
    }
    if (!existingCodes.has(code)) return code;
  }
  return 'MM' + String(Date.now()).slice(-4);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const user = auth.user;
    const isTeacherOrAdmin = user.role === 'TEACHER' || user.role === 'ADMIN';
    const classroomIdFilter = req.nextUrl.searchParams.get('classroomId');

    // Lấy danh sách lớp liên quan đến người dùng hiện tại
    const relevantClassrooms = (state.classrooms || []).filter((c: any) => {
      if (user.role === 'ADMIN') return true;
      if (user.role === 'TEACHER') return c.teacherId === user.id || c.id === 'CLASS_SEED_8A';
      return (state.classroomMembers || []).some(
        (m: any) => m.classroomId === c.id && m.studentId === user.id
      );
    });

    const detailedClassrooms = relevantClassrooms
      .filter((c: any) => !classroomIdFilter || c.id === classroomIdFilter)
      .map((cls: any) => {
        const members = (state.classroomMembers || []).filter(
          (m: any) => m.classroomId === cls.id
        );
        const students = members
          .map((m: any) => {
            const stu = (state.users || []).find((u: any) => u.id === m.studentId);
            if (!stu) return null;
            return {
              id: stu.id,
              fullName: stu.fullName,
              email: isTeacherOrAdmin ? stu.email : undefined,
              schoolName: stu.schoolName,
              currentGrade: stu.currentGrade,
              joinedAt: m.joinedAt,
            };
          })
          .filter(Boolean);

        const assignments = (state.classroomAssignments || [])
          .filter((a: any) => a.classroomId === cls.id)
          .map((a: any) => {
            const exam = (state.exams || []).find((e: any) => e.id === a.examId);
            const myAttempt = (state.attempts || []).find(
              (att: any) =>
                att.examId === a.examId &&
                att.userId === user.id &&
                att.status === 'GRADED'
            );
            return {
              ...a,
              examTitle: exam?.title || a.title,
              examGrade: exam?.grade || cls.grade,
              questionCount: exam?.questionIds?.length || 0,
              durationMinutes: exam?.durationMinutes || 45,
              myCompletedAttempt: myAttempt
                ? {
                    attemptId: myAttempt.id,
                    totalScore: myAttempt.totalScore,
                    submittedAt: myAttempt.submittedAt,
                  }
                : null,
            };
          });

        // Nếu là Giáo viên hoặc Admin: tổng hợp Bảng điểm lớp học (gradebook) & Câu cả lớp sai nhiều nhất
        let gradebook: any[] = [];
        let mostMissedQuestions: any[] = [];

        if (isTeacherOrAdmin) {
          const assignedExamIds = new Set(assignments.map((a: any) => a.examId));
          const studentIds = new Set(students.map((s: any) => s!.id));

          gradebook = students.map((stu: any) => {
            const scoresByExam: Record<string, number | null> = {};
            let completedCount = 0;
            let scoreSum = 0;

            for (const assign of assignments) {
              const gradedAtt = (state.attempts || []).find(
                (att: any) =>
                  att.userId === stu.id &&
                  att.examId === assign.examId &&
                  att.status === 'GRADED'
              );
              if (gradedAtt && gradedAtt.totalScore !== null && gradedAtt.totalScore !== undefined) {
                scoresByExam[assign.examId] = Number(gradedAtt.totalScore);
                completedCount += 1;
                scoreSum += Number(gradedAtt.totalScore);
              } else {
                scoresByExam[assign.examId] = null;
              }
            }

            return {
              studentId: stu.id,
              fullName: stu.fullName,
              email: stu.email,
              completedCount,
              totalAssignments: assignments.length,
              averageScore:
                completedCount > 0 ? Number((scoreSum / completedCount).toFixed(2)) : null,
              scoresByExam,
            };
          });

          // Thống kê câu hỏi cả lớp làm sai nhiều nhất (Most Missed Questions)
          const missCounter = new Map<
            string,
            { wrongCount: number; totalAttempts: number; sampleWrongAnswers: string[] }
          >();

          const classAttempts = (state.attempts || []).filter(
            (att: any) =>
              studentIds.has(att.userId) &&
              att.status === 'GRADED' &&
              (assignedExamIds.size === 0 || assignedExamIds.has(att.examId))
          );

          for (const att of classAttempts) {
            const answers = att.answers || {};
            for (const [qId, ans] of Object.entries<any>(answers)) {
              const entry = missCounter.get(qId) || {
                wrongCount: 0,
                totalAttempts: 0,
                sampleWrongAnswers: [],
              };
              entry.totalAttempts += 1;
              if (!ans?.isCorrect) {
                entry.wrongCount += 1;
                if (ans?.value && entry.sampleWrongAnswers.length < 3) {
                  entry.sampleWrongAnswers.push(String(ans.value));
                }
              }
              missCounter.set(qId, entry);
            }
          }

          mostMissedQuestions = [...missCounter.entries()]
            .filter(([, stat]) => stat.wrongCount > 0)
            .sort((a, b) => b[1].wrongCount - a[1].wrongCount)
            .slice(0, 10)
            .map(([qId, stat]) => {
              const q = (state.questions || []).find((item: any) => item.id === qId);
              return {
                questionId: qId,
                code: q?.code || qId,
                content: q?.content || '',
                topic: q?.topic || '',
                chapterId: q?.chapterId || '',
                cognitiveLevel: q?.cognitiveLevel || 'thong_hieu',
                commonMistake: q?.commonMistake || '',
                correctAnswer: q?.correctAnswer || '',
                solution: q?.solution || '',
                wrongCount: stat.wrongCount,
                totalAttempts: stat.totalAttempts,
                wrongRatePercent: Math.round((stat.wrongCount / stat.totalAttempts) * 100),
                sampleWrongAnswers: stat.sampleWrongAnswers,
              };
            });
        }

        return {
          ...cls,
          studentCount: students.length,
          students,
          assignments,
          ...(isTeacherOrAdmin ? { gradebook, mostMissedQuestions } : {}),
        };
      });

    return NextResponse.json({
      ok: true,
      classrooms: detailedClassrooms,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải dữ liệu lớp học.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body || {};

    // 1. Học sinh tham gia lớp học bằng mã joinCode 6 ký tự
    if (action === 'join_classroom') {
      const auth = await requireUser(req);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }

      const joinCode = String(body.joinCode || '')
        .trim()
        .toUpperCase();
      if (!joinCode || joinCode.length < 4) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập mã lớp hợp lệ (6 ký tự).' },
          { status: 400 }
        );
      }

      const state = auth.state;
      const cls = (state.classrooms || []).find(
        (c: any) => String(c.joinCode || '').toUpperCase() === joinCode
      );
      if (!cls) {
        return NextResponse.json(
          { ok: false, error: `Không tìm thấy lớp học nào với mã "${joinCode}".` },
          { status: 404 }
        );
      }

      const alreadyMember = (state.classroomMembers || []).some(
        (m: any) => m.classroomId === cls.id && m.studentId === auth.user.id
      );
      if (!alreadyMember) {
        state.classroomMembers.push({
          id: `CM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          classroomId: cls.id,
          studentId: auth.user.id,
          joinedAt: new Date().toISOString(),
        });
        await writeServerStateAsync(state);
      }

      return NextResponse.json({
        ok: true,
        alreadyMember,
        classroom: cls,
      });
    }

    // 2. Tạo lớp học mới (Chỉ TEACHER hoặc ADMIN)
    if (action === 'create_classroom') {
      const auth = await requireRole(req, ['TEACHER', 'ADMIN']);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }

      const name = String(body.name || '').trim();
      const grade = Number(body.grade || 8);
      if (!name) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập tên lớp học.' },
          { status: 400 }
        );
      }

      const state = auth.state;
      const existingCodes = new Set<string>(
        (state.classrooms || []).map((c: any) => String(c.joinCode || '').toUpperCase())
      );
      const customCode = body.joinCode
        ? String(body.joinCode).trim().toUpperCase().slice(0, 6)
        : '';
      const joinCode =
        customCode && customCode.length === 6 && !existingCodes.has(customCode)
          ? customCode
          : generateJoinCode(existingCodes);

      const newClassroom = {
        id: `CLASS_${Date.now()}`,
        teacherId: auth.user.id,
        name,
        grade,
        joinCode,
        description: String(body.description || `Lớp Toán ${grade} - ${name}`).trim(),
        createdAt: new Date().toISOString(),
      };

      state.classrooms.unshift(newClassroom);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        classroom: newClassroom,
      });
    }

    // 3. Giao đề thi cho lớp học kèm hạn nộp (Chỉ TEACHER hoặc ADMIN)
    if (action === 'assign_exam') {
      const auth = await requireRole(req, ['TEACHER', 'ADMIN']);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }

      const { classroomId, examId, dueDate, title } = body;
      const state = auth.state;

      const cls = (state.classrooms || []).find((c: any) => c.id === classroomId);
      if (!cls) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy lớp học.' }, { status: 404 });
      }
      const exam = (state.exams || []).find((e: any) => e.id === examId);
      if (!exam) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi để giao.' }, { status: 404 });
      }

      const assignment = {
        id: `CA_${Date.now()}`,
        classroomId: cls.id,
        examId: exam.id,
        title: String(title || exam.title).trim(),
        dueDate: dueDate || new Date(Date.now() + 7 * 86400_000).toISOString(),
        assignedBy: auth.user.id,
        createdAt: new Date().toISOString(),
      };

      state.classroomAssignments.unshift(assignment);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        assignment,
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý thao tác lớp học.' },
      { status: 500 }
    );
  }
}

'use client';

// ==============================================================================
// MathMaster THCS - Trang Lớp Học, Giao Đề & Bảng Điểm (/teacher)
// Giáo viên tạo lớp (joinCode 6 ký tự), giao đề, xem Bảng điểm & Câu sai nhiều nhất;
// Học sinh nhập mã lớp 6 ký tự để tham gia và làm bài tập được giao.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathText,
} from '@/components/MathMasterShell';

export default function TeacherAndClassroomPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form tạo lớp (TEACHER) & tham gia lớp (STUDENT)
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<number>(8);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assignExamId, setAssignExamId] = useState<string>('');
  const [assignTitle, setAssignTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function loadClassrooms() {
    setLoading(true);
    try {
      const [stateRes, clsRes, exRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/classrooms'),
        fetch('/api/exams'),
      ]);
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const clsData = await clsRes.json();
      const exData = await exRes.json();
      setUser(stateData?.state?.user || null);
      if (clsData.ok && Array.isArray(clsData.classrooms)) {
        setClassrooms(clsData.classrooms);
        if (!selectedClassId && clsData.classrooms[0]?.id) {
          setSelectedClassId(clsData.classrooms[0].id);
        }
      }
      if (exData.ok && Array.isArray(exData.exams)) {
        setExams(exData.exams);
        if (!assignExamId && exData.exams[0]?.id) {
          setAssignExamId(exData.exams[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClassrooms();
  }, []);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  async function handleCreateClassroom(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newClassName.trim()) return;
    const res = await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_classroom',
        name: newClassName.trim(),
        grade: newClassGrade,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || 'Không thể tạo lớp học.');
      return;
    }
    setMessage(`Đã tạo lớp "${data.classroom.name}" với mã tham gia: ${data.classroom.joinCode}`);
    setNewClassName('');
    setSelectedClassId(data.classroom.id);
    loadClassrooms();
  }

  async function handleJoinClassroom(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    const res = await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_classroom',
        joinCode: joinCodeInput.trim().toUpperCase(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || 'Không thể tham gia lớp học.');
      return;
    }
    setMessage(`Đã tham gia lớp "${data.classroom.name}" thành công!`);
    setJoinCodeInput('');
    setSelectedClassId(data.classroom.id);
    loadClassrooms();
  }

  async function handleAssignExam(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedClassId || !assignExamId) return;
    const res = await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign_exam',
        classroomId: selectedClassId,
        examId: assignExamId,
        title: assignTitle.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || 'Không thể giao đề cho lớp.');
      return;
    }
    setMessage('Đã giao đề kiểm tra cho lớp thành công!');
    setAssignTitle('');
    loadClassrooms();
  }

  const activeClassroom =
    classrooms.find((c) => c.id === selectedClassId) || classrooms[0] || null;

  return (
    <AppShell
      user={user}
      title={isTeacherOrAdmin ? 'Quản Lý Lớp Học & Bảng Điểm Giáo Viên' : 'Lớp Học Của Tôi'}
      subtitle={
        isTeacherOrAdmin
          ? 'Tạo mã lớp 6 ký tự, giao đề kiểm tra, theo dõi bảng điểm và thống kê câu cả lớp sai nhiều nhất'
          : 'Nhập mã lớp 6 ký tự từ giáo viên để nhận bài tập và đề kiểm tra định kỳ'
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          ✓ {message}
        </div>
      )}

      {/* Khu vực Tạo lớp (Giáo viên) & Tham gia lớp bằng mã 6 ký tự */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <form
          onSubmit={handleJoinClassroom}
          className="rounded-2xl bg-white p-4 md:p-5 border border-slate-200 shadow-sm flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              🔑 Tham gia lớp học bằng Mã Lớp (6 ký tự, ví dụ: TOAN8A)
            </label>
            <input
              type="text"
              maxLength={6}
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Nhập mã 6 ký tự..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono font-bold uppercase"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
          >
            Tham gia lớp
          </button>
        </form>

        {isTeacherOrAdmin && (
          <form
            onSubmit={handleCreateClassroom}
            className="rounded-2xl bg-white p-4 md:p-5 border border-slate-200 shadow-sm flex flex-wrap items-end gap-3"
          >
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                🏫 Tạo lớp học mới (Dành cho Giáo viên)
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ví dụ: Lớp Toán 9A - Luyện thi vào 10"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối</label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              + Tạo lớp mới
            </button>
          </form>
        )}
      </div>

      {/* Chọn lớp học */}
      <div className="flex flex-wrap gap-2 mb-5">
        {classrooms.map((cls) => (
          <button
            key={cls.id}
            type="button"
            onClick={() => setSelectedClassId(cls.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold border transition ${
              activeClassroom?.id === cls.id
                ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cls.name} (Mã: {cls.joinCode})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Đang tải thông tin lớp học...
        </div>
      ) : !activeClassroom ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Bạn chưa tham gia lớp học nào. Hãy nhập mã lớp `TOAN8A` để tham gia lớp mẫu!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thông tin lớp & Giao bài mới (Nếu là Giáo viên) */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-extrabold text-indigo-800 font-mono">
                  Mã tham gia: {activeClassroom.joinCode}
                </span>
                <span className="text-xs text-slate-500">
                  Khối {activeClassroom.grade} • {activeClassroom.studentCount} học sinh
                </span>
              </div>
              <h2 className="mt-1.5 text-base font-bold text-slate-900">
                {activeClassroom.name}
              </h2>
            </div>

            {isTeacherOrAdmin && (
              <form
                onSubmit={handleAssignExam}
                className="flex flex-wrap items-center gap-2"
              >
                <select
                  value={assignExamId}
                  onChange={(e) => setAssignExamId(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      [Lớp {ex.grade}] {ex.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="Tiêu đề bài giao (tùy chọn)..."
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  📤 Giao đề cho lớp
                </button>
              </form>
            )}
          </div>

          {/* Danh sách bài tập / đề thi được giao trong lớp */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              📋 Đề Kiểm Tra Được Giao Trong Lớp ({(activeClassroom.assignments || []).length})
            </h3>
            <div className="divide-y divide-slate-100">
              {(activeClassroom.assignments || []).map((asg: any) => (
                <div
                  key={asg.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{asg.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Hạn nộp: {String(asg.dueDate || '').slice(0, 10)} • {asg.questionCount} câu •{' '}
                      {asg.durationMinutes} phút
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {asg.myCompletedAttempt && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        Đã nộp: {asg.myCompletedAttempt.totalScore}đ
                      </span>
                    )}
                    <Link
                      href={`/exams/${asg.examId}`}
                      className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      {asg.myCompletedAttempt ? 'Làm lại đề →' : 'Làm bài ngay →'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng điểm tổng hợp & Thống kê câu cả lớp làm sai nhiều nhất (Dành cho Giáo viên / Admin) */}
          {isTeacherOrAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  📊 Bảng Điểm Tổng Hợp Của Học Sinh Trong Lớp
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-2">Học sinh</th>
                        <th className="py-2 px-2">Đã nộp</th>
                        <th className="py-2 pl-2 text-right">Điểm TB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeClassroom.gradebook || []).map((row: any) => (
                        <tr key={row.studentId}>
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-slate-900">{row.fullName}</div>
                            <div className="text-[11px] text-slate-400">{row.email}</div>
                          </td>
                          <td className="py-2.5 px-2 font-semibold text-slate-700">
                            {row.completedCount}/{row.totalAssignments} đề
                          </td>
                          <td className="py-2.5 pl-2 text-right font-extrabold text-indigo-600">
                            {row.averageScore !== null ? `${row.averageScore} đ` : 'Chưa nộp'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  ⚠️ Các Câu Hỏi Cả Lớp Làm Sai Nhiều Nhất (Cần chữa trên lớp)
                </h3>
                {(activeClassroom.mostMissedQuestions || []).length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Chưa có câu hỏi nào bị làm sai trong các bài nộp của lớp.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(activeClassroom.mostMissedQuestions || []).map((mq: any) => (
                      <div
                        key={mq.questionId}
                        className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <CognitiveBadge level={mq.cognitiveLevel} size="xs" />
                          <span className="font-bold text-rose-700">
                            Sai {mq.wrongCount}/{mq.totalAttempts} lượt ({mq.wrongRatePercent}%)
                          </span>
                        </div>
                        <div className="font-medium text-slate-900">
                          <MathText text={mq.content} />
                        </div>
                        <div className="text-slate-600">
                          <strong>Đáp án đúng:</strong> {mq.correctAnswer} •{' '}
                          <strong>Bẫy:</strong> <MathText text={mq.commonMistake} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

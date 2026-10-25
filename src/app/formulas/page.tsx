'use client';

// ==============================================================================
// MathMaster THCS - Trang Tra Cứu Nhanh Công Thức Toán THCS & Câu Hỏi Đã Lưu (/formulas)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathText,
} from '@/components/MathMasterShell';

export default function FormulasAndFavoritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'formulas' | 'favorites'>('formulas');
  const [grade, setGrade] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [formulas, setFormulas] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function loadData() {
    setLoading(true);
    try {
      const [stateRes, formRes, favRes] = await Promise.all([
        fetch('/api/state?scope=shell'),
        fetch(`/api/questions?mode=formulas&grade=${grade}&search=${encodeURIComponent(search)}`),
        fetch('/api/questions?mode=favorites'),
      ]);
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const u = stateData?.state?.user || null;
      if (u?.role === 'ADMIN') {
        router.replace('/admin/students');
        return;
      }
      const formData = await formRes.json();
      const favData = await favRes.json();
      setUser(u);
      if (formData.ok) setFormulas(formData.formulas || []);
      if (favData.ok) setFavorites(favData.questions || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [grade, search]);

  async function handleRemoveFavorite(questionId: string) {
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_favorite', questionId }),
    });
    loadData();
  }

  return (
    <AppShell
      user={user}
      title="Sổ Tay Công Thức Toán THCS & Câu Hỏi Yêu Thích"
      subtitle="Tra cứu nhanh các định lý, hằng đẳng thức, công thức Đại số - Hình học lớp 6, 7, 8, 9"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('formulas')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === 'formulas'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            📐 Công thức trọng tâm ({formulas.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('favorites')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === 'favorites'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            ⭐ Câu hỏi đã lưu ({favorites.length})
          </button>
        </div>

        {tab === 'formulas' && (
          <div className="flex items-center gap-2">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
            >
              <option value="ALL">Tất cả khối 6 - 9</option>
              <option value="6">Toán 6</option>
              <option value="7">Toán 7</option>
              <option value="8">Toán 8</option>
              <option value="9">Toán 9</option>
            </select>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm công thức (Viète, Pythagore, Thalès...)"
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs w-56"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Đang tải dữ liệu...
        </div>
      ) : tab === 'formulas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  Lớp {f.grade} • {f.chapterId || f.category || 'Trọng tâm'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{f.title || f.name}</h3>
              <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-indigo-950 border border-slate-200/80">
                <MathText text={f.formula || f.latex || f.expression} block />
              </div>
              {(f.note || f.description || f.example) && (
                <div className="text-xs text-slate-600">
                  <MathText text={f.note || f.description || f.example} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Bạn chưa lưu câu hỏi yêu thích nào. Trong khi làm bài thi, hãy bấm nút &ldquo;☆ Lưu câu hỏi&rdquo; để đánh dấu câu hay!
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    Lớp {q.grade} • {q.chapterId}
                  </span>
                  <CognitiveBadge level={q.cognitiveLevel} size="xs" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(q.id)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Bỏ lưu
                </button>
              </div>
              <div className="text-sm font-medium text-slate-900">
                <MathText text={q.content} block />
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
                <div>
                  <strong>Đáp án đúng:</strong> {q.correctAnswer}
                </div>
                <div>
                  <strong>Lời giải: </strong>
                  <MathText text={q.solution} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
        <div className="h-6 w-48 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-8 w-28 rounded-xl bg-slate-200 animate-pulse" />
      </div>
      <div className="max-w-6xl w-full mx-auto p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white border border-slate-200 p-4 space-y-2"
            >
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-7 w-16 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="h-5 w-56 rounded bg-slate-200 animate-pulse" />
          <div className="h-40 w-full rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

'use client';

// ==============================================================================
// MathMaster THCS - Component Biểu Đồ Năng Lực Cá Nhân (Nạp động qua next/dynamic)
// Tách biệt Chart.js khỏi First Load JS của trang /dashboard
// ==============================================================================

import React, { memo, useEffect, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Filler,
  Tooltip,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Filler,
  Tooltip
);

export const DashboardCharts = memo(function DashboardCharts({
  scoreTrend,
  chapterMastery,
}: {
  scoreTrend?: any[];
  chapterMastery?: any[];
}) {
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const masteryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartInstance = useRef<Chart | null>(null);
  const masteryChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (lineCanvasRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      const trend = scoreTrend || [];
      const labels =
        trend.length > 0
          ? trend.map((_: any, i: number) => `Đề #${i + 1}`)
          : ['Chưa có bài thi'];
      const scores = trend.length > 0 ? trend.map((item: any) => item.totalScore) : [0];

      lineChartInstance.current = new Chart(lineCanvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Điểm tổng (Thang 10)',
              data: scores,
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              borderWidth: 2.5,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#4f46e5',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            y: { min: 0, max: 10, ticks: { stepSize: 2 } },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    if (masteryCanvasRef.current) {
      if (masteryChartInstance.current) {
        masteryChartInstance.current.destroy();
      }
      const chapters = chapterMastery || [];
      masteryChartInstance.current = new Chart(masteryCanvasRef.current, {
        type: 'bar',
        data: {
          labels: chapters.map((c: any) => c.chapterId),
          datasets: [
            {
              label: 'Tỷ lệ đúng (%)',
              data: chapters.map((c: any) => c.accuracyPercent),
              backgroundColor: chapters.map((c: any) =>
                c.accuracyPercent < 60
                  ? '#f43f5e'
                  : c.accuracyPercent < 80
                  ? '#0284c7'
                  : '#10b981'
              ),
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    return () => {
      lineChartInstance.current?.destroy();
      masteryChartInstance.current?.destroy();
    };
  }, [scoreTrend, chapterMastery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              📈 Tiến độ điểm số (10 bài thi gần nhất)
            </h2>
            <p className="text-xs text-slate-500">Biểu đồ đường theo dõi sự tiến bộ cá nhân</p>
          </div>
        </div>
        <div className="h-56 w-full">
          <canvas ref={lineCanvasRef} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              🎯 Mức độ thành thạo từng chương (Topic Mastery)
            </h2>
            <p className="text-xs text-slate-500">
              Đỏ (&lt;60%): Cần ôn ngay • Xanh dương (60-79%): Khá • Xanh lá (≥80%): Vững
            </p>
          </div>
        </div>
        <div className="h-56 w-full">
          <canvas ref={masteryCanvasRef} />
        </div>
      </div>
    </div>
  );
});

export default DashboardCharts;

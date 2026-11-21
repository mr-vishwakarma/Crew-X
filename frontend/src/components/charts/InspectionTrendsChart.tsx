import React, { useState } from 'react';
import type { TrendPoint } from '../../services/dashboard.service';
import { Calendar, TrendingUp } from 'lucide-react';

interface InspectionTrendsChartProps {
  points: TrendPoint[];
  activeRange: number;
  onRangeChange: (days: number) => void;
  isLoading?: boolean;
}

export const InspectionTrendsChart: React.FC<InspectionTrendsChartProps> = ({
  points,
  activeRange,
  onRangeChange,
  isLoading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading || points.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-2xl animate-pulse">
        <span className="text-xs text-slate-400 font-medium">Loading telemetry analytics...</span>
      </div>
    );
  }

  // Calculate chart boundaries
  const maxVal = Math.max(...points.map((p) => Math.max(p.created, p.completed, p.pending)), 25);
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingX = 20;
  const paddingY = 20;

  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Generate SVG path points
  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + (idx / (points.length - 1)) * usableWidth;
    const y = chartHeight - paddingY - (val / maxVal) * usableHeight;
    return { x, y };
  };

  const createdPath = points
    .map((p, i) => {
      const { x, y } = getCoordinates(p.created, i);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const completedPath = points
    .map((p, i) => {
      const { x, y } = getCoordinates(p.completed, i);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // Area under completed (lime gradient)
  const firstPt = getCoordinates(points[0].completed, 0);
  const lastPt = getCoordinates(points[points.length - 1].completed, points.length - 1);
  const areaPath = `${completedPath} L ${lastPt.x} ${chartHeight - paddingY} L ${firstPt.x} ${
    chartHeight - paddingY
  } Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="w-full">
      {/* Chart Header with Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Inspection Throughput Trends</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4f22c] text-[#12141a]">
              +14.2% MoM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit creation vs. QA completion velocity across organization
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onRangeChange(days)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeRange === days
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4f22c" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#d4f22c" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="charcoalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = chartHeight - paddingY - ratio * usableHeight;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Area */}
          <path d={areaPath} fill="url(#limeGradient)" />

          {/* Created line (Charcoal dashed) */}
          <path
            d={createdPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Completed line (Lime/Charcoal solid) */}
          <path d={completedPath} fill="none" stroke="#12141a" strokeWidth="2.5" />

          {/* Interactive vertical hover indicator */}
          {hoveredIndex !== null && (
            <line
              x1={getCoordinates(0, hoveredIndex).x}
              y1={paddingY}
              x2={getCoordinates(0, hoveredIndex).x}
              y2={chartHeight - paddingY}
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const { x, y } = getCoordinates(p.completed, idx);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#d4f22c' : '#12141a'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Pill */}
        <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{hoveredPoint?.date || 'Timeline'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#12141a]" />
              <strong className="text-slate-900">{hoveredPoint?.completed ?? 0}</strong> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <strong className="text-slate-900">{hoveredPoint?.created ?? 0}</strong> Assigned
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <TrendingUp className="w-3 h-3" />
              97.2% Quality
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

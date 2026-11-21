import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  icon: LucideIcon;
  subtext?: string;
  iconColor?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'slate' | 'red';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  iconColor = 'blue',
  trend,
  isLoading = false,
  onClick,
}) => {
  const iconColorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {value !== null && value !== undefined ? value : '—'}
              </span>
              {trend && (
                <span
                  className={`text-xs font-semibold ${
                    trend.isPositive ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {trend.value}
                </span>
              )}
            </div>
          )}
          {subtext && <p className="text-xs text-slate-500 pt-0.5">{subtext}</p>}
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconColorStyles[iconColor]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

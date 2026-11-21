import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, AlertTriangle, FileCheck } from 'lucide-react';

interface StageData {
  key: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderTone: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const InspectionLifecyclePipeline: React.FC = () => {
  const navigate = useNavigate();

  const stages: StageData[] = [
    {
      key: 'ASSIGNED',
      label: 'Assigned',
      count: 14,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/70',
      borderTone: 'border-blue-200/80',
      icon: Clock,
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      count: 8,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
      borderTone: 'border-amber-200/80',
      icon: Clock,
    },
    {
      key: 'SUBMITTED',
      label: 'Submitted',
      count: 6,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50/70',
      borderTone: 'border-indigo-200/80',
      icon: FileCheck,
    },
    {
      key: 'UNDER_REVIEW',
      label: 'Under Review',
      count: 4,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/70',
      borderTone: 'border-purple-200/80',
      icon: FileCheck,
    },
    {
      key: 'APPROVED',
      label: 'Approved',
      count: 48,
      color: 'text-slate-900',
      bgColor: 'bg-[#d4f22c]/25',
      borderTone: 'border-[#d4f22c]/80',
      icon: CheckCircle2,
    },
    {
      key: 'CHANGES_REQUESTED',
      label: 'Action Needed',
      count: 2,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/70',
      borderTone: 'border-rose-200/80',
      icon: AlertTriangle,
    },
  ];

  const total = stages.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Inspection Lifecycle Pipeline</h3>
          <p className="text-xs text-slate-500">Live distribution of work order workflow states</p>
        </div>
        <button
          onClick={() => navigate('/admin/inspections')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({total})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {stages.map((st) => {
          const widthPct = (st.count / total) * 100;
          return (
            <div
              key={st.key}
              style={{ width: `${widthPct}%` }}
              className={`h-full transition-all duration-300 ${
                st.key === 'APPROVED' ? 'bg-[#d4f22c]' : st.color.replace('text-', 'bg-')
              }`}
              title={`${st.label}: ${st.count} (${Math.round(widthPct)}%)`}
            />
          );
        })}
      </div>

      {/* Stage Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {stages.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.key}
              onClick={() => navigate('/admin/inspections')}
              className={`p-3 rounded-xl border ${st.borderTone} ${st.bgColor} hover:shadow-sm transition-all cursor-pointer group select-none`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600 truncate">{st.label}</span>
                <Icon className={`w-3.5 h-3.5 ${st.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-slate-900 leading-none">{st.count}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round((st.count / total) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

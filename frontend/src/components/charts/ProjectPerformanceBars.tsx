import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectPerformanceItem } from '../../services/dashboard.service';
import { Building2, ArrowRight } from 'lucide-react';

interface ProjectPerformanceBarsProps {
  projects: ProjectPerformanceItem[];
  isLoading?: boolean;
}

export const ProjectPerformanceBars: React.FC<ProjectPerformanceBarsProps> = ({
  projects,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">No projects found for this organization.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((proj) => (
        <div
          key={proj.id}
          onClick={() => navigate(`/admin/projects/${proj.id}`)}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-slate-900 truncate">{proj.projectName}</span>
              <span className="text-[10px] text-slate-400 font-mono">({proj.projectCode})</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-extrabold text-slate-900">{proj.progress}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors" />
            </div>
          </div>

          {/* Progress track */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              style={{ width: `${proj.progress}%` }}
              className="h-full bg-[#12141a] rounded-full transition-all duration-500 relative"
            >
              {proj.progress > 80 && (
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#d4f22c]" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{proj.sitesCount} Active Site Facilities</span>
            <span>
              {proj.completedInspections}/{proj.totalInspections} Audits Verified
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

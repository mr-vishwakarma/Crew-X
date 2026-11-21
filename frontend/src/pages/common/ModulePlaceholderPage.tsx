import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { UserRole } from '../../types/auth.types';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Shield, Clock } from 'lucide-react';

interface ModulePlaceholderPageProps {
  moduleName: string;
  role: UserRole;
  description: string;
  icon: LucideIcon;
  targetPhase?: string;
  features?: string[];
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  moduleName,
  role,
  description,
  icon: Icon,
  targetPhase = 'Phase 3',
  features = [],
}) => {
  const navigate = useNavigate();

  const roleDashboard =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'SUPERVISOR'
      ? '/supervisor/dashboard'
      : '/inspector/dashboard';

  return (
    <AuthenticatedLayout title={moduleName} subtitle={`${role} Operations Workspace`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(roleDashboard)}
          >
            Back to Dashboard
          </Button>
          <Badge role={role} size="sm" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {moduleName}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {targetPhase}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Planned Capabilities & API Endpoints
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5 text-xs text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>
                Protected under <strong>{role}</strong> backend authorization middleware.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Offline-ready foundation initialized</span>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

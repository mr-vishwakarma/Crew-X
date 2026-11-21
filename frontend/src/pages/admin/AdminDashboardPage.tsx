import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Users,
  FileCheck2,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge role="ADMIN" />
                <span className="text-xs text-slate-500 font-medium">Organizational Scope</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                You are authenticated as an{' '}
                <span className="font-semibold text-slate-800">Administrator</span>. You have
                full governance over organizations, projects, supervisors, and compliance settings.
              </p>
            </div>

            <div className="shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => logout()}
                isLoading={isLoading}
                leftIcon={<LogOut className="w-4 h-4 text-slate-500" />}
                className="hover:text-red-700 hover:border-red-200 hover:bg-red-50"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Authenticated Identity
            </span>
            <p className="mt-2 text-base font-bold text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Account Status</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assigned Role
            </span>
            <p className="mt-2 text-base font-bold text-indigo-700">Administrator</p>
            <p className="text-xs text-slate-500">Role Code: ADMIN</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Access Level</span>
              <span className="font-medium text-slate-700">All Modules & Settings</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Organization Context
            </span>
            <p className="mt-2 text-base font-bold text-slate-900 font-mono text-sm">
              {user?.organizationId || 'org_nirikshan_hq'}
            </p>
            <p className="text-xs text-slate-500">Headquarters Workspace</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Security</span>
              <span className="font-medium text-slate-700">JWT HTTP-Only Session</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-900">
                Phase 1 Initialization & Authentication Foundation Complete
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
                The role-based authentication foundation, secure JWT session cookies, password
                hashing, and route protection are fully operational. Administrative management
                modules (Projects, Sites, Checklists, and Supervisors) will be provisioned in
                Phase 2.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-white/80 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Projects & Sites</span>
                </div>
                <div className="bg-white/80 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Supervisors</span>
                </div>
                <div className="bg-white/80 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span>Templates</span>
                </div>
                <div className="bg-white/80 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>System Audit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

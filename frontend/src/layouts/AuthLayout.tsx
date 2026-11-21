import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  WifiOff,
  MapPin,
  ClipboardCheck,
  Lock,
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      {/* =========================================
          LEFT BRANDING COLUMN (Desktop & Large Tablet)
          ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-slate-900 text-white flex-col justify-between p-8 xl:p-12 relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Nirikshan</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Field Inspection & Compliance
            </p>
          </div>
        </div>

        {/* Center: Brand messaging & visual showcase */}
        <div className="relative z-10 my-auto py-8 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Enterprise Audit & Quality Management
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Inspect Smarter.
              <br />
              <span className="text-blue-400">Operate Better.</span>
            </h2>

            <p className="text-sm xl:text-base text-slate-300 leading-relaxed max-w-md">
              Your unified platform for field inspections, compliance monitoring, and reliable
              offline reporting.
            </p>
          </div>

          {/* Visual: Simulated Inspection Audit Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-xs max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">ISO-9001 Safety Audit</p>
                  <p className="text-[11px] text-slate-400">Site #B-104 • Phase 1</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <WifiOff className="w-3.5 h-3.5 text-blue-400" />
                <span>Offline-Ready Queue</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>GPS Location Tagged</span>
              </div>
            </div>
          </div>

          {/* Feature list pills */}
          <div className="space-y-2.5 max-w-md">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Strict Role-Based Access Control (Admin, Supervisor, Inspector)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Secure HTTP-Only session authentication & password encryption</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>256-bit Encrypted Session</span>
          </div>
          <span>v1.0.0 (Phase 1)</span>
        </div>
      </div>

      {/* =========================================
          RIGHT FORM COLUMN (All viewports)
          ========================================= */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">Nirikshan</span>
              <span className="block text-[10px] text-slate-500 font-medium">
                Field Inspection & Compliance
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Phase 1
          </span>
        </div>

        {/* Main centered card area */}
        <div className="my-auto w-full max-w-md mx-auto py-4">{children}</div>

        {/* Bottom subtle copyright / privacy note */}
        <div className="text-center text-xs text-slate-400 pt-6">
          <p>© {new Date().getFullYear()} Nirikshan Systems. Authorized personnel access only.</p>
        </div>
      </div>
    </div>
  );
};

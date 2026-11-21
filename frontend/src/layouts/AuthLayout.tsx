import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0a0d14] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting matching the dark reference UI */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-rose-900/20 via-pink-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-blue-900/15 via-indigo-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-20">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-black shadow-md ring-1 ring-amber-500/30 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <img src="/logo.jpg" alt="Nirikshan Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white leading-none">
              NIRIKSHAN
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Field Inspection & Compliance
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Platform</span>
        </button>
      </header>

      {/* Main Center Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        {children}
      </main>

      {/* Subtle Footer */}
      <footer className="w-full px-6 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 relative z-20 gap-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>All Systems Operational • SOC 2 Type II Audited • ISO 9001 Compliant</span>
        </div>
        <div>© {new Date().getFullYear()} Nirikshan Inc. All rights reserved.</div>
      </footer>
    </div>
  );
};

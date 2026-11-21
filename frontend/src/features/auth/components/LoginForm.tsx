import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  ShieldCheck,
  HardHat,
  Info,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../../../types/auth.types';

type RoleKey = 'INSPECTOR' | 'SUPERVISOR' | 'ADMIN';

interface RolePreset {
  key: RoleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  email: string;
  pass: string;
  description: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    key: 'INSPECTOR',
    label: 'Inspector',
    icon: HardHat,
    email: 'inspector@nirikshan.com',
    pass: 'Inspector@12345',
    description: 'Offline-first field inspections & mobile audit execution',
  },
  {
    key: 'SUPERVISOR',
    label: 'Supervisor',
    icon: ShieldCheck,
    email: 'supervisor@nirikshan.com',
    pass: 'Supervisor@12345',
    description: 'Site verification, defect reviews & engineer allocations',
  },
  {
    key: 'ADMIN',
    label: 'Admin',
    icon: Building2,
    email: 'admin@nirikshan.com',
    pass: 'Admin@12345',
    description: 'Enterprise organization governance, projects & geofences',
  },
];

interface LoginFormProps {
  onSuccess?: (user?: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();

  // Default to ADMIN as explicitly requested by user to easily access dashboards
  const [selectedRole, setSelectedRole] = useState<RoleKey>('ADMIN');
  const [email, setEmail] = useState<string>('admin@nirikshan.com');
  const [password, setPassword] = useState<string>('Admin@12345');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Informative Modals
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Switch role and automatically pre-fill credentials for that role
  const handleRoleSelect = (role: RolePreset) => {
    clearError();
    setSelectedRole(role.key);
    setEmail(role.email);
    setPassword(role.pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      clearError();
      const user = await login({
        email: email.trim(),
        password: password.trim(),
        rememberMe: true,
      });
      onSuccess?.(user);
    } catch {
      // Error handled by authStore and rendered in the alert badge
    }
  };

  return (
    <div className="w-full max-w-[460px] relative">
      {/* Dark Translucent Card matching user reference UI */}
      <div className="bg-[#12151e]/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-9 shadow-2xl shadow-black/80 relative overflow-hidden">
        {/* Subtle top-left internal gradient glow */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-rose-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center relative z-10 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Role Selector Capsule Pills (Inspector, Supervisor, Admin) */}
        <div className="relative z-10 bg-[#181d27] rounded-full p-1.5 flex items-center justify-between border border-white/5 mb-6 gap-1">
          {ROLE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = selectedRole === preset.key;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleRoleSelect(preset)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#252b38] text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-[#ff4d6d]' : 'text-slate-400'
                  }`}
                />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between relative z-10 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-400 hover:text-rose-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
          {/* Email Capsule Pill */}
          <div className="h-14 rounded-full bg-[#181d27] border border-white/5 hover:border-white/15 focus-within:border-slate-400 px-5 flex items-center text-xs sm:text-sm transition-all shadow-inner">
            <span className="text-slate-400 font-bold mr-2 select-none shrink-0">
              Email:
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nirikshan.com"
              autoComplete="email"
              required
              className="bg-transparent text-white placeholder-slate-500 outline-none w-full font-medium"
            />
          </div>

          {/* Password Capsule Pill with Inline Submit Arrow */}
          <div className="h-14 rounded-full bg-[#181d27] border border-white/5 hover:border-white/15 focus-within:border-slate-400 pl-5 pr-2 flex items-center text-xs sm:text-sm transition-all justify-between shadow-inner">
            <div className="flex items-center flex-1 mr-2 overflow-hidden">
              <span className="text-slate-400 font-bold mr-2 select-none shrink-0">
                Password:
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="bg-transparent text-white placeholder-slate-500 outline-none w-full font-medium"
              />
            </div>

            {/* Right Action Icons: Eye Toggle & Vibrant Circular Submit Button */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 p-2 cursor-pointer transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {/* Glowing Pink-Red Circular Submit Button matching reference UI */}
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Submit Login"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#ff2a55] hover:from-[#ff3861] hover:to-[#e60039] text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Right Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#12151e] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest select-none">
            OR
          </span>
        </div>

        {/* Continue with Google Capsule Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="h-14 w-full rounded-full bg-[#181d27] hover:bg-[#1f2533] border border-white/5 flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-[0.99] relative z-10"
        >
          {/* Multi-color Google SVG Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Card Footer Connect Link */}
        <div className="mt-6 text-center text-xs text-slate-400 relative z-10">
          Looking to manage your project sites?{' '}
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="text-[#ff4d6d] font-semibold hover:underline cursor-pointer"
          >
            Connect with us
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Informative Modals */}
      {/* ========================================================= */}

      {/* 1. Google OAuth Notification Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#181d27] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-white">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Google Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Workspace SSO is configured for enterprise rollout in the upcoming
              release.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please use the role credentials above (<strong>Admin</strong>,{' '}
              <strong>Supervisor</strong>, or <strong>Inspector</strong>) to sign in and view
              your dashboards immediately.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Understood, Use Role Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#181d27] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-white">
                <Info className="w-5 h-5 text-[#ff4d6d]" />
                <h3 className="font-bold text-base">Credential Assistance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nirikshan operates on strict enterprise multi-tenant security policies. All user
              passwords are encrypted with bcrypt and managed by organization administrators.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              To reset credentials or request new site keys, please contact your organization
              administrator at <strong>admin@nirikshan.com</strong>.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Connect with us / Enterprise Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#181d27] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Nirikshan Enterprise Support</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Interested in onboarding new civil infrastructure projects, factory floors, or
              renewable sites?
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1.5 font-mono">
              <div className="text-slate-400">Headquarters Support:</div>
              <div className="text-white font-bold">operations@nirikshan.com</div>
              <div className="text-slate-400">Toll-Free EPC Desk: +91 (800) 928-1004</div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

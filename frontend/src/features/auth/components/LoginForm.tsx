import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, KeyRound, Info, X } from 'lucide-react';
import { loginSchema } from '../schemas/login.schema';
import type { LoginFormData } from '../schemas/login.schema';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      onSuccess?.();
    } catch {
      // Handled in store error state
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    clearError();
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your organization credentials to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <Alert
              type="error"
              title="Authentication Error"
              message={error}
              onClose={clearError}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            id="email"
            autoComplete="email"
            placeholder="e.g. inspector@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            required
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-xs text-slate-600 font-medium">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-semibold tracking-wide"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick Test Credentials (Phase 1)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@nirikshan.com', 'Admin@12345')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 text-center transition-colors cursor-pointer"
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('supervisor@nirikshan.com', 'Supervisor@12345')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 text-center transition-colors cursor-pointer"
            >
              Supervisor
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('inspector@nirikshan.com', 'Inspector@12345')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 text-center transition-colors cursor-pointer"
            >
              Inspector
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">Password Assistance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nirikshan accounts are managed by organization administrators for security and
              audit compliance.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              To reset your credentials, please contact your supervisor or organization IT
              administrator.
            </p>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowForgotModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { UserRole } from '../../types/auth.types';

interface BadgeProps {
  role?: UserRole;
  variant?: 'admin' | 'supervisor' | 'inspector' | 'neutral' | 'success';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ role, variant, children, size = 'sm' }) => {
  let appliedVariant = variant;
  let text = children;

  if (role) {
    if (role === 'ADMIN') {
      appliedVariant = 'admin';
      text = text || 'Administrator';
    } else if (role === 'SUPERVISOR') {
      appliedVariant = 'supervisor';
      text = text || 'Supervisor';
    } else {
      appliedVariant = 'inspector';
      text = text || 'Inspector';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const variantClasses = {
    admin: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold',
    supervisor: 'bg-blue-100 text-blue-800 border-blue-200 font-semibold',
    inspector: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
  };

  const selectedClass = variantClasses[appliedVariant || 'neutral'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${selectedClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {text}
    </span>
  );
};

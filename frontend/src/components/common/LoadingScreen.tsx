import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initializing Nirikshan workspace...',
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md animate-pulse">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Nirikshan</h2>
          <p className="text-xs text-slate-500 font-medium">{message}</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold pt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying secure session</span>
        </div>
      </div>
    </div>
  );
};

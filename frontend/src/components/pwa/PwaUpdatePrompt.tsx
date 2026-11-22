import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui/Button';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export const PwaUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker successfully registered:', r);
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4f22c] text-slate-950 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Application Update Ready</h4>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                A newer version of Nirikshan is available. Your local drafts will remain safe.
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={handleDismiss} className="text-[11px] py-1 px-2.5 text-white border-slate-700 hover:bg-slate-800">
            Later
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpdate}
            leftIcon={<RefreshCw className="w-3 h-3" />}
            className="text-[11px] py-1 px-3 font-bold"
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};

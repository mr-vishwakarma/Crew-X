import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Download, X, Share2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'nirikshan_pwa_install_dismissed';
const DISMISS_DAYS = 7;

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Delay prompt appearance for iOS
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Android & Chromium browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosModal(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[#12141a] text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/icons/pwa-192x192.png"
              alt="Nirikshan Logo"
              className="w-11 h-11 rounded-xl shadow-xs border border-slate-700 shrink-0 object-cover"
            />
            <div>
              <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Install Nirikshan App
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#d4f22c] text-slate-950 uppercase">
                  PWA
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Audit construction sites 100% offline with instant home screen access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="text-xs px-3 py-1.5 font-bold shadow-xs"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Dismiss for 7 days"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIosModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apple iOS requires adding Progressive Web Apps directly through Safari:
            </p>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-900 shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> icon <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> at the bottom of your Safari browser bar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-900 shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-900 shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Confirm by tapping <strong>Add</strong> in the top right corner. Nirikshan will now launch full-screen!
                </span>
              </li>
            </ol>

            <Button variant="primary" size="md" className="w-full text-xs font-bold" onClick={handleDismiss}>
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

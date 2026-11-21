import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import type { NotificationItem } from '../../services/dashboard.service';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await dashboardService.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch {
        // Fallback default
      }
    };
    fetchNotifs();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FLAG':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'SYNC':
        return <RefreshCw className="w-4 h-4 text-emerald-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#d4f22c] text-[#12141a] text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4f22c] text-[#12141a]">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 ${
                    !n.read ? 'bg-slate-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-snug">{n.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
              System notifications auto-sync with field events
            </div>
          </div>
        </>
      )}
    </div>
  );
};

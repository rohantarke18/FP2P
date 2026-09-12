import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Resolution Evidence Submitted',
    message: 'Municipal Works has submitted completion photos for CIV-2026-001024. Your citizen verification is required.',
    category: 'complaint',
    link: '/problems/CIV-2026-001024',
    read: false,
    timestamp: '2 hours ago',
  },
  {
    id: 'notif-2',
    title: 'Problem Assigned to Executive Engineer',
    message: 'Problem CIV-2026-001089 (Water supply disruption) has been dispatched to Water Supply & Sewerage Dept.',
    category: 'complaint',
    link: '/problems/CIV-2026-001089',
    read: false,
    timestamp: 'Yesterday at 4:30 PM',
  },
  {
    id: 'notif-3',
    title: 'New Policy Consultation Opened',
    message: 'Public consultation on Draft Urban Mobility & Pedestrian Safety Policy is now accepting feedback.',
    category: 'consultation',
    link: '/consultations/pol-2026-01',
    read: true,
    timestamp: '3 days ago',
  },
  {
    id: 'notif-4',
    title: 'Innovation Challenge Evaluation',
    message: 'Submissions for Traffic Congestion Mitigation Around Educational Institutions are now under review.',
    category: 'innovation',
    link: '/innovations/chal-01',
    read: true,
    timestamp: '5 days ago',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('civicbridge_notifications_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('civicbridge_notifications_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      ...item,
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const showToast = (type: Toast['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}

      {/* Toast notifications container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex-1 pr-2">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-xs font-semibold opacity-70 hover:opacity-100 p-1 cursor-pointer"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'task' | 'approval';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface NotificationContextType {
  unreadTasks: boolean;
  unreadApprovals: boolean;
  clearUnread: (type: 'TASK' | 'APPROVAL') => void;
  showToast: (title: string, message: string, type?: ToastType) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  unreadTasks: false,
  unreadApprovals: false,
  clearUnread: () => {},
  showToast: () => {},
});

const TOAST_ICONS: Record<ToastType, string> = {
  success:  '✓',
  error:    '✕',
  info:     'ℹ',
  warning:  '⚠',
  task:     '📋',
  approval: '✅',
};

const TOAST_COLORS: Record<ToastType, string> = {
  success:  'var(--success)',
  error:    'var(--danger)',
  info:     'var(--info)',
  warning:  'var(--warning)',
  task:     'var(--accent)',
  approval: 'var(--purple)',
};

const TOAST_BG: Record<ToastType, string> = {
  success:  'var(--success-subtle)',
  error:    'var(--danger-subtle)',
  info:     'var(--info-subtle)',
  warning:  'var(--warning-subtle)',
  task:     'var(--accent-subtle)',
  approval: 'var(--purple-subtle)',
};

const DURATION = 5000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadTasks, setUnreadTasks] = useState(false);
  const [unreadApprovals, setUnreadApprovals] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, DURATION);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // SSE for push notifications (task assigned / approval requested)
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'PING') return;

      if (data.type === 'TASK') {
        setUnreadTasks(true);
        showToast('New Task Assigned', data.message, 'task');
      }
      if (data.type === 'APPROVAL') {
        setUnreadApprovals(true);
        showToast('New Approval Request', data.message, 'approval');
      }
    };

    return () => { eventSource.close(); };
  }, [user, showToast]);

  const clearUnread = (type: 'TASK' | 'APPROVAL') => {
    if (type === 'TASK') setUnreadTasks(false);
    if (type === 'APPROVAL') setUnreadApprovals(false);
  };

  return (
    <NotificationContext.Provider value={{ unreadTasks, unreadApprovals, clearUnread, showToast }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 320,
              background: 'var(--bg-surface)',
              border: `1px solid var(--border)`,
              borderLeft: `3px solid ${TOAST_COLORS[toast.type]}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
              pointerEvents: 'all',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 14px 10px' }}>
              {/* Icon */}
              <div style={{
                width: 28, height: 28,
                borderRadius: 8,
                background: TOAST_BG[toast.type],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: TOAST_COLORS[toast.type],
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {TOAST_ICONS[toast.type]}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {toast.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {toast.message}
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: 16,
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                ×
              </button>
            </div>

            {/* Countdown progress bar */}
            <div style={{ height: 2, background: 'var(--border)' }}>
              <div style={{
                height: '100%',
                background: TOAST_COLORS[toast.type],
                animation: `countdown ${DURATION}ms linear forwards`,
                opacity: 0.6,
              }} />
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

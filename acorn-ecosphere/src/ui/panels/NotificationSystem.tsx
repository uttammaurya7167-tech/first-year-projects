// =============================================
// ECOSPHERE — Notification Toast System
// =============================================
import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../../store';
import type { Notification } from '../../types';

const TOAST_ICONS: Record<Notification['type'], string> = {
  info: '◉',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

const TOAST_COLORS: Record<Notification['type'], string> = {
  info: '#00ffff',
  success: '#39ff14',
  warning: '#ffa500',
  danger: '#ff3b3b',
};

const ToastItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({
  notification, onDismiss,
}) => {
  const color = TOAST_COLORS[notification.type];
  const icon = notification.emoji ?? TOAST_ICONS[notification.type];

  return (
    <div
      className="toast-enter flex items-start gap-2.5 px-3 py-2.5 rounded-xl border backdrop-blur-md max-w-xs"
      style={{
        background: `rgba(0, 10, 20, 0.85)`,
        borderColor: `${color}33`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`,
      }}
    >
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-xs font-inter text-white/70 flex-1 leading-snug">
        {notification.message}
      </span>
      <button
        onClick={onDismiss}
        className="text-white/20 hover:text-white/50 text-xs flex-shrink-0 mt-0.5 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

const NotificationSystem: React.FC = () => {
  const { notifications, dismissNotification } = useSimulationStore();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <ToastItem
            notification={n}
            onDismiss={() => dismissNotification(n.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;

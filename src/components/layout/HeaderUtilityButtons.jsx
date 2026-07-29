'use client';

import { useEffect, useRef, useState } from 'react';
import { useOrderNotifications } from '@/components/providers/OrderNotificationsProvider';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HeaderUtilityButtons() {
  const { notifications, unseenCount, markAllRead } = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const willOpen = !open;
    if (willOpen) {
      markAllRead();
    }
    setOpen(willOpen);
  };

  return (
    <div className="relative flex items-center gap-4 text-on-secondary-fixed-variant" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-sm p-2 transition-none hover:bg-surface-container-high"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unseenCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-sm border border-outline-variant bg-surface shadow-xl">
          <div className="border-b border-outline-variant px-4 py-3">
            <span className="system-label">// LIVE_ORDERS</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 font-spec-label text-xs text-secondary">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-outline-variant/50 px-4 py-3 ${
                    item.read ? 'bg-surface' : 'bg-primary/5'
                  }`}
                >
                  <p className="font-spec-label text-xs font-bold uppercase">{item.title}</p>
                  <p className="font-body-md text-sm text-on-surface">{item.message}</p>
                  <p className="mt-1 font-mono text-[10px] text-secondary">{formatTime(item.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="rounded-sm p-2 transition-none hover:bg-surface-container-high"
        aria-label="Help"
      >
        <span className="material-symbols-outlined">help_outline</span>
      </button>
    </div>
  );
}

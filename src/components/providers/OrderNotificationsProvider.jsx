'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { getAccessToken } from '@/lib/api/client';
import { getSocketApiUrl } from '@/lib/realtime/config';

const OrderNotificationsContext = createContext({
  notifications: [],
  unseenCount: 0,
  markAllRead: () => {},
  clearNotifications: () => {},
  subscribeOrderEvents: () => () => {},
});

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'Printing',
  packaging: 'Packaging',
  shipped: 'Shipped',
  rejected: 'Rejected',
};

function formatStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function buildNotification(event) {
  if (event.type === 'order:created') {
    return {
      id: `${event.type}-${event.orderId}-${event.timestamp}`,
      type: event.type,
      title: 'New order',
      message: `${event.payload.orderNumber} (${event.payload.type})`,
      timestamp: event.timestamp,
      read: false,
      payload: event.payload,
    };
  }

  return {
    id: `${event.type}-${event.orderId}-${event.timestamp}`,
    type: event.type,
    title: 'Status updated',
    message: `${event.payload.orderNumber} → ${formatStatusLabel(event.payload.status)}`,
    timestamp: event.timestamp,
    read: false,
    payload: event.payload,
  };
}

export function OrderNotificationsProvider({ children }) {
  const { tokenReady } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const listenersRef = useRef(new Set());

  const pushNotification = useCallback((event) => {
    const notification = buildNotification(event);
    setNotifications((current) => [notification, ...current].slice(0, 20));
    if (event.type === 'order:created') {
      setUnseenCount((count) => count + 1);
      toast.success(`New order: ${event.payload.orderNumber}`);
    } else {
      toast.info(`${event.payload.orderNumber} → ${formatStatusLabel(event.payload.status)}`);
    }
  }, []);

  const notifyListeners = useCallback((event) => {
    listenersRef.current.forEach((listener) => listener(event));
  }, []);

  useEffect(() => {
    if (!tokenReady) return undefined;

    const token = getAccessToken();
    if (!token) return undefined;

    const socket = io(getSocketApiUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const handleCreated = (payload) => {
      const event = {
        type: 'order:created',
        orderId: payload.orderId,
        timestamp: Date.now(),
        payload,
      };
      pushNotification(event);
      notifyListeners(event);
    };

    const handleStatusChanged = (payload) => {
      const event = {
        type: 'order:status_changed',
        orderId: payload.orderId,
        timestamp: Date.now(),
        payload,
      };
      pushNotification(event);
      notifyListeners(event);
    };

    socket.on('order:created', handleCreated);
    socket.on('order:status_changed', handleStatusChanged);

    return () => {
      socket.off('order:created', handleCreated);
      socket.off('order:status_changed', handleStatusChanged);
      socket.disconnect();
    };
  }, [tokenReady, pushNotification, notifyListeners]);

  const markAllRead = useCallback(() => {
    setUnseenCount(0);
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnseenCount(0);
  }, []);

  const subscribeOrderEvents = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unseenCount,
      markAllRead,
      clearNotifications,
      subscribeOrderEvents,
    }),
    [notifications, unseenCount, markAllRead, clearNotifications, subscribeOrderEvents]
  );

  return (
    <OrderNotificationsContext.Provider value={value}>
      {children}
    </OrderNotificationsContext.Provider>
  );
}

export function useOrderNotifications() {
  return useContext(OrderNotificationsContext);
}

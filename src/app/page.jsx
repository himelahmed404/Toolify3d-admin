'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import SectionHeader from '@/components/layout/SectionHeader';
import StatCard from '@/components/dashboard/StatCard';
import OrdersTable from '@/components/dashboard/OrdersTable';
import { useAuth } from '@/components/providers/AuthProvider';
import { useOrderNotifications } from '@/components/providers/OrderNotificationsProvider';
import { apiFetch } from '@/lib/api/client';

const STAT_CONFIG = [
  {
    key: 'pending',
    label: 'PENDING',
    subtext: 'Awaiting action',
    color: '#F59E0B',
    icon: 'pending_actions',
    statId: 'STAT_01',
  },
  {
    key: 'inProgress',
    label: 'PRINTING',
    subtext: 'On printers',
    color: '#2196F3',
    icon: 'precision_manufacturing',
    statId: 'STAT_02',
  },
  {
    key: 'packaging',
    label: 'PACKAGING',
    subtext: 'Ready to ship',
    color: '#8B5CF6',
    icon: 'inventory_2',
    statId: 'STAT_03',
  },
  {
    key: 'shippedToday',
    label: 'SHIPPED TODAY',
    subtext: 'Out for delivery',
    color: 'var(--color-brand)',
    icon: 'local_shipping',
    statId: 'STAT_04',
  },
  {
    key: 'totalOrders',
    label: 'TOTAL ORDERS',
    subtext: 'Lifetime volume',
    color: 'var(--color-dark)',
    icon: 'all_inbox',
    statId: 'STAT_05',
  },
];

function formatTodayMeta() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

export default function DashboardPage() {
  const { tokenReady } = useAuth();
  const { subscribeOrderEvents } = useOrderNotifications();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/admin/dashboard');
      setStats(data.stats);
      setRecentOrders(data.recentOrders ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    loadDashboard();
  }, [tokenReady, loadDashboard]);

  useEffect(() => {
    if (!tokenReady) return undefined;
    return subscribeOrderEvents(() => {
      loadDashboard();
    });
  }, [tokenReady, subscribeOrderEvents, loadDashboard]);

  return (
    <AdminShell>
      <AdminPageContent contentClassName="space-y-stack-lg">
        <SectionHeader
          label="// DASHBOARD"
          title="Overview"
          meta={formatTodayMeta()}
          titleClassName="font-display-lg text-display-lg normal-case"
        />

        {error ? (
          <div className="rounded-sm border border-error/30 bg-error/5 px-4 py-3 font-body-md text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="admin-reveal grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {STAT_CONFIG.map((config) => (
            <StatCard
              key={config.statId}
              value={loading ? '—' : (stats?.[config.key] ?? 0)}
              label={config.label}
              subtext={config.subtext}
              color={config.color}
              icon={config.icon}
              statId={config.statId}
            />
          ))}
        </div>

        <div className="admin-reveal">
          <OrdersTable orders={recentOrders} loading={loading} error={error} />
        </div>
      </AdminPageContent>
    </AdminShell>
  );
}

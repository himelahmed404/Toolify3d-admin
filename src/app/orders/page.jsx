'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import AdminPageContent from '@/components/layout/AdminPageContent';
import AdminSearchInput from '@/components/layout/AdminSearchInput';
import SectionHeader from '@/components/layout/SectionHeader';
import StatusTabs from '@/components/orders/StatusTabs';
import OrderCard from '@/components/orders/OrderCard';
import { useAuth } from '@/components/providers/AuthProvider';
import { useOrderNotifications } from '@/components/providers/OrderNotificationsProvider';
import { apiFetch } from '@/lib/api/client';

function buildOrdersUrl({ status, search }) {
  const params = new URLSearchParams();
  params.set('status', status);
  if (search.trim()) {
    params.set('search', search.trim());
  }
  return `/admin/orders?${params.toString()}`;
}

export default function OrdersPage() {
  const { tokenReady } = useAuth();
  const { subscribeOrderEvents } = useOrderNotifications();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadOrders = useCallback(
    async (status, search) => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch(buildOrdersUrl({ status, search }));
        setOrders(data.orders ?? []);
        setCounts(data.counts ?? {});
        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!tokenReady) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch(buildOrdersUrl({ status: activeTab, search: debouncedSearch }));
        if (cancelled) return;
        setOrders(data.orders ?? []);
        setCounts(data.counts ?? {});
        setTotal(data.total ?? 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, debouncedSearch, tokenReady]);

  useEffect(() => {
    if (!tokenReady) return undefined;

    return subscribeOrderEvents(() => {
      loadOrders(activeTab, debouncedSearch);
    });
  }, [tokenReady, subscribeOrderEvents, loadOrders, activeTab, debouncedSearch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <AdminShell>
      <AdminPageContent>
        <SectionHeader
          label="// ORDERS_OVERVIEW"
          title="Orders Management"
          meta={`SHOWING [${total}] ORDERS`}
        />

        <div className="admin-reveal">
          <AdminSearchInput
            placeholder="Search order ID, customer, product, or file..."
            className="w-full lg:w-96"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            alwaysVisible
          />
        </div>

        <div className="admin-reveal">
          <StatusTabs activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />
        </div>

        {error ? (
          <div className="admin-reveal border border-error/30 bg-error/10 px-4 py-3 font-spec-label text-xs text-error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="admin-reveal border border-outline-variant bg-white px-6 py-10 text-center font-spec-label text-sm text-secondary">
            Loading orders...
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <div className="admin-reveal border border-outline-variant bg-white px-6 py-10 text-center font-spec-label text-sm text-secondary">
            {debouncedSearch.trim() ? 'No orders match your search.' : 'No orders in this status.'}
          </div>
        ) : null}

        <div className="space-y-stack-md">
          {!loading &&
            orders.map((order, index) => (
              <div
                key={`${order.type}-${order.id}`}
                className="admin-reveal"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <OrderCard
                  order={order}
                  queuePosition={order.queuePosition}
                  defaultExpanded={index === 0}
                  dimmed={index > 0}
                  onStatusChange={() => loadOrders(activeTab, debouncedSearch)}
                />
              </div>
            ))}
        </div>
      </AdminPageContent>
    </AdminShell>
  );
}

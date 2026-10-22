'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import WhatsAppIcon from '@/components/customers/WhatsAppIcon';
import AdminSearchInput from '@/components/layout/AdminSearchInput';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiFetch } from '@/lib/api/client';
import { downloadCsv } from '@/lib/admin/exportCsv';

const PAGE_SIZE = 20;

function formatJoinedDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-CA');
}

function buildWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

function buildCustomersUrl({ search, limit, offset }) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (search.trim()) {
    params.set('search', search.trim());
  }
  return `/admin/customers?${params.toString()}`;
}

export default function CustomerLedgerTable({ searchQuery, onSearchChange }) {
  const { tokenReady } = useAuth();
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setOffset(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCustomers = useCallback(async () => {
    if (!tokenReady) return;

    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(
        buildCustomersUrl({ search: debouncedSearch, limit: PAGE_SIZE, offset })
      );
      setCustomers(data.customers ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tokenReady, debouncedSearch, offset]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + customers.length, total);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handlePrev = () => {
    setOffset((current) => Math.max(current - PAGE_SIZE, 0));
  };

  const handleNext = () => {
    if (offset + PAGE_SIZE < total) {
      setOffset((current) => current + PAGE_SIZE);
    }
  };

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);
    setError('');
    try {
      const exportLimit = total > 0 ? total : PAGE_SIZE;
      const data = await apiFetch(
        buildCustomersUrl({ search: debouncedSearch, limit: exportLimit, offset: 0 })
      );
      const rows = (data.customers ?? []).map((customer) => [
        customer.name,
        customer.email,
        customer.phone,
        customer.location,
        customer.orderCount,
        formatJoinedDate(customer.joinedAt),
      ]);

      downloadCsv('customers.csv', ['Name', 'Email', 'Phone', 'Location', 'Orders', 'Joined'], rows);
    } catch (err) {
      setError(err.message || 'Failed to export customers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="admin-reveal overflow-hidden rounded-sm border border-outline-variant bg-surface-container-lowest">
      <div className="flex flex-col justify-between gap-4 border-b border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
        <AdminSearchInput
          placeholder="Search name, email, or phone..."
          className="w-full sm:w-72 lg:w-96"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          alwaysVisible
        />

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || loading}
          className="flex items-center gap-1 rounded-sm border border-outline-variant px-3 py-1 font-spec-label text-xs text-on-surface transition-none hover:bg-surface-container-high disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {exporting ? 'EXPORTING...' : 'EXPORT_CSV'}
        </button>
      </div>

      {error ? (
        <div className="border-b border-outline-variant bg-error/5 px-4 py-3 font-body-md text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="data-table w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-dark font-spec-label text-[13px] uppercase tracking-wider text-white">
              {['Name', 'Email', 'Phone', 'Location', 'Orders', 'Joined', 'Action'].map((heading, index) => (
                <th
                  key={heading}
                  className={`whitespace-nowrap px-6 py-4 font-medium ${
                    index === 4 || index === 6 ? 'text-right' : ''
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant font-body-md text-sm text-on-surface">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Loading customers...
                </td>
              </tr>
            ) : null}

            {!loading && customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  No customers found.
                </td>
              </tr>
            ) : null}

            {!loading
              ? customers.map((customer, index) => {
                  const whatsappUrl = buildWhatsAppUrl(customer.phone);

                  return (
                    <tr
                      key={index}
                      className={`transition-colors hover:bg-surface-container-low ${
                        index % 2 === 1 ? 'bg-surface-container-highest/20' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium">{customer.name || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-price-display text-[13px] text-on-surface-variant">
                        {customer.email || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-price-display text-[13px]">{customer.phone || '—'}</span>
                          {whatsappUrl ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-container transition-colors hover:text-primary"
                              title="Message on WhatsApp"
                            >
                              <WhatsAppIcon />
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{customer.location || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-price-display">
                        {customer.orderCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[13px] text-on-surface-variant">
                        {formatJoinedDate(customer.joinedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href="#"
                          className="inline-flex items-center gap-1 rounded-sm border border-transparent px-2 py-1 font-spec-label text-xs text-primary-container transition-colors hover:border-primary hover:text-primary"
                        >
                          VIEW_ORDERS
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-outline-variant bg-surface-container-lowest p-4 text-sm font-body-md sm:flex-row sm:items-center">
        <span className="text-on-surface-variant">
          {total === 0
            ? 'Showing 0 entries'
            : `Showing ${pageStart} to ${pageEnd} of ${total} entries`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={offset === 0 || loading}
            className="rounded-sm border border-outline-variant px-3 py-1 transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Prev
          </button>
          <span className="rounded-sm border border-primary bg-primary px-3 py-1 text-white">
            {currentPage}
          </span>
          {totalPages > 1 ? (
            <span className="px-2 text-on-surface-variant">of {totalPages}</span>
          ) : null}
          <button
            type="button"
            onClick={handleNext}
            disabled={offset + PAGE_SIZE >= total || loading}
            className="rounded-sm border border-outline-variant px-3 py-1 transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

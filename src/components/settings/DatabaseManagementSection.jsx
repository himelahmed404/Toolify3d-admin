'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiFetch } from '@/lib/api/client';
import { downloadCsv } from '@/lib/admin/exportCsv';
import { downloadExcel } from '@/lib/admin/exportExcel';

const PRODUCT_HEADERS = [
  'Name',
  'Product ID',
  'Price',
  'Material',
  'Category',
  'Available',
  'Featured',
  'Weight',
  'Print Time',
  'Layer Height',
  'Specs',
  'Description',
  'Created',
];

const CUSTOMER_HEADERS = ['Name', 'Email', 'Phone', 'Location', 'Orders', 'Joined'];

/** Soft visual capacity reference for the status bar (5 GB). Not a hard quota. */
const STORAGE_BAR_CAP_BYTES = 5 * 1024 * 1024 * 1024;

function formatJoinedDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-CA');
}

function formatCreatedDate(value) {
  if (!value) return '';
  return new Date(value).toISOString();
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function mapProductRows(products) {
  return products.map((product) => [
    product.name,
    product.productId ?? '',
    product.price,
    product.material,
    product.category,
    product.available ? 'Yes' : 'No',
    product.featured ? 'Yes' : 'No',
    product.weight ?? '',
    product.printTime ?? '',
    product.layerHeight ?? '',
    product.specs ?? '',
    product.description ?? '',
    formatCreatedDate(product.createdAt),
  ]);
}

function mapCustomerRows(customers) {
  return customers.map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.location,
    customer.orderCount,
    formatJoinedDate(customer.joinedAt),
  ]);
}

function FirebaseStorageStatusBar({ stats, loading, error, onRefresh, disabled }) {
  const fileCount = stats?.fileCount ?? 0;
  const totalBytes = stats?.totalBytes ?? 0;
  const percent = Math.min(100, Math.round((totalBytes / STORAGE_BAR_CAP_BYTES) * 100));
  const sourceLabel = stats?.source === 'firebase' ? 'live Firebase' : stats?.source === 'mongo' ? 'Mongo estimate' : '—';

  return (
    <div className="space-y-2 border border-error/40 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-spec-label text-[10px] uppercase text-error">Firebase STL Storage</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled || loading}
          className="inline-flex items-center gap-1 font-spec-label text-[10px] uppercase text-on-surface-variant transition-colors hover:text-error disabled:opacity-50"
          title="Refresh storage stats"
        >
          <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          Refresh
        </button>
      </div>

      {error ? (
        <p className="font-body-md text-xs text-error">{error}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-price-display text-lg leading-none text-on-surface">
                {loading && !stats ? '…' : formatBytes(totalBytes)}
              </p>
              <p className="mt-1 font-spec-label text-[10px] uppercase text-on-surface-variant">
                {loading && !stats ? 'Loading…' : `${fileCount} file${fileCount === 1 ? '' : 's'} · ${sourceLabel}`}
              </p>
            </div>
            <p className="font-spec-label text-[10px] uppercase text-on-surface-variant">
              {percent}% of 5 GB gauge
            </p>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-sm bg-error/15"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Firebase STL storage usage"
          >
            <div
              className="h-full bg-error transition-[width] duration-300"
              style={{ width: `${loading && !stats ? 0 : percent}%` }}
            />
          </div>

          {stats?.warning ? (
            <p className="font-body-md text-[11px] text-on-surface-variant">{stats.warning}</p>
          ) : null}
        </>
      )}
    </div>
  );
}

function ConfirmDeleteModal({ open, title, description, confirmLabel, onConfirm, onClose, confirming }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !confirming) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, confirming]);

  if (!open) return null;

  const canConfirm = confirmText === 'DELETE' && !confirming;

  return (
    <div className="fixed inset-0 z-100">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={confirming ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-error bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="border-b border-error/30 bg-error/5 px-6 py-4">
          <span className="system-label mb-1 block text-error">// CONFIRM_DELETE</span>
          <h2 id="confirm-delete-title" className="font-headline-sm text-headline-sm text-on-surface">
            {title}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="font-body-md text-sm text-on-surface-variant">{description}</p>
          <label className="block space-y-2">
            <span className="font-spec-label text-xs uppercase text-on-surface-variant">
              Type DELETE to confirm
            </span>
            <input
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              disabled={confirming}
              placeholder="DELETE"
              className="admin-input w-full px-4 py-3 font-spec-label text-sm"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-outline-variant px-6 py-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-error px-4 py-2.5 font-spec-label text-xs uppercase text-white disabled:opacity-50"
          >
            {confirming ? 'Deleting…' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="flex-1 border border-outline-variant px-4 py-2.5 font-spec-label text-xs uppercase text-on-surface transition-colors hover:bg-surface-variant disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DatabaseManagementSection() {
  const { tokenReady } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageError, setStorageError] = useState('');

  const loadStorageStats = useCallback(async () => {
    if (!tokenReady) return;

    setStorageLoading(true);
    setStorageError('');
    try {
      const data = await apiFetch('/admin/database/firebase-stl/stats');
      setStorageStats(data);
    } catch (err) {
      setStorageError(err.message || 'Failed to load Firebase storage stats');
      setStorageStats(null);
    } finally {
      setStorageLoading(false);
    }
  }, [tokenReady]);

  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  const runWithBusy = useCallback(async (task) => {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
    }
  }, []);

  const handleDeleteFirebaseStl = async () => {
    await runWithBusy(async () => {
      try {
        const data = await apiFetch('/admin/database/firebase-stl', { method: 'DELETE' });
        const { deletedCount = 0, failedCount = 0 } = data ?? {};
        if (failedCount > 0) {
          toast.warning(`Deleted ${deletedCount} STL file(s); ${failedCount} failed.`);
        } else {
          toast.success(`Deleted ${deletedCount} STL file(s) from Firebase.`);
        }
        setConfirmAction(null);
        await loadStorageStats();
      } catch (err) {
        toast.error(err.message || 'Failed to delete STL files');
      }
    });
  };

  const handleDeleteAllProducts = async () => {
    await runWithBusy(async () => {
      try {
        const data = await apiFetch('/admin/database/products', { method: 'DELETE' });
        toast.success(`Deleted ${data?.deletedCount ?? 0} product(s) from MongoDB.`);
        setConfirmAction(null);
      } catch (err) {
        toast.error(err.message || 'Failed to delete products');
      }
    });
  };

  const handleExportProducts = async (format) => {
    if (!tokenReady || busy) return;

    await runWithBusy(async () => {
      try {
        const products = await apiFetch('/products?includeUnavailable=true');
        const rows = mapProductRows(Array.isArray(products) ? products : []);
        const filename = 'products';

        if (format === 'csv') {
          downloadCsv(`${filename}.csv`, PRODUCT_HEADERS, rows);
        } else {
          downloadExcel(`${filename}.xlsx`, PRODUCT_HEADERS, rows);
        }

        toast.success(`Exported ${rows.length} product(s) as ${format.toUpperCase()}.`);
      } catch (err) {
        toast.error(err.message || 'Failed to export products');
      }
    });
  };

  const handleExportCustomers = async (format) => {
    if (!tokenReady || busy) return;

    await runWithBusy(async () => {
      try {
        const data = await apiFetch('/admin/database/export/customers');
        const customers = data?.customers ?? [];
        const rows = mapCustomerRows(customers);
        const filename = 'customers';

        if (format === 'csv') {
          downloadCsv(`${filename}.csv`, CUSTOMER_HEADERS, rows);
        } else {
          downloadExcel(`${filename}.xlsx`, CUSTOMER_HEADERS, rows);
        }

        toast.success(`Exported ${rows.length} customer(s) as ${format.toUpperCase()}.`);
      } catch (err) {
        toast.error(err.message || 'Failed to export customers');
      }
    });
  };

  const confirmModalProps =
    confirmAction === 'firebase-stl'
      ? {
          title: 'Delete All STL Files (Firebase)',
          description:
            'This permanently removes all custom-order STL/OBJ files from Firebase Storage. MongoDB order records will remain, but download links will stop working.',
          confirmLabel: 'Delete STL Files',
          onConfirm: handleDeleteFirebaseStl,
        }
      : confirmAction === 'products'
        ? {
            title: 'Delete All Products (MongoDB)',
            description:
              'This permanently removes every product from the catalog. This cannot be undone.',
            confirmLabel: 'Delete All Products',
            onConfirm: handleDeleteAllProducts,
          }
        : null;

  return (
    <>
      <section className="admin-reveal space-y-6">
        <span className="system-label">// DATABASE_MANAGEMENT</span>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="technical-border space-y-4 border-error bg-error/5 p-6">
            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-error">Delete Zone</h2>
              <p className="font-spec-label text-sm text-on-surface-variant">
                Irreversible destructive actions. Confirmation required.
              </p>
            </div>

            <div className="space-y-3">
              <FirebaseStorageStatusBar
                stats={storageStats}
                loading={storageLoading}
                error={storageError}
                onRefresh={loadStorageStats}
                disabled={busy || !tokenReady}
              />

              <button
                type="button"
                onClick={() => setConfirmAction('firebase-stl')}
                disabled={busy || !tokenReady}
                className="flex w-full items-center justify-between gap-3 border border-error bg-white px-4 py-3 font-spec-label text-xs uppercase text-error transition-colors hover:bg-error/10 disabled:opacity-50"
              >
                <span>Delete All STL Files (Firebase)</span>
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmAction('products')}
                disabled={busy || !tokenReady}
                className="flex w-full items-center justify-between gap-3 border border-error bg-white px-4 py-3 font-spec-label text-xs uppercase text-error transition-colors hover:bg-error/10 disabled:opacity-50"
              >
                <span>Delete All Products (MongoDB)</span>
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              </button>
            </div>
          </div>

          <div className="technical-border space-y-4 border-emerald-600 bg-emerald-50 p-6">
            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-emerald-800">Download Zone</h2>
              <p className="font-spec-label text-sm text-emerald-900/70">
                Export catalog and customer data as CSV or Excel.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="font-spec-label text-[10px] uppercase text-emerald-800">Products</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportProducts('csv')}
                    disabled={busy || !tokenReady}
                    className="flex flex-1 items-center justify-center gap-1 border border-emerald-600 bg-white px-3 py-2 font-spec-label text-[10px] uppercase text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportProducts('excel')}
                    disabled={busy || !tokenReady}
                    className="flex flex-1 items-center justify-center gap-1 border border-emerald-600 bg-white px-3 py-2 font-spec-label text-[10px] uppercase text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Excel
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-spec-label text-[10px] uppercase text-emerald-800">Customers</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportCustomers('csv')}
                    disabled={busy || !tokenReady}
                    className="flex flex-1 items-center justify-center gap-1 border border-emerald-600 bg-white px-3 py-2 font-spec-label text-[10px] uppercase text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCustomers('excel')}
                    disabled={busy || !tokenReady}
                    className="flex flex-1 items-center justify-center gap-1 border border-emerald-600 bg-white px-3 py-2 font-spec-label text-[10px] uppercase text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDeleteModal
        open={Boolean(confirmModalProps)}
        title={confirmModalProps?.title ?? ''}
        description={confirmModalProps?.description ?? ''}
        confirmLabel={confirmModalProps?.confirmLabel ?? 'Delete'}
        onConfirm={confirmModalProps?.onConfirm ?? (() => {})}
        onClose={() => {
          if (!busy) setConfirmAction(null);
        }}
        confirming={busy}
      />
    </>
  );
}

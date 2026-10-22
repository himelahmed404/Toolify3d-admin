'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import ProductModal from '@/components/products/ProductModal';

const statusStyles = {
  'in-progress': 'border-[#2196F3]/30 bg-[#2196F3]/10 text-[#2196F3]',
  packaging: 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]',
  pending: 'border-warning/30 bg-warning/10 text-warning',
  shipped: 'border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954]',
  rejected: 'border-error/30 bg-error/10 text-error',
};

const statusLabels = {
  'in-progress': '[PRINTING]',
  packaging: '[PACKAGING]',
  pending: '[PENDING_REVIEW]',
  shipped: '[SHIPPED]',
  rejected: '[REJECTED]',
};

function getStatusStyle(status) {
  return statusStyles[status] || statusStyles.pending;
}

function getStatusLabel(status) {
  return statusLabels[status] || `[${String(status || 'pending').toUpperCase()}]`;
}

function formatOrderPrice(order, amount) {
  const value = amount ?? order.price;
  if (typeof value === 'string') return value;
  const prefix = order.currency === 'BDT' ? '৳' : order.currency || '৳';
  return `${prefix} ${Number(value).toFixed(2)}`;
}

function formatLineTotal(order, item) {
  if (typeof item.unitPrice !== 'number') return '—';
  const qty = item.quantity ?? 1;
  return formatOrderPrice(order, item.unitPrice * qty);
}

export default function OrderCard({
  order,
  queuePosition,
  defaultExpanded = false,
  dimmed = false,
  onStatusChange,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [updating, setUpdating] = useState('');
  const [error, setError] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState('');

  const showPendingActions = order.status === 'pending';
  const showInProgressActions = order.status === 'in-progress';
  const showPackagingActions = order.status === 'packaging';

  async function handleStatusUpdate(status) {
    setUpdating(status);
    setError('');
    try {
      await apiFetch(`/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ type: order.type, status }),
      });
      onStatusChange?.();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating('');
    }
  }

  async function handleViewProduct(productMongoId) {
    if (!productMongoId) return;

    setLoadingProductId(productMongoId);
    setError('');
    try {
      const product = await apiFetch(`/products/${productMongoId}`);
      setViewingProduct(product);
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoadingProductId('');
    }
  }

  const orderItems = order.orderItems?.length
    ? order.orderItems
    : order.type === 'custom' && order.fileName
      ? [
          {
            index: 1,
            itemType: 'custom',
            name: order.product,
            fileName: order.fileName,
            fileUrl: order.fileUrl,
            material: order.material,
            weight: order.weight,
            quantity: order.qty,
            unitPrice: order.price,
          },
        ]
      : order.productItems?.length
        ? order.productItems.map((item) => ({ ...item, itemType: 'product' }))
        : order.productMongoId
          ? [
              {
                index: 1,
                itemType: 'product',
                productMongoId: order.productMongoId,
                catalogProductId: order.catalogProductId,
                name: order.product,
              },
            ]
          : [];

  return (
    <>
      <div
        className={`technical-border flex flex-col gap-6 bg-white p-6 ${dimmed ? 'opacity-70' : ''}`}
      >
        <div className="flex items-center justify-between border-b border-dashed border-outline-variant pb-4">
          <div className="flex items-center gap-4">
            {queuePosition ? (
              <span className="border border-outline-variant bg-surface px-2 py-1 font-spec-label text-xs uppercase text-secondary">
                QUEUE #{queuePosition}
              </span>
            ) : null}
            <h3 className="font-display text-xl font-bold">{order.orderNumber || order.id}</h3>
            <span
              className={`border px-2 py-1 font-spec-label text-xs uppercase ${getStatusStyle(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </span>
            <span className="font-spec-label text-base font-bold text-primary">
              {formatOrderPrice(order)}
            </span>
          </div>
          <div className="flex items-center gap-4 font-spec-label text-sm text-secondary">
            <span>{order.timestamp}</span>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="transition-none hover:text-primary"
              aria-label={expanded ? 'Collapse order' : 'Expand order'}
              aria-expanded={expanded}
            >
              <span
                className="material-symbols-outlined transition-transform"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>
          </div>
        </div>

        {expanded && (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <p className="mb-2 font-spec-label text-xs uppercase text-primary">{'// PRINT_SPECIFICATIONS'}</p>
                <h4 className="mb-4 text-lg font-bold">{order.product}</h4>

                <table className="mb-4 w-full border border-outline-variant text-left font-body-md text-sm">
                  <thead className="bg-surface-variant font-spec-label text-xs text-secondary">
                    <tr>
                      {['MATERIAL', 'WEIGHT', 'QTY', 'PRICE'].map((heading, index) => (
                        <th
                          key={heading}
                          className={`p-2 ${index < 3 ? 'border-r border-outline-variant' : 'text-right'}`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length > 0 ? (
                      orderItems.map((item) => (
                        <tr key={`${item.itemType}-${item.index}`} className="border-t border-outline-variant">
                          <td className="border-r border-outline-variant p-2">{item.material || '—'}</td>
                          <td className="border-r border-outline-variant p-2">{item.weight || '—'}</td>
                          <td className="border-r border-outline-variant p-2">{item.quantity ?? 1}</td>
                          <td className="p-2 text-right font-spec-label font-bold">
                            {formatLineTotal(order, item)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-outline-variant">
                        <td className="border-r border-outline-variant p-2">{order.material}</td>
                        <td className="border-r border-outline-variant p-2">{order.weight}</td>
                        <td className="border-r border-outline-variant p-2">{order.qty}</td>
                        <td className="p-2 text-right font-spec-label font-bold">
                          {formatOrderPrice(order)}
                        </td>
                      </tr>
                    )}
                    {orderItems.length > 1 ? (
                      <tr className="border-t-2 border-outline-variant bg-surface-variant/50">
                        <td
                          colSpan={3}
                          className="border-r border-outline-variant p-2 text-right font-spec-label text-xs uppercase text-secondary"
                        >
                          Order Total
                        </td>
                        <td className="p-2 text-right font-spec-label text-base font-bold text-primary">
                          {formatOrderPrice(order)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>

                {order.notes ? (
                  <div className="mb-4 border border-outline-variant bg-surface p-3">
                    <p className="mb-1 font-spec-label text-xs text-secondary">CUSTOMER_NOTES:</p>
                    <p className="text-sm italic">&ldquo;{order.notes}&rdquo;</p>
                  </div>
                ) : null}

                {orderItems.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {orderItems.map((item) => {
                      const isCustom = item.itemType === 'custom';
                      const isLoading = loadingProductId === item.productMongoId;

                      return (
                        <div
                          key={`${item.itemType}-${item.index}-${item.productMongoId || item.fileName}`}
                          className="group flex gap-3 rounded-sm border border-outline-variant bg-surface p-4 transition-colors hover:border-primary"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-outline-variant bg-surface-variant">
                            <span className="font-mono text-xs text-on-surface-variant">
                              {String(item.index).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-display text-base font-semibold text-on-surface">
                                  {item.name || (isCustom ? 'Custom print' : 'Product')}
                                </p>
                                {isCustom ? (
                                  <p className="font-mono text-xs uppercase text-primary">Custom STL</p>
                                ) : item.catalogProductId ? (
                                  <p className="font-mono text-xs text-on-surface-variant">
                                    {item.catalogProductId}
                                  </p>
                                ) : null}
                              </div>
                              {!isCustom ? (
                                <button
                                  type="button"
                                  onClick={() => handleViewProduct(item.productMongoId)}
                                  disabled={Boolean(loadingProductId)}
                                  className="inline-flex shrink-0 items-center gap-1 font-mono text-xs uppercase text-primary transition-colors hover:text-primary-container disabled:opacity-60"
                                >
                                  {isLoading ? 'Loading...' : 'View'}
                                  {!isLoading ? (
                                    <span className="material-symbols-outlined text-[14px]">
                                      arrow_forward
                                    </span>
                                  ) : null}
                                </button>
                              ) : null}
                            </div>

                            {isCustom && item.fileName ? (
                              <a
                                href={item.fileUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-spec-label text-sm text-primary hover:underline"
                              >
                                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                {'// FILE_ATTACHED: '}
                                {item.fileName}
                              </a>
                            ) : null}

                            {!isCustom && (item.color?.label || item.customText) ? (
                              <div className="flex flex-wrap items-center gap-2 rounded-sm border border-outline-variant bg-white p-2">
                                {item.color?.label ? (
                                  <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                                    <span
                                      className="inline-block h-5 w-5 shrink-0 rounded-sm border border-outline-variant"
                                      style={{ background: item.color.hex }}
                                      aria-hidden="true"
                                    />
                                    {item.color.label}
                                  </span>
                                ) : null}
                                {item.color?.label && item.customText ? (
                                  <span className="text-on-surface-variant">|</span>
                                ) : null}
                                {item.customText ? (
                                  <p className="text-sm italic text-on-surface-variant">
                                    Note: &ldquo;{item.customText}&rdquo;
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="border border-outline-variant bg-surface-variant/30 p-4">
                <p className="mb-4 font-spec-label text-xs uppercase text-primary">{'// CUSTOMER_INFO'}</p>
                <div className="space-y-3 font-body-md text-sm">
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="font-spec-label text-secondary">NAME</span>
                    <span className="font-bold">{order.customer.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="font-spec-label text-secondary">EMAIL</span>
                    <span>{order.customer.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="font-spec-label text-secondary">PHONE</span>
                    <div className="flex items-center gap-2">
                      <span>{order.customer.phone}</span>
                      <span className="material-symbols-outlined text-[16px] text-green-600">chat</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-spec-label text-secondary">ADDRESS</span>
                    <span className="text-right">
                      {order.customer.address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="border border-error/30 bg-error/10 px-4 py-3 font-spec-label text-xs text-error">
                {error}
              </div>
            ) : null}

            <div className="mt-2 flex items-center justify-between border border-outline-variant bg-surface p-4 pt-4">
              <span className="font-spec-label text-xs text-secondary">PLACED: {order.placed}</span>
              {(showPendingActions || showInProgressActions || showPackagingActions) && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={Boolean(updating)}
                    className="rounded-sm border border-error px-4 py-2 font-spec-label text-sm uppercase text-error transition-none hover:bg-error/10 disabled:opacity-60"
                  >
                    {updating === 'rejected' ? 'Rejecting...' : '[Reject Order]'}
                  </button>
                  {showPendingActions ? (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('in-progress')}
                      disabled={Boolean(updating)}
                      className="btn-primary flex items-center gap-2 rounded-sm px-6 py-2 font-spec-label text-sm uppercase transition-none disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      {updating === 'in-progress' ? 'Updating...' : '[Mark Printing]'}
                    </button>
                  ) : null}
                  {showInProgressActions ? (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('packaging')}
                      disabled={Boolean(updating)}
                      className="btn-primary flex items-center gap-2 rounded-sm px-6 py-2 font-spec-label text-sm uppercase transition-none disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                      {updating === 'packaging' ? 'Updating...' : '[Mark Packaging]'}
                    </button>
                  ) : null}
                  {showPackagingActions ? (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('shipped')}
                      disabled={Boolean(updating)}
                      className="btn-primary flex items-center gap-2 rounded-sm px-6 py-2 font-spec-label text-sm uppercase transition-none disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                      {updating === 'shipped' ? 'Updating...' : '[Mark Shipped]'}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {viewingProduct ? (
        <ProductModal product={viewingProduct} onClose={() => setViewingProduct(null)} />
      ) : null}
    </>
  );
}

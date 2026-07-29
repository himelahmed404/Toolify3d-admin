'use client';

import { useEffect, useState } from 'react';
import ProductForm from '@/components/products/ProductForm';
import { apiFetch } from '@/lib/api/client';

export default function EditProductModal({ open, product, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open || !product) return null;

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const updated = await apiFetch(`/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message || 'Failed to save product');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => (submitting ? null : onClose())}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 flex max-h-[92vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-outline-variant bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
      >
        <div className="flex items-start justify-between border-b border-outline-variant px-6 py-4">
          <div>
            <span className="system-label mb-1 block">{'// EDIT_PRODUCT'}</span>
            <h2 id="edit-product-title" className="font-headline-sm text-headline-sm text-on-surface">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => (submitting ? null : onClose())}
            aria-label="Close"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <ProductForm
            key={product.id}
            initialProduct={product}
            submitting={submitting}
            error={error}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

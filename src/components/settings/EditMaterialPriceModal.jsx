'use client';

import { useEffect, useRef, useState } from 'react';
import { STOCK_STATUS_OPTIONS } from '@/components/settings/materialStock';

const TIER_LABELS = ['≤50g', '≤100g'];

function TierPriceInputs({ tiers, onChange }) {
  return (
    <div className="space-y-4">
      {tiers.map((tier, index) => (
        <div key={tier.maxWeightG ?? 'overflow'} className="space-y-2 rounded-sm border border-outline-variant p-4">
          <span className="font-spec-label text-xs uppercase text-on-surface-variant">
            {TIER_LABELS[index]} tier
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-spec-label text-[10px] uppercase text-on-surface-variant">Regular (৳/g)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tier.regularPricePerGram}
                onChange={(e) => onChange(index, 'regularPricePerGram', e.target.value)}
                className="admin-input w-full px-3 py-2 font-spec-label text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-spec-label text-[10px] uppercase text-on-surface-variant">Discount (৳/g)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tier.discountedPricePerGram}
                onChange={(e) => onChange(index, 'discountedPricePerGram', e.target.value)}
                className="admin-input w-full px-3 py-2 font-spec-label text-sm"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EditMaterialPriceModal({
  open,
  material,
  tiers,
  stockStatus,
  stockKg,
  discountEnabled,
  onTierChange,
  onStockStatusChange,
  onStockKgChange,
  onDiscountEnabledChange,
  onSave,
  onClose,
  saving,
}) {
  const inputRef = useRef(null);
  const showStockAmount = stockStatus === 'in_stock' || stockStatus === 'low_stock';

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !material) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-outline-variant bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-material-price-title"
      >
        <div className="border-b border-outline-variant px-6 py-4">
          <span className="system-label mb-1 block">// EDIT_MATERIAL</span>
          <h2 id="edit-material-price-title" className="font-headline-sm text-headline-sm text-on-surface">
            {material.name}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TierPriceInputs tiers={tiers} onChange={onTierChange} />

          <label className="flex items-center justify-between gap-4 rounded-sm border border-outline-variant px-4 py-3">
            <span className="font-spec-label text-xs uppercase text-on-surface-variant">
              Discount enabled for this material
            </span>
            <input
              ref={inputRef}
              type="checkbox"
              checked={discountEnabled}
              onChange={(e) => onDiscountEnabledChange(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>

          <label className="block space-y-2">
            <span className="font-spec-label text-xs uppercase text-on-surface-variant">Stock Status</span>
            <select
              value={stockStatus}
              onChange={(event) => onStockStatusChange(event.target.value)}
              className="admin-input w-full px-4 py-3 font-spec-label text-sm text-on-surface"
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {showStockAmount && (
            <label className="block space-y-2">
              <span className="font-spec-label text-xs uppercase text-on-surface-variant">Stock Amount (kg)</span>
              <div className="flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-4 py-3">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stockKg}
                  onChange={(event) => onStockKgChange(event.target.value)}
                  className="w-full border-none bg-transparent font-spec-label text-sm text-on-surface focus:outline-none"
                />
                <span className="font-spec-label text-xs uppercase text-on-surface-variant">kg</span>
              </div>
            </label>
          )}
        </div>

        <div className="flex gap-3 border-t border-outline-variant px-6 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-primary flex-1 px-4 py-2.5 font-spec-label text-xs uppercase disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-outline-variant px-4 py-2.5 font-spec-label text-xs uppercase text-on-surface transition-colors hover:bg-surface-variant"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

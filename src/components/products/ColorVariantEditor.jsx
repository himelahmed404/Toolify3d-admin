'use client';

import { useRef, useState } from 'react';
import { COLOR_LABELS, createEmptyColorRow } from '@/components/products/productCatalog';

export default function ColorVariantEditor({ value = [], onChange, disabled = false }) {
  const inputRefs = useRef({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState('');

  const colors = Array.isArray(value) && value.length ? value : [createEmptyColorRow()];

  const updateAt = (index, patch) => {
    onChange(colors.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeAt = (index) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= colors.length) return;
    const next = [...colors];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const uploadImage = async (index, fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploadingIndex(index);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await fetch('/api/upload/imagebb', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      const url = json.urls?.[0];
      if (url) updateAt(index, { image: url });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingIndex(null);
      const input = inputRefs.current[index];
      if (input) input.value = '';
    }
  };

  const handleHexChange = (index, hexValue) => {
    const hex = hexValue.trim().toLowerCase();
    const existingLabel = colors[index]?.label?.trim();
    updateAt(index, {
      hex,
      label: existingLabel || COLOR_LABELS[hex] || hex,
    });
  };

  return (
    <div className="space-y-3">
      {colors.map((color, index) => {
        const isUploading = uploadingIndex === index;
        const isLight = ['#ffffff', '#fff', 'white'].includes((color.hex || '').toLowerCase());

        return (
          <div
            key={`color-row-${index}`}
            className="border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-spec-label text-[10px] uppercase text-secondary">
                {index === 0 ? 'Default color (card thumbnail)' : `Color ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label="Move color up"
                  className="flex h-7 w-7 items-center justify-center text-secondary transition-colors hover:text-primary disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={disabled || index === colors.length - 1}
                  aria-label="Move color down"
                  className="flex h-7 w-7 items-center justify-center text-secondary transition-colors hover:text-primary disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled || colors.length <= 1}
                  aria-label="Remove color"
                  className="flex h-7 w-7 items-center justify-center text-secondary transition-colors hover:text-error disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_1fr] md:items-end">
              <div>
                <label className="mb-1 block font-spec-label text-xs uppercase text-on-surface-variant">
                  Swatch
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color.hex?.startsWith('#') ? color.hex : '#000000'}
                    onChange={(event) => handleHexChange(index, event.target.value)}
                    disabled={disabled}
                    className="h-10 w-10 cursor-pointer border border-outline-variant bg-white p-0.5"
                    aria-label={`Color swatch ${index + 1}`}
                  />
                  <span
                    className={`h-8 w-8 rounded-full ${isLight ? 'border border-outline-variant' : ''}`}
                    style={{ background: color.hex || '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-spec-label text-xs uppercase text-on-surface-variant">
                  Hex
                </label>
                <input
                  type="text"
                  value={color.hex || ''}
                  onChange={(event) => handleHexChange(index, event.target.value)}
                  disabled={disabled}
                  placeholder="#000000"
                  className="brutalist-input w-full px-3 py-2 font-spec-label text-on-surface"
                />
              </div>

              <div>
                <label className="mb-1 block font-spec-label text-xs uppercase text-on-surface-variant">
                  Label
                </label>
                <input
                  type="text"
                  value={color.label || ''}
                  onChange={(event) => updateAt(index, { label: event.target.value })}
                  disabled={disabled}
                  placeholder="Black"
                  className="brutalist-input w-full px-3 py-2 font-body-md text-on-surface"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block font-spec-label text-xs uppercase text-on-surface-variant">
                Color image
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {color.image ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-outline-variant">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={color.image} alt={`${color.label || 'Color'} preview`} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-dashed border-outline-variant bg-surface-container-highest">
                    <span className="material-symbols-outlined text-secondary">image</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => inputRefs.current[index]?.click()}
                  disabled={disabled || isUploading}
                  className="border border-outline-variant px-4 py-2 font-spec-label text-xs uppercase text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? 'Uploading...' : color.image ? 'Replace image' : 'Upload image'}
                </button>

                {color.image ? (
                  <button
                    type="button"
                    onClick={() => updateAt(index, { image: '' })}
                    disabled={disabled}
                    className="font-spec-label text-xs uppercase text-error transition-colors hover:text-error/80"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <input
                ref={(node) => {
                  inputRefs.current[index] = node;
                }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => uploadImage(index, event.target.files)}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...colors, createEmptyColorRow()])}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-outline-variant px-4 py-3 font-spec-label text-xs uppercase text-on-surface transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Add color
      </button>

      {error ? (
        <div className="border border-error/30 bg-error/10 px-4 py-2 font-spec-label text-xs text-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}

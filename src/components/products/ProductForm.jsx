'use client';

import { useState } from 'react';
import FormSection from '@/components/products/FormSection';
import ColorVariantEditor from '@/components/products/ColorVariantEditor';
import ProductImageUploader from '@/components/products/ProductImageUploader';
import {
  CATEGORY_OPTIONS,
  MATERIAL_OPTIONS,
  createEmptyColorRow,
  normalizeFormColors,
  serializeColors,
} from '@/components/products/productCatalog';

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block font-spec-label text-xs uppercase text-on-surface-variant">
      {children}
    </label>
  );
}

function SelectField({ id, value, onChange, options }) {
  const withValue = options.includes(value) ? options : [value, ...options];
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="brutalist-input w-full appearance-none rounded-none px-3 py-2 font-body-md text-on-surface"
      >
        {withValue.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-secondary">
        arrow_drop_down
      </span>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="group flex w-fit cursor-pointer items-center border border-outline-variant p-3 transition-colors hover:border-primary-container">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
      <div
        className={`relative h-6 w-10 rounded-sm border border-outline-variant transition-colors ${
          checked ? 'bg-primary-container' : 'bg-surface-container-highest'
        }`}
      >
        <div
          className="absolute left-1 top-1 h-4 w-4 rounded-sm bg-on-surface transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
      <span className="ml-3 font-spec-label text-sm uppercase text-on-surface transition-colors group-hover:text-primary-container">
        {label}
      </span>
    </label>
  );
}

export function buildInitialForm(product) {
  const images = Array.isArray(product?.images) && product.images.length
    ? product.images
    : [product?.image, product?.modalImage].filter(Boolean);
  const fallbackImage = images[0] || product?.image || '';
  const colors = normalizeFormColors(product?.colors, fallbackImage);

  return {
    name: product?.name ?? '',
    productId: product?.productId ?? '',
    category: product?.category ?? CATEGORY_OPTIONS[0],
    material: product?.material ?? MATERIAL_OPTIONS[0],
    weight: product?.weight ?? '',
    layerHeight: product?.layerHeight ?? '',
    printTime: product?.printTime ?? '',
    specs: product?.specs ?? '',
    price: product?.price != null ? String(product.price) : '',
    images,
    colors: colors.length ? colors : [createEmptyColorRow()],
    description: product?.description ?? '',
    featured: product?.featured ?? false,
    available: product?.available ?? true,
    hasCustomText: product?.hasCustomText ?? false,
  };
}

export default function ProductForm({
  initialProduct = null,
  submitting = false,
  error = '',
  submitLabel = 'Save Product',
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialProduct));
  const [localError, setLocalError] = useState('');

  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    const price = parseFloat(form.price);
    if (!form.name.trim()) {
      setLocalError('Product name is required');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setLocalError('A valid price is required');
      return;
    }
    if (form.images.length === 0) {
      setLocalError('At least one gallery image is required');
      return;
    }

    const serializedColors = serializeColors(form.colors);
    if (serializedColors.length === 0) {
      setLocalError('At least one color is required');
      return;
    }

    const invalidColor = serializedColors.find((color) => !color.hex || !color.image);
    if (invalidColor) {
      setLocalError('Each color must have a hex value and an uploaded image');
      return;
    }

    const uniqueHexes = new Set(serializedColors.map((color) => color.hex));
    if (uniqueHexes.size !== serializedColors.length) {
      setLocalError('Duplicate color hex values are not allowed');
      return;
    }

    const specs =
      form.specs.trim() || [form.weight, form.material, form.layerHeight].filter(Boolean).join(' / ');

    setLocalError('');
    onSubmit({
      name: form.name.trim(),
      productId: form.productId.trim() || null,
      category: form.category,
      material: form.material,
      weight: form.weight.trim(),
      layerHeight: form.layerHeight.trim(),
      printTime: form.printTime.trim(),
      specs,
      price,
      images: form.images,
      colors: serializedColors,
      description: form.description.trim(),
      featured: form.featured,
      available: form.available,
      hasCustomText: form.hasCustomText,
    });
  };

  const displayedError = localError || error;

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit}>
      <FormSection
        label="// BASIC_INFORMATION"
        description="Primary nomenclature and taxonomy classification for the database."
      >
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="product-name">Product Name</FieldLabel>
            <input
              id="product-name"
              type="text"
              value={form.name}
              onChange={(event) => setField('name')(event.target.value)}
              placeholder="e.g. Planetary Gearbox"
              className="brutalist-input w-full px-3 py-2 font-headline-sm text-headline-sm text-on-surface"
            />
          </div>

          <div>
            <FieldLabel htmlFor="product-id">Product ID</FieldLabel>
            <input
              id="product-id"
              type="text"
              value={form.productId}
              onChange={(event) => setField('productId')(event.target.value)}
              placeholder="e.g. P-2"
              className="brutalist-input w-full px-3 py-2 font-spec-label text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <SelectField
                id="category"
                value={form.category}
                onChange={setField('category')}
                options={CATEGORY_OPTIONS}
              />
            </div>
            <div>
              <FieldLabel htmlFor="material">Material Type</FieldLabel>
              <SelectField
                id="material"
                value={form.material}
                onChange={setField('material')}
                options={MATERIAL_OPTIONS}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(event) => setField('description')(event.target.value)}
              placeholder="Describe the product, finish, and use case for the storefront detail page."
              className="brutalist-input w-full resize-y px-3 py-2 font-body-md text-on-surface"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        label="// TECHNICAL_SPECS"
        description="Physical properties, print metadata, and financial baseline."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="weight">Weight</FieldLabel>
            <input
              id="weight"
              type="text"
              value={form.weight}
              onChange={(event) => setField('weight')(event.target.value)}
              placeholder="120g"
              className="brutalist-input w-full px-3 py-2 font-body-md text-on-surface"
            />
          </div>

          <div>
            <FieldLabel htmlFor="layerHeight">Layer Height</FieldLabel>
            <input
              id="layerHeight"
              type="text"
              value={form.layerHeight}
              onChange={(event) => setField('layerHeight')(event.target.value)}
              placeholder="0.16mm"
              className="brutalist-input w-full px-3 py-2 font-body-md text-on-surface"
            />
          </div>

          <div>
            <FieldLabel htmlFor="printTime">Print Time</FieldLabel>
            <input
              id="printTime"
              type="text"
              value={form.printTime}
              onChange={(event) => setField('printTime')(event.target.value)}
              placeholder="4h 20m"
              className="brutalist-input w-full px-3 py-2 font-body-md text-on-surface"
            />
          </div>

          <div>
            <FieldLabel htmlFor="specs">Specs (optional override)</FieldLabel>
            <input
              id="specs"
              type="text"
              value={form.specs}
              onChange={(event) => setField('specs')(event.target.value)}
              placeholder="Auto: 120g / PLA+ / 0.16mm"
              className="brutalist-input w-full px-3 py-2 font-body-md text-on-surface"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="price">Base Price</FieldLabel>
            <div className="flex items-center">
              <span className="flex items-center justify-center border border-outline-variant border-r-0 bg-surface-container-highest px-4 py-2 font-price-display text-price-display text-on-surface">
                ৳
              </span>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setField('price')(event.target.value)}
                placeholder="0.00"
                className="brutalist-input max-w-[200px] px-3 py-2 font-price-display text-price-display text-on-surface"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        label="// COLOR_VARIANTS"
        description="Upload one image per color. The first color is used as the storefront card thumbnail."
      >
        <ColorVariantEditor
          value={form.colors}
          onChange={setField('colors')}
          disabled={submitting}
        />
      </FormSection>

      <FormSection
        label="// GALLERY_IMAGES"
        description="Optional extra angles or detail shots shown in the product gallery."
      >
        <div>
          <FieldLabel htmlFor="images">Gallery Images</FieldLabel>
          <ProductImageUploader
            value={form.images}
            onChange={setField('images')}
            disabled={submitting}
          />
        </div>
      </FormSection>

      <FormSection
        label="// STOREFRONT_STATUS"
        description="Visibility, merchandising, and customization controls."
      >
        <div className="flex flex-wrap gap-4">
          <Toggle label="Available (In Stock)" checked={form.available} onChange={setField('available')} />
          <Toggle label="Featured" checked={form.featured} onChange={setField('featured')} />
          <Toggle
            label="Custom Text"
            checked={form.hasCustomText}
            onChange={setField('hasCustomText')}
          />
        </div>
      </FormSection>

      {displayedError ? (
        <div className="admin-reveal border border-error/30 bg-error/10 px-4 py-3 font-spec-label text-xs text-error">
          {displayedError}
        </div>
      ) : null}

      <div className="admin-reveal mt-8 flex justify-end gap-4 border-t border-outline-variant pt-6 pb-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-sm border border-outline px-6 py-3 font-spec-label text-sm uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
          >
            Discard
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm border border-transparent bg-brand px-6 py-3 font-spec-label text-sm uppercase tracking-wider text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice, normalizeFormColors } from '@/components/products/productCatalog';

const MATERIAL_STYLES = {
  'PLA+': 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  PETG: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
  TPU: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
  RESIN: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]',
};

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function normalizeProduct(product) {
  const apiImages = Array.isArray(product.images) ? product.images : [];
  const images = (apiImages.length ? apiImages : [product.image, product.modalImage]).filter(
    (img, i, arr) => img && arr.indexOf(img) === i
  );
  const fallbackImage = images[0] || product.image || '';
  const colors = normalizeFormColors(product.colors || [], fallbackImage);

  return {
    id: product.id,
    productId: product.productId,
    name: product.name,
    category: product.category,
    material: product.material,
    description:
      product.description ||
      `Precision 3D printed ${product.name.toLowerCase()}. ${product.specs}. Optimised for reliable FDM output with clean surface finish.`,
    images: images.length ? images : [product.image].filter(Boolean),
    colors: colors.length ? colors : [{ label: 'Default', hex: '#1db954', image: fallbackImage }],
    availableMaterials: product.availableMaterials || [product.material],
    pricePerUnit: product.price,
    weightLabel: product.weight,
    specs: {
      layerHeight: product.layerHeight,
      printTime: product.printTime,
      infill: product.infill || '20%',
      supports: product.supports || 'As needed',
    },
    hasCustomText: product.hasCustomText ?? false,
    featured: product.featured ?? false,
    available: product.available ?? true,
    createdAt: formatDate(product.createdAt),
  };
}

function buildDisplayImages(colors, galleryImages) {
  const urls = [
    ...colors.map((color) => color.image).filter(Boolean),
    ...galleryImages.filter(Boolean),
  ];
  return urls.filter((url, index, arr) => arr.indexOf(url) === index);
}

function findColorByImage(colors, url) {
  return colors.find((color) => color.image === url) ?? null;
}

function SectionLabel({ icon, children }) {
  return (
    <h4 className="font-mono text-sm text-on-surface-variant flex items-center gap-2 uppercase tracking-wide">
      {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
      {children}
    </h4>
  );
}

export default function ProductModal({ product: rawProduct, onClose }) {
  const product = normalizeProduct(rawProduct);
  const displayImages = buildDisplayImages(product.colors, product.images);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedMaterial] = useState(product.availableMaterials[0]);
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setVisible(false);
    window.setTimeout(() => onClose?.(), 200);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const modal = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200 ${
          visible && !closing ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-7xl max-h-[90vh] bg-white border border-outline-variant shadow-2xl rounded-sm flex flex-col overflow-hidden transition-all duration-[280ms] ease-out ${
          visible && !closing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-outline-variant bg-white shrink-0">
          <div className="font-mono text-sm text-primary flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">build</span>
            {'// PRODUCT_DETAIL'}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-secondary hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </header>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          <section className="md:w-[45%] shrink-0 p-4 md:p-6 md:border-r border-outline-variant bg-surface">
            <div className="flex gap-4 h-full">
              {displayImages.length > 1 && (
                <div className="flex flex-col gap-2 w-16 md:w-20 shrink-0">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setActiveImg(i);
                        const matchedColor = findColorByImage(product.colors, img);
                        if (matchedColor) setSelectedColor(matchedColor);
                      }}
                      className={`w-full aspect-square border rounded transition-colors overflow-hidden ${
                        activeImg === i
                          ? 'border-primary border-2'
                          : 'border-outline-variant bg-surface hover:border-outline opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Image ${i + 1}`}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${img}')` }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 aspect-square md:aspect-auto md:min-h-[280px] border border-outline-variant rounded bg-white overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{
                    backgroundImage: `url('${displayImages[activeImg] || selectedColor.image || displayImages[0] || ''}')`,
                  }}
                />
                <span className="absolute top-2 right-2 bg-dark text-white font-mono text-[10px] px-2 py-1 rounded-sm tracking-wider uppercase">
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </section>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-surface min-h-0">
            <section className="space-y-2 border-b border-outline-variant pb-4 md:pb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[12px] text-secondary tracking-widest uppercase">
                  {product.category.replace(/_/g, ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 border rounded-sm font-mono text-[10px] uppercase ${
                    MATERIAL_STYLES[product.material] || 'border-outline-variant text-secondary'
                  }`}
                >
                  {product.material}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[12px]">star</span>
                    Featured
                  </span>
                )}
              </div>
              <h2
                id="product-modal-title"
                className="font-display font-bold text-2xl md:text-[32px] text-on-background leading-tight"
              >
                {product.name}
              </h2>
              <p className="font-mono text-[10px] text-secondary pt-1">
                {'// '}
                {product.specs.layerHeight} · {product.specs.printTime}
              </p>
            </section>

            <section className="flex items-baseline gap-2">
              <span className="font-mono text-2xl md:text-[32px] text-on-background font-bold tracking-tight">
                {formatPrice(product.pricePerUnit)}
              </span>
            </section>

            <section className="space-y-3">
              <SectionLabel icon="palette">
                Color:{' '}
                <span className="text-on-background normal-case">{selectedColor.label}</span>
              </SectionLabel>
              <div className="flex items-center gap-3 flex-wrap">
                {product.colors.map((color) => {
                  const isLight = ['White', 'Cream', 'Yellow'].includes(color.label);
                  const isSelected = selectedColor.hex === color.hex;
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        const idx = displayImages.indexOf(color.image);
                        setActiveImg(idx >= 0 ? idx : 0);
                      }}
                      title={color.label}
                      aria-label={color.label}
                      aria-pressed={isSelected}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                        isLight ? 'border border-outline-variant' : ''
                      } ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ background: color.hex }}
                    />
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <SectionLabel icon="category">Material</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {product.availableMaterials.map((mat) => {
                  const isSelected = selectedMaterial === mat;
                  return (
                    <span
                      key={mat}
                      className={`px-4 py-3 border rounded font-mono text-[12px] text-center ${
                        MATERIAL_STYLES[mat] || 'border-outline-variant bg-white text-secondary'
                      } ${
                        isSelected ? 'border-2 border-primary font-bold text-on-background' : ''
                      }`}
                    >
                      {mat}
                    </span>
                  );
                })}
              </div>
            </section>

            {product.hasCustomText && (
              <section className="bg-surface border border-outline-variant rounded p-4">
                <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                  {'// CUSTOM_TEXT_ENABLED'}
                </p>
                <p className="font-mono text-sm text-secondary">
                  Customers can add custom text when ordering this product.
                </p>
              </section>
            )}

            <section className="space-y-4">
              <div className="font-mono text-sm text-primary uppercase tracking-wide">
                {'// TECH_SPECS'}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-body text-base text-secondary bg-white p-4 rounded border border-outline-variant">
                <div className="border-b border-outline-variant pb-2">
                  <span className="block text-[10px] font-mono text-secondary mb-1 uppercase">
                    Layer Height
                  </span>
                  <span className="font-bold text-on-background">{product.specs.layerHeight}</span>
                </div>
                <div className="border-b border-outline-variant pb-2">
                  <span className="block text-[10px] font-mono text-secondary mb-1 uppercase">
                    Weight
                  </span>
                  <span className="font-bold text-on-background">{product.weightLabel}</span>
                </div>
                <div className="pt-1">
                  <span className="block text-[10px] font-mono text-secondary mb-1 uppercase">
                    Print Time
                  </span>
                  <span className="font-bold text-on-background">{product.specs.printTime}</span>
                </div>
                <div className="pt-1">
                  <span className="block text-[10px] font-mono text-secondary mb-1 uppercase">
                    Material
                  </span>
                  <span className="font-bold text-on-background">{selectedMaterial}</span>
                </div>
              </div>
              <p className="font-body text-base text-secondary leading-relaxed pt-2">
                {product.description}
              </p>

              <dl className="flex flex-col gap-2 border-t border-outline-variant pt-4 font-mono text-[11px]">
                {product.createdAt && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-secondary uppercase tracking-wide">Added</dt>
                    <dd className="text-on-surface-variant">{product.createdAt}</dd>
                  </div>
                )}
                {product.productId && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-secondary uppercase tracking-wide">Product ID</dt>
                    <dd
                      className="text-on-surface-variant truncate max-w-[60%]"
                      title={product.productId}
                    >
                      {product.productId}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>

        <footer className="p-4 md:p-6 border-t border-outline-variant bg-white shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-4 bg-dark text-white font-spec-label text-sm uppercase rounded hover:bg-brand transition-colors duration-200"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

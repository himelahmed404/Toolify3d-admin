'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';
import EditProductModal from '@/components/products/EditProductModal';
import ProductModal from '@/components/products/ProductModal';
import {
  formatPrice,
  formatAvailabilityLabel,
  getAvailabilityClass,
} from '@/components/products/productCatalog';

export default function ProductsIndexTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/products?includeUnavailable=true');
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openEditModal = (product) => {
    setEditingProduct(product);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const openViewModal = (product) => {
    setViewingProduct(product);
  };

  const closeViewModal = () => {
    setViewingProduct(null);
  };

  const handleSaved = (updated) => {
    setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));
    closeEditModal();
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    setDeleting(true);
    setError('');
    try {
      await apiFetch(`/products/${deletingProduct.id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((product) => product.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="admin-reveal space-y-6">
        <div className="flex items-end justify-between">
          <span className="system-label">// PRODUCT_CATALOG</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="border border-outline-variant px-4 py-2 font-spec-label text-xs transition-colors hover:bg-surface-variant"
            >
              [REFRESH]
            </button>
            <Link
              href="/products/new"
              className="border border-transparent bg-brand px-4 py-2 font-spec-label text-xs uppercase text-white transition-colors hover:bg-brand-dark"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {error ? (
          <div className="border border-error/30 bg-error/10 px-4 py-3 font-spec-label text-xs text-error">
            {error}
          </div>
        ) : null}

        <div className="technical-border overflow-hidden bg-white">
          <table className="w-full border-collapse text-left font-spec-label text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-highest">
                {['Product', 'Category', 'Material', 'Price', 'Status', 'Featured', 'Actions'].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      className={`px-6 py-4 font-bold uppercase tracking-wider ${index === 6 ? 'text-right' : ''}`}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-secondary">
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-secondary">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-sm border border-outline-variant/50 object-cover"
                        />
                        <span className="font-headline-sm text-base">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase">{product.category}</td>
                    <td className="px-6 py-4">{product.material}</td>
                    <td className="px-6 py-4 font-price-display">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`border px-3 py-1 text-xs font-bold ${getAvailabilityClass(product.available)}`}
                      >
                        {formatAvailabilityLabel(product.available)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-xs font-bold text-tertiary">
                          [FEATURED]
                        </span>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => openViewModal(product)}
                          className="font-bold text-on-surface-variant underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand"
                        >
                          VIEW
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="font-bold text-on-surface-variant underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
                          className="font-bold text-on-surface-variant underline decoration-error/30 underline-offset-4 transition-colors hover:text-error"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <EditProductModal
        key={editingProduct?.id}
        open={Boolean(editingProduct)}
        product={editingProduct}
        onSaved={handleSaved}
        onClose={closeEditModal}
      />

      {viewingProduct ? (
        <ProductModal product={viewingProduct} onClose={closeViewModal} />
      ) : null}

      {deletingProduct ? (
        <div className="fixed inset-0 z-100">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => (deleting ? null : setDeletingProduct(null))}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm border border-outline-variant bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-outline-variant px-6 py-4">
              <span className="system-label mb-1 block">// DELETE_PRODUCT</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{deletingProduct.name}</h2>
            </div>
            <div className="px-6 py-5 font-body-md text-on-surface-variant">
              Remove this product from the catalog permanently? This action cannot be undone.
            </div>
            <div className="flex gap-3 border-t border-outline-variant px-6 py-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 border border-transparent bg-error px-4 py-2.5 font-spec-label text-xs uppercase text-white transition-colors hover:bg-error/90 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleting}
                className="flex-1 border border-outline-variant px-4 py-2.5 font-spec-label text-xs uppercase text-on-surface transition-colors hover:bg-surface-variant disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

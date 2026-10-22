'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/products/ProductForm';
import { apiFetch } from '@/lib/api/client';

export default function AddProductForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/products');
    } catch (err) {
      setError(err.message || 'Failed to create product');
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      submitting={submitting}
      error={error}
      submitLabel="Save Product"
      onSubmit={handleSubmit}
      onCancel={() => router.push('/products')}
    />
  );
}

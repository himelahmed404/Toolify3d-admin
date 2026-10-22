'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiFetch } from '@/lib/api/client';

function buildPreviewUrl(number) {
  const digits = String(number || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export default function WhatsAppSettings() {
  const { tokenReady } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/settings');
      setWhatsappNumber(data?.whatsappNumber || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    loadSettings();
  }, [tokenReady, loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ whatsappNumber }),
      });
      setWhatsappNumber(data?.whatsappNumber || '');
      toast.success('WhatsApp number updated');
    } catch (err) {
      toast.error(err.message || 'Failed to save WhatsApp number');
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = buildPreviewUrl(whatsappNumber);

  return (
    <section className="admin-reveal space-y-6">
      <span className="system-label">// WHATSAPP_CONTACT</span>

      <div className="technical-border space-y-4 bg-white p-6">
        <p className="font-spec-label text-sm text-on-surface-variant">
          This number powers all WhatsApp CTAs on the customer storefront (home, contact, pricing, products, about).
        </p>

        <label className="block space-y-2">
          <span className="font-spec-label text-xs uppercase text-on-surface-variant">
            WhatsApp Number (with country code)
          </span>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="88017XXXXXXXXX"
            disabled={loading}
            className="admin-input w-full max-w-md px-4 py-3 font-spec-label text-sm"
          />
        </label>

        {previewUrl ? (
          <p className="font-mono text-xs text-on-surface-variant">
            Preview:{' '}
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {previewUrl}
            </a>
          </p>
        ) : (
          <p className="font-mono text-xs text-on-surface-variant">Preview: enter a number to generate wa.me link</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="btn-primary px-6 py-2.5 font-spec-label text-xs uppercase disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save WhatsApp Number'}
        </button>
      </div>
    </section>
  );
}

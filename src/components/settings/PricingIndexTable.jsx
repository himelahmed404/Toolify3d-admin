'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import EditMaterialPriceModal from '@/components/settings/EditMaterialPriceModal';
import { formatStockLabel, getStockClass } from '@/components/settings/materialStock';
import { useAuth } from '@/components/providers/AuthProvider';
import { apiFetch } from '@/lib/api/client';

function formatPrice(value) {
  return `৳ ${Number(value).toFixed(2)}`;
}

function cloneTiers(tiers = []) {
  return tiers.map((tier) => ({ ...tier }));
}

export default function PricingIndexTable() {
  const { tokenReady } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [discountsEnabled, setDiscountsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [draftTiers, setDraftTiers] = useState([]);
  const [draftStockStatus, setDraftStockStatus] = useState('in_stock');
  const [draftStockKg, setDraftStockKg] = useState('');
  const [draftDiscountEnabled, setDraftDiscountEnabled] = useState(true);
  const [savingMaterial, setSavingMaterial] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [materialsData, settingsData] = await Promise.all([
        apiFetch('/admin/materials'),
        apiFetch('/admin/settings'),
      ]);
      setMaterials(materialsData ?? []);
      setDiscountsEnabled(Boolean(settingsData?.discountsEnabled));
    } catch (err) {
      toast.error(err.message || 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    loadData();
  }, [tokenReady, loadData]);

  const handleGlobalDiscountToggle = async () => {
    const next = !discountsEnabled;
    setSavingGlobal(true);
    try {
      const data = await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ discountsEnabled: next }),
      });
      setDiscountsEnabled(Boolean(data.discountsEnabled));
      toast.success(next ? 'Discounts enabled globally' : 'Discounts disabled globally');
    } catch (err) {
      toast.error(err.message || 'Failed to update discount setting');
    } finally {
      setSavingGlobal(false);
    }
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setDraftTiers(cloneTiers(material.tiers).slice(0, 2));
    setDraftStockStatus(material.stockStatus);
    setDraftStockKg(String(material.stockKg ?? 0));
    setDraftDiscountEnabled(Boolean(material.discountEnabled));
  };

  const closeEditModal = () => {
    setEditingMaterial(null);
    setDraftTiers([]);
    setDraftStockStatus('in_stock');
    setDraftStockKg('');
    setDraftDiscountEnabled(true);
  };

  const handleTierChange = (index, field, value) => {
    setDraftTiers((current) =>
      current.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    );
  };

  const handleSave = async () => {
    if (!editingMaterial) return;

    const parsedTiers = draftTiers.map((tier) => ({
      maxWeightG: tier.maxWeightG,
      regularPricePerGram: parseFloat(tier.regularPricePerGram),
      discountedPricePerGram: parseFloat(tier.discountedPricePerGram),
    }));

    const parsedStockKg = parseFloat(draftStockKg);
    const needsStockAmount = draftStockStatus === 'in_stock' || draftStockStatus === 'low_stock';

    if (parsedTiers.some((tier) =>
      Number.isNaN(tier.regularPricePerGram) ||
      Number.isNaN(tier.discountedPricePerGram) ||
      tier.regularPricePerGram < 0 ||
      tier.discountedPricePerGram < 0
    )) {
      toast.error('All tier prices must be valid non-negative numbers');
      return;
    }

    if (needsStockAmount && (Number.isNaN(parsedStockKg) || parsedStockKg < 0)) {
      toast.error('Stock amount must be a valid non-negative number');
      return;
    }

    setSavingMaterial(true);
    try {
      const updated = await apiFetch(`/admin/materials/${editingMaterial.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tiers: parsedTiers,
          stockStatus: draftStockStatus,
          stockKg: needsStockAmount ? parsedStockKg : 0,
          discountEnabled: draftDiscountEnabled,
        }),
      });

      setMaterials((current) =>
        current.map((material) =>
          material.slug === updated.slug ? updated : material
        )
      );
      toast.success(`${updated.name} pricing updated`);
      closeEditModal();
    } catch (err) {
      toast.error(err.message || 'Failed to save material');
    } finally {
      setSavingMaterial(false);
    }
  };

  const headings = [
    'Material',
    '≤50g Reg',
    '≤50g Disc',
    '≤100g Reg',
    '≤100g Disc',
    'Discount',
    'Stock',
    'Actions',
  ];

  return (
    <>
      <section className="admin-reveal space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <span className="system-label">// PRICING_INDEX_v2</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 font-spec-label text-xs uppercase">
              <span>Global discounts</span>
              <button
                type="button"
                role="switch"
                aria-checked={discountsEnabled}
                disabled={savingGlobal || loading}
                onClick={handleGlobalDiscountToggle}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  discountsEnabled ? 'bg-primary' : 'bg-outline-variant'
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    discountsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="border border-outline-variant px-4 py-2 font-spec-label text-xs transition-colors hover:bg-surface-variant disabled:opacity-50"
            >
              [REFRESH_DATA]
            </button>
          </div>
        </div>

        <div className="technical-border overflow-x-auto bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left font-spec-label text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-highest">
                {headings.map((heading, index) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 font-bold uppercase tracking-wider whitespace-nowrap ${
                      index === headings.length - 1 ? 'text-right' : ''
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={headings.length} className="px-6 py-8 text-center text-on-surface-variant">
                    Loading pricing index…
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={headings.length} className="px-6 py-8 text-center text-on-surface-variant">
                    No materials found. Run seed:materials on the server.
                  </td>
                </tr>
              ) : (
                materials.map((material) => {
                  const tiers = material.tiers || [];
                  return (
                    <tr key={material.slug} className="transition-colors hover:bg-primary/5">
                      <td className="px-4 py-4 font-headline-sm text-base whitespace-nowrap">{material.name}</td>
                      <td className="px-4 py-4 font-price-display whitespace-nowrap">{formatPrice(tiers[0]?.regularPricePerGram)}</td>
                      <td className="px-4 py-4 font-price-display whitespace-nowrap">{formatPrice(tiers[0]?.discountedPricePerGram)}</td>
                      <td className="px-4 py-4 font-price-display whitespace-nowrap">{formatPrice(tiers[1]?.regularPricePerGram)}</td>
                      <td className="px-4 py-4 font-price-display whitespace-nowrap">{formatPrice(tiers[1]?.discountedPricePerGram)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold ${material.discountEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {material.discountEnabled ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`border px-3 py-1 text-xs font-bold whitespace-nowrap ${getStockClass(material.stockStatus)}`}>
                          {formatStockLabel(material.stockStatus, material.stockKg)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(material)}
                          className="font-bold text-on-surface-variant underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary"
                        >
                          EDIT
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <EditMaterialPriceModal
        open={Boolean(editingMaterial)}
        material={editingMaterial}
        tiers={draftTiers}
        stockStatus={draftStockStatus}
        stockKg={draftStockKg}
        discountEnabled={draftDiscountEnabled}
        onTierChange={handleTierChange}
        onStockStatusChange={setDraftStockStatus}
        onStockKgChange={setDraftStockKg}
        onDiscountEnabledChange={setDraftDiscountEnabled}
        onSave={handleSave}
        onClose={closeEditModal}
        saving={savingMaterial}
      />
    </>
  );
}

import { formatPrice } from '@/components/products/productCatalog';

const statusStyles = {
  'in-progress': 'text-[#2196F3] border-[#2196F3]/30 bg-[#2196F3]/5',
  in_progress: 'text-[#2196F3] border-[#2196F3]/30 bg-[#2196F3]/5',
  processing: 'text-[#2196F3] border-[#2196F3]/30 bg-[#2196F3]/5',
  packaging: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/5',
  pending: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/5',
  shipped: 'text-[#1DB954] border-[#1DB954]/30 bg-[#1DB954]/5',
  done: 'text-[#1DB954] border-[#1DB954]/30 bg-[#1DB954]/5',
  completed: 'text-[#1DB954] border-[#1DB954]/30 bg-[#1DB954]/5',
};

const statusLabels = {
  'in-progress': '[PRINTING]',
  in_progress: '[PRINTING]',
  processing: '[PRINTING]',
  packaging: '[PACKAGING]',
  pending: '[PENDING]',
  shipped: '[SHIPPED]',
  done: '[SHIPPED]',
  completed: '[SHIPPED]',
};

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  }).toUpperCase();
}

function getStatusStyle(status) {
  return statusStyles[status] || statusStyles.pending;
}

function getStatusLabel(status) {
  return statusLabels[status] || `[${String(status || 'pending').toUpperCase()}]`;
}

export default function OrdersTable({ orders = [], loading = false, error = '' }) {
  return (
    <div className="mt-section-padding-v">
      <span className="system-label mb-2 block">// RECENT_ACTIVITY</span>
      <h3 className="font-headline-md text-headline-md mb-6 text-on-background">Latest Orders</h3>

      <div className="overflow-hidden rounded border border-border bg-white">
        <table className="data-table w-full border-collapse text-left">
          <thead>
            <tr className="bg-dark text-white">
              {['Order ID', 'Product', 'Material', 'Est. Price', 'Status', 'Date'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="p-4 font-spec-label text-spec-label uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="font-body-md">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary">
                  Loading orders...
                </td>
              </tr>
            ) : null}

            {!loading && error ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-error">
                  {error}
                </td>
              </tr>
            ) : null}

            {!loading && !error && orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary">
                  No orders yet.
                </td>
              </tr>
            ) : null}

            {!loading && !error
              ? orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b border-border transition-colors hover:bg-surface-container-high ${
                      index % 2 === 1 ? 'bg-alt-bg' : ''
                    }`}
                  >
                    <td className="font-price-display p-4 text-sm">{order.orderNumber}</td>
                    <td className="p-4">{order.product}</td>
                    <td className="p-4">
                      <span className="rounded-sm border border-border px-2 py-1 font-spec-label text-xs">
                        {order.material}
                      </span>
                    </td>
                    <td className="font-price-display p-4 text-sm">{formatPrice(order.price)}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-sm border px-2 py-1 font-spec-label text-xs ${getStatusStyle(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="font-price-display p-4 text-sm text-secondary">
                      {formatShortDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

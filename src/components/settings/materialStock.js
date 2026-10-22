export const STOCK_STATUS_OPTIONS = [
  {
    value: 'in_stock',
    label: 'In Stock',
    stockClass: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    value: 'low_stock',
    label: 'Low Stock',
    stockClass: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  },
  {
    value: 'out_of_stock',
    label: 'Out of Stock',
    stockClass: 'bg-error/10 text-error border-error/20',
  },
];

export function getStockOption(value) {
  return STOCK_STATUS_OPTIONS.find((option) => option.value === value) ?? STOCK_STATUS_OPTIONS[0];
}

export function formatStockLabel(stockStatus, stockKg) {
  if (stockStatus === 'in_stock') return `[IN_STOCK_${stockKg}kg]`;
  if (stockStatus === 'low_stock') return `[LOW_STOCK_${stockKg}kg]`;
  return '[OUT_OF_STOCK]';
}

export function getStockClass(stockStatus) {
  return getStockOption(stockStatus).stockClass;
}

export const CATEGORY_OPTIONS = ['ALL', 'KEYCHAIN', 'LAMP', 'DESK ESSENTIAL', 'HOT WHEELS', 'ANIME FIGURES'];

export const MATERIAL_OPTIONS = ['PLA+', 'PETG', 'TPU', 'RESIN'];

export const COLOR_LABELS = {
  '#000000': 'Black',
  '#ffffff': 'White',
  '#1db954': 'Toolify Green',
  '#3d3d3d': 'Dark Gray',
  '#888888': 'Gray',
};

export function formatPrice(value) {
  return `৳ ${Number(value).toFixed(2)}`;
}

export function getAvailabilityClass(available) {
  return available
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-error/10 text-error border-error/20';
}

export function formatAvailabilityLabel(available) {
  return available ? '[IN_STOCK]' : '[OUT_OF_STOCK]';
}

function normalizeHex(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
}

export function normalizeFormColor(entry, fallbackImage = '') {
  if (typeof entry === 'string') {
    const hex = normalizeHex(entry);
    if (!hex) return null;
    return {
      hex,
      label: COLOR_LABELS[hex] || hex,
      image: fallbackImage,
    };
  }

  if (!entry || typeof entry !== 'object') return null;

  const hex = normalizeHex(entry.hex);
  if (!hex) return null;

  return {
    hex,
    label: String(entry.label || COLOR_LABELS[hex] || hex).trim(),
    image: typeof entry.image === 'string' ? entry.image.trim() : '',
  };
}

export function normalizeFormColors(raw, fallbackImage = '') {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => normalizeFormColor(entry, fallbackImage))
    .filter(Boolean);
}

export function serializeColors(formColors = []) {
  return normalizeFormColors(formColors)
    .filter((color) => color.hex)
    .map(({ hex, label, image }) => ({
      hex,
      label: label || COLOR_LABELS[hex] || hex,
      image: image || null,
    }));
}

/** @deprecated use normalizeFormColors */
export function parseColors(value) {
  if (Array.isArray(value)) return serializeColors(value);
  return value
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean)
    .map((hex) => normalizeFormColor(hex))
    .filter(Boolean);
}

/** @deprecated use normalizeFormColors for form state */
export function colorsToString(colors) {
  if (!Array.isArray(colors)) return '';
  return colors
    .map((color) => (typeof color === 'string' ? color : color.hex))
    .filter(Boolean)
    .join(', ');
}

export function createEmptyColorRow() {
  return { hex: '#000000', label: '', image: '' };
}

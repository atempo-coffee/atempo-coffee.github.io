/**
 * Shared helpers for rendering Komorebi templates and resolving stock/variants.
 */

const fs = require('fs');
const path = require('path');

const VARIANT_DEFS = [
  { key: 'quarter', defaultLabel: '1/4磅 (115g)', shortLabel: '1/4磅' },
  { key: 'half', defaultLabel: '半磅 (227g)', shortLabel: '半磅' },
  { key: 'drip', defaultLabel: '掛耳包', shortLabel: '掛耳包' }
];

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolve stock status according to ATEMPO rules:
 * - number > 0 -> 剩餘 N (available)
 * - 0 / "0" -> 庫存：0 (zero)
 * - "完售" -> 完售 (sold_out)
 * - "下單後烘製" | "接單現烘" -> 接單現烘 (roast_to_order)
 * - any other string -> verbatim text (custom)
 */
function resolveStockState(rawStock) {
  if (rawStock === undefined || rawStock === null || rawStock === '') {
    return {
      kind: 'roast_to_order',
      label: '接單現烘',
      badgeClass: 'bg-primary-container/60 text-primary border border-primary/20',
      dotClass: 'bg-primary',
      isSoldOut: false
    };
  }

  if (typeof rawStock === 'number' && !Number.isNaN(rawStock)) {
    if (rawStock === 0) {
      return {
        kind: 'zero',
        label: '庫存：0',
        badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
        dotClass: 'bg-stone-500',
        isSoldOut: false
      };
    }
    if (rawStock > 0) {
      return {
        kind: 'in_stock',
        label: `剩餘 ${rawStock}`,
        badgeClass: 'bg-tertiary-container/70 text-tertiary border border-tertiary/25',
        dotClass: 'bg-tertiary',
        isSoldOut: false
      };
    }
  }

  const trimmed = String(rawStock).trim();
  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    if (num === 0) {
      return {
        kind: 'zero',
        label: '庫存：0',
        badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
        dotClass: 'bg-stone-500',
        isSoldOut: false
      };
    }
    return {
      kind: 'in_stock',
      label: `剩餘 ${num}`,
      badgeClass: 'bg-tertiary-container/70 text-tertiary border border-tertiary/25',
      dotClass: 'bg-tertiary',
      isSoldOut: false
    };
  }

  if (trimmed === '完售') {
    return {
      kind: 'sold_out',
      label: '完售',
      badgeClass: 'bg-stone-200/90 text-stone-600 border border-stone-300',
      dotClass: 'bg-stone-500',
      isSoldOut: true
    };
  }

  if (trimmed === '下單後烘製' || trimmed === '接單現烘') {
    return {
      kind: 'roast_to_order',
      label: '接單現烘',
      badgeClass: 'bg-primary-container/60 text-primary border border-primary/20',
      dotClass: 'bg-primary',
      isSoldOut: false
    };
  }

  if (trimmed === '有') {
    return {
      kind: 'in_stock',
      label: '有',
      badgeClass: 'bg-tertiary-container/70 text-tertiary border border-tertiary/25',
      dotClass: 'bg-tertiary',
      isSoldOut: false
    };
  }

  return {
    kind: 'custom',
    label: trimmed,
    badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200',
    dotClass: 'bg-amber-600',
    isSoldOut: false
  };
}

/**
 * Normalize a bean's variants array & resolve default variant + stock per variant.
 */
function resolveBeanVariants(bean) {
  const rawVariants = bean.variants || {};
  const list = [];

  for (const def of VARIANT_DEFS) {
    const v = rawVariants[def.key];
    if (!v || v.price === undefined || v.price === null) continue;
    const rawStock = v.stock !== undefined && v.stock !== null ? v.stock : bean.stock;
    list.push({
      key: def.key,
      label: v.label || def.defaultLabel,
      shortLabel: v.shortLabel || def.shortLabel,
      price: v.price,
      unit: v.unit || null,
      stock: resolveStockState(rawStock)
    });
  }

  const defaultVariant =
    list.find((v) => v.key === 'half') ||
    list[0] || {
      key: 'half',
      label: '半磅 (227g)',
      shortLabel: '半磅',
      price: bean.price || 0,
      unit: null,
      stock: resolveStockState(bean.stock)
    };

  return {
    variants: list,
    defaultKey: defaultVariant.key,
    defaultVariant,
    beanStock: resolveStockState(bean.stock)
  };
}

/**
 * Inline Lucide-style SVG icons (zero runtime CDN dependency).
 */
const ICONS = {
  coffee: `<svg aria-hidden="true" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>`,
  messageCircle: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  sparkles: `<svg aria-hidden="true" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
  shoppingBag: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  arrowRight: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  arrowLeft: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  bookOpen: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  copy: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  userCheck: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  compass: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  cup: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  close: `<svg aria-hidden="true" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  camera: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  zoomIn: `<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`
};

function normalizeAssetRelPath(assetPath) {
  if (!assetPath) return '';
  const trimmed = String(assetPath).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }
  if (!trimmed.includes('/')) {
    return `assets/images/${trimmed}`;
  }
  return trimmed;
}

function resolveAssetPath(assetPath, rootPrefix = '') {
  const rel = normalizeAssetRelPath(assetPath);
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel) || rel.startsWith('/')) {
    return rel;
  }
  return `${rootPrefix}${rel}`;
}

function getLocalImageDimensions(relPath) {
  if (!relPath || /^https?:\/\//i.test(relPath) || relPath.startsWith('/')) return null;
  const fullPath = path.resolve(__dirname, '../..', relPath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    const ext = path.extname(fullPath).toLowerCase();
    const buf = fs.readFileSync(fullPath);
    if (ext === '.png' && buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === '.svg') {
      const text = buf.toString('utf8', 0, Math.min(buf.length, 4096));
      const vb = text.match(/viewBox\s*=\s*["'][\d.\s-]+?\s+[\d.\s-]+?\s+([\d.]+)\s+([\d.]+)["']/i);
      if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        const len = buf.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xc3) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
        }
        offset += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function resolveHeroMedia(assetPath, rootPrefix = '') {
  const rel = normalizeAssetRelPath(assetPath);
  if (!rel) return null;
  const src = resolveAssetPath(rel, rootPrefix);
  const dims = getLocalImageDimensions(rel) || { width: 1200, height: 675 };
  return {
    src,
    width: dims.width,
    height: dims.height,
    isPortrait: dims.height > dims.width
  };
}

function renderCampaignTitleHtml(title, { breakAfterPipe = false } = {}) {
  const raw = String(title || '').trim();
  const match = raw.match(/^(.+?)\s*[｜|]\s*(.+)$/);
  if (!match) {
    return escapeHtml(raw);
  }
  const mainPart = escapeHtml(match[1].trim());
  const subPart = escapeHtml(match[2].trim());
  if (breakAfterPipe) {
    return `<span class="block">${mainPart}｜</span><span class="block sm:whitespace-nowrap title-keep-cjk">${subPart}</span>`;
  }
  return `<span class="inline-block">${mainPart}｜</span><span class="inline-block title-keep-cjk">${subPart}</span>`;
}

module.exports = {
  VARIANT_DEFS,
  escapeHtml,
  resolveStockState,
  resolveBeanVariants,
  resolveAssetPath,
  resolveHeroMedia,
  renderCampaignTitleHtml,
  ICONS
};

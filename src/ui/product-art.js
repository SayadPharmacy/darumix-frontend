/**
 * DARUMIX — generated product artwork.
 *
 * A pharmacy catalog needs 100+ product images. Shipping real photographs
 * would be tens of megabytes and, for a demo, legally fraught. Instead each
 * product declares a `shape` and a `tone`, and this module renders a clean,
 * on-brand SVG illustration.
 *
 * The result: zero image payload, a perfectly consistent visual language, and
 * instant rendering with no layout shift.
 */

/** Palette per tone key. Keeps every illustration inside the brand system. */
const TONES = {
  emerald: {
    base: "#0b6b52",
    light: "#4fcea4",
    pale: "#e3f7ef",
    accent: "#12a37b",
  },
  mint: {
    base: "#12a37b",
    light: "#86e0c1",
    pale: "#eafcf7",
    accent: "#2fd3a8",
  },
  teal: {
    base: "#0d6f7d",
    light: "#5fc9d6",
    pale: "#e6f6f8",
    accent: "#1794a5",
  },
  blue: {
    base: "#2b6ea8",
    light: "#8dc2e8",
    pale: "#eaf3fb",
    accent: "#3d8fd1",
  },
  gold: {
    base: "#b3873b",
    light: "#e6cd93",
    pale: "#faf4e8",
    accent: "#c9a75a",
  },
};

function palette(tone) {
  return TONES[tone] || TONES.emerald;
}

/** uid keeps gradient ids unique so multiple illustrations can coexist. */
let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}${uidCounter}`;
}

/* ---------------------------------------------------------------------------
   Shape renderers
   Each receives the palette and returns the inner markup of a 0 0 120 120 box.
   --------------------------------------------------------------------------- */

const SHAPES = {
  /* Round tablet with a score line. */
  tablet: (c, g) => `
    <circle cx="60" cy="60" r="34" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".35"/>
    <path d="M60 32v56" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".35" stroke-linecap="round"/>
    <ellipse cx="48" cy="44" rx="11" ry="7" fill="#fff" opacity=".55" transform="rotate(-28 48 44)"/>`,

  /* Two-tone capsule. */
  capsule: (c, g) => `
    <g transform="rotate(-32 60 60)">
      <rect x="34" y="42" width="52" height="36" rx="18" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
      <path d="M60 42v36" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
      <rect x="34" y="42" width="26" height="36" rx="18" fill="${c.accent}" opacity=".38"/>
      <ellipse cx="46" cy="52" rx="8" ry="4" fill="#fff" opacity=".5"/>
    </g>`,

  /* Softgel with a glossy highlight. */
  softgel: (c, g) => `
    <ellipse cx="60" cy="60" rx="27" ry="35" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <ellipse cx="60" cy="60" rx="27" ry="35" fill="${c.accent}" opacity=".2"/>
    <ellipse cx="50" cy="45" rx="9" ry="15" fill="#fff" opacity=".6" transform="rotate(-14 50 45)"/>
    <ellipse cx="60" cy="60" rx="16" ry="23" fill="none" stroke="${c.light}" stroke-width="1.5" opacity=".5"/>`,

  /* Syrup bottle with cap and label. */
  bottle: (c, g) => `
    <rect x="48" y="22" width="24" height="14" rx="4" fill="${c.base}" opacity=".85"/>
    <path d="M46 36h28a8 8 0 0 1 8 8v44a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="44" y="54" width="32" height="30" rx="4" fill="#fff" opacity=".78"/>
    <path d="M50 64h20M50 71h15" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".4" stroke-linecap="round"/>
    <path d="M44 44c4 3 28 3 32 0" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`,

  /* Cream / ointment tube. */
  tube: (c, g) => `
    <g transform="rotate(-14 60 60)">
      <rect x="40" y="26" width="40" height="60" rx="10" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
      <rect x="50" y="18" width="20" height="12" rx="5" fill="${c.base}" opacity=".8"/>
      <rect x="46" y="46" width="28" height="22" rx="4" fill="#fff" opacity=".75"/>
      <path d="M52 56h16M52 62h11" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".38" stroke-linecap="round"/>
      <path d="M46 36c4 2.5 24 2.5 28 0" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    </g>`,

  /* Cream jar. */
  jar: (c, g) => `
    <rect x="32" y="50" width="56" height="42" rx="12" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="28" y="34" width="64" height="20" rx="9" fill="${c.accent}" opacity=".55"/>
    <rect x="28" y="34" width="64" height="20" rx="9" fill="none" stroke="${c.base}" stroke-width="2" stroke-opacity=".3"/>
    <rect x="44" y="62" width="32" height="20" rx="4" fill="#fff" opacity=".7"/>
    <path d="M50 72h20" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".4" stroke-linecap="round"/>`,

  /* Pump dispenser (cleanser, serum foam). */
  pump: (c, g) => `
    <rect x="52" y="16" width="16" height="8" rx="3" fill="${c.base}" opacity=".8"/>
    <path d="M60 24v14" stroke="${c.base}" stroke-width="3" stroke-opacity=".5" stroke-linecap="round"/>
    <path d="M48 38h24a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V48a10 10 0 0 1 10-10Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="44" y="58" width="32" height="28" rx="4" fill="#fff" opacity=".75"/>
    <path d="M50 68h20M50 75h14" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".38" stroke-linecap="round"/>
    <path d="M62 20h22" stroke="${c.base}" stroke-width="3" stroke-opacity=".45" stroke-linecap="round"/>`,

  /* Dropper bottle (serums, eye drops). */
  dropper: (c, g) => `
    <rect x="50" y="14" width="20" height="10" rx="4" fill="${c.base}" opacity=".85"/>
    <rect x="54" y="24" width="12" height="12" fill="${c.base}" opacity=".45"/>
    <path d="M44 36h32a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="42" y="56" width="36" height="26" rx="4" fill="#fff" opacity=".75"/>
    <path d="M49 68h22" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".4" stroke-linecap="round"/>
    <ellipse cx="60" cy="30" rx="16" ry="5" fill="none" stroke="${c.light}" stroke-width="1.5" opacity=".55"/>`,

  /* Sachet / powder stick. */
  sachet: (c, g) => `
    <g transform="rotate(-8 60 60)">
      <path d="M32 34h56v52H32z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
      <path d="M32 34h56" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".35"/>
      <path d="M32 44h56" stroke="${c.accent}" stroke-width="3" opacity=".6"/>
      <rect x="40" y="54" width="40" height="22" rx="4" fill="#fff" opacity=".72"/>
      <path d="M46 63h28M46 70h18" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".4" stroke-linecap="round"/>
    </g>`,

  /* Tin / powder can with lid. */
  can: (c, g) => `
    <rect x="34" y="30" width="52" height="60" rx="10" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <ellipse cx="60" cy="32" rx="26" ry="8" fill="${c.accent}" opacity=".6"/>
    <ellipse cx="60" cy="32" rx="26" ry="8" fill="none" stroke="${c.base}" stroke-width="2" stroke-opacity=".3"/>
    <rect x="42" y="52" width="36" height="28" rx="4" fill="#fff" opacity=".74"/>
    <path d="M48 62h24M48 70h16" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".4" stroke-linecap="round"/>`,

  /* Cardboard box (dropship, starch). */
  box: (c, g) => `
    <path d="M28 44 60 28l32 16v40L60 100 28 84z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M60 28v72" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".35"/>
    <path d="m28 44 32 16 32-16" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".35"/>
    <path d="m44 36 32 16" stroke="${c.accent}" stroke-width="3" opacity=".5"/>`,

  /* Blister pack / soft pack. */
  pack: (c, g) => `
    <rect x="26" y="36" width="68" height="50" rx="10" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="36" y="46" width="20" height="14" rx="7" fill="#fff" opacity=".78"/>
    <rect x="62" y="46" width="20" height="14" rx="7" fill="#fff" opacity=".78"/>
    <rect x="36" y="66" width="20" height="14" rx="7" fill="#fff" opacity=".65"/>
    <rect x="62" y="66" width="20" height="14" rx="7" fill="#fff" opacity=".65"/>
    <path d="M26 56h68" stroke="${c.accent}" stroke-width="2.5" opacity=".45"/>`,

  /* Handheld medical device. */
  device: (c, g) => `
    <rect x="30" y="26" width="60" height="68" rx="12" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <rect x="40" y="36" width="40" height="26" rx="6" fill="#fff" opacity=".8"/>
    <path d="M47 49h6l3-6 4 12 3-6h6" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".55" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="60" cy="76" r="9" fill="${c.accent}" opacity=".55"/>
    <path d="M55 76h10" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".5" stroke-linecap="round"/>`,

  /* Heart — wellness products. */
  heart: (c, g) => `
    <path d="M60 96S22 72 22 47a21 21 0 0 1 38-12 21 21 0 0 1 38 12C98 72 60 96 60 96Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M40 56h10l5-10 8 20 5-10h12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`,

  /* Leaf — herbal. */
  leaf: (c, g) => `
    <path d="M94 26C46 26 24 52 24 74a22 22 0 0 0 22 22c22 0 48-22 48-70Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M26 98c0-30 24-56 68-72" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>`,

  /* Sun — vitamin D. */
  sun: (c, g) => `
    <circle cx="60" cy="60" r="24" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M60 18v12M60 90v12M18 60h12M90 60h12M30 30l9 9M81 81l9 9M90 30l-9 9M39 81l-9 9"
      stroke="${c.accent}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,

  /* Moon — sleep products. */
  moon: (c, g) => `
    <path d="M78 72A34 34 0 0 1 44 22a34 34 0 1 0 34 50Z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <circle cx="80" cy="34" r="3.5" fill="${c.accent}" opacity=".8"/>
    <circle cx="92" cy="50" r="2.5" fill="${c.accent}" opacity=".6"/>`,

  /* Thermometer. */
  thermometer: (c, g) => `
    <rect x="52" y="20" width="16" height="58" rx="8" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M60 34v36" stroke="${c.base}" stroke-width="3.5" opacity=".5" stroke-linecap="round"/>
    <circle cx="60" cy="86" r="16" fill="${c.accent}" opacity=".7"/>
    <circle cx="60" cy="86" r="16" fill="none" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M60 60v22" stroke="${c.base}" stroke-width="5" opacity=".55" stroke-linecap="round"/>`,

  /* Tooth — oral care. */
  tooth: (c, g) => `
    <path d="M38 24c10 0 12 6 22 6s12-6 22-6c14 0 17 15 14 30-2 12-7 15-9 27-1.5 11-4 26-9 26s-5-20-12-20-7 20-12 20-7.5-15-9-26c-2-12-7-15-9-27C33 39 24 24 38 24Z"
      fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <ellipse cx="48" cy="42" rx="9" ry="6" fill="#fff" opacity=".6" transform="rotate(-20 48 42)"/>`,

  /* Shield — protection / immunity. */
  shield: (c, g) => `
    <path d="M60 20 26 32v28c0 22 16 38 34 44 18-6 34-22 34-44V32z" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="m46 58 9 9 19-19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`,

  /* Activity pulse — diagnostics / fitness. */
  activity: (c, g) => `
    <rect x="22" y="34" width="76" height="52" rx="12" fill="url(#${g})" stroke="${c.base}" stroke-width="2.5" stroke-opacity=".3"/>
    <path d="M32 60h13l7-16 11 32 7-16h18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`,
};

/** Keys available for the admin product form. */
export const shapeKeys = Object.keys(SHAPES);
export const toneKeys = Object.keys(TONES);

/**
 * Render a product illustration.
 *
 * @param {{shape?: string, tone?: string}} product
 * @param {{className?: string, title?: string}} [options]
 * @returns {string} SVG markup
 */
export function productArt(product = {}, options = {}) {
  const { className = "", title = "" } = options;
  const shapeKey = SHAPES[product.shape] ? product.shape : "tablet";
  const toneKey = TONES[product.tone] ? product.tone : "emerald";

  const colors = palette(toneKey);
  const gradientId = uid("pg");
  const glowId = uid("gl");

  const a11y = title
    ? `role="img" aria-label="${String(title).replace(/"/g, "&quot;")}"`
    : 'aria-hidden="true" focusable="false"';

  return (
    `<svg viewBox="0 0 120 120" class="product-art${className ? ` ${className}` : ""}" ${a11y}>` +
    `<defs>` +
    `<linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#ffffff"/>` +
    `<stop offset="0.45" stop-color="${colors.pale}"/>` +
    `<stop offset="1" stop-color="${colors.light}"/>` +
    `</linearGradient>` +
    `<radialGradient id="${glowId}" cx="0.5" cy="0.42" r="0.62">` +
    `<stop offset="0" stop-color="${colors.light}" stop-opacity="0.45"/>` +
    `<stop offset="1" stop-color="${colors.light}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<circle cx="60" cy="60" r="54" fill="url(#${glowId})"/>` +
    SHAPES[shapeKey](colors, gradientId) +
    `</svg>`
  );
}

/** Small brand tile with a monogram — used in the brand directory. */
export function brandArt(brand = {}) {
  const colors = palette(brand.tone);
  const gradientId = uid("bg");

  const monogram = String(brand.nameEn || brand.name || "D")
    .split(/[\s-]+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    `<svg viewBox="0 0 96 96" class="brand-art" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${colors.light}" stop-opacity="0.85"/>` +
    `<stop offset="1" stop-color="${colors.pale}" stop-opacity="0.95"/>` +
    `</linearGradient></defs>` +
    `<rect x="4" y="4" width="88" height="88" rx="26" fill="url(#${gradientId})" stroke="${colors.base}" stroke-opacity="0.16" stroke-width="2"/>` +
    `<text x="48" y="58" text-anchor="middle" font-family="'Vazirmatn', system-ui, sans-serif" ` +
    `font-size="30" font-weight="800" fill="${colors.base}" opacity="0.82">${monogram}</text>` +
    `</svg>`
  );
}

/** Generic article cover artwork. */
export function articleArt(article = {}) {
  const colors = palette(article.tone);
  const gradientId = uid("ag");

  return (
    `<svg viewBox="0 0 160 100" class="article-art" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${colors.pale}"/>` +
    `<stop offset="1" stop-color="${colors.light}" stop-opacity="0.75"/>` +
    `</linearGradient></defs>` +
    `<rect width="160" height="100" fill="url(#${gradientId})"/>` +
    `<circle cx="34" cy="26" r="30" fill="#fff" opacity="0.35"/>` +
    `<circle cx="130" cy="82" r="38" fill="${colors.base}" opacity="0.09"/>` +
    `<circle cx="118" cy="24" r="4" fill="${colors.base}" opacity="0.28"/>` +
    `<circle cx="46" cy="78" r="3" fill="${colors.base}" opacity="0.22"/>` +
    `</svg>`
  );
}

export default productArt;

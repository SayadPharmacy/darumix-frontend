/**
 * DARUMIX — inline SVG icon set.
 *
 * Hand-drawn 24×24 stroke icons. There is no icon library dependency: every
 * glyph is a few path commands, which keeps the bundle tiny and lets the icons
 * inherit `currentColor` and stroke width from CSS.
 *
 * Usage:
 *   icon('cart')                      → <svg …>
 *   icon('cart', { size: 20, stroke: 2 })
 *   icon('star', { filled: true })
 */

const PATHS = {
  /* --- Navigation & chrome --- */
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  filter: '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m6 15 6-6 6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  external:
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',

  /* --- Commerce --- */
  cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/>',
  bag: '<path d="M5 8h14l-1 12a2 2 0 0 1-2 1.8H8A2 2 0 0 1 6 20Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  heart:
    '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.7 4.2 4.2 0 0 1 19 10.7C19 15.6 12 20 12 20Z"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18"/><path d="M12 8v13"/><path d="M12 8S10 3 7.5 4.2 8.6 8 12 8s4.4-2.6 2.5-3.8S12 8 12 8Z"/>',
  truck:
    '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/>',
  package:
    '<path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2z"/><path d="M4 7.2 12 11.5l8-4.3"/><path d="M12 11.5V21"/>',
  store:
    '<path d="M4 9h16v11H4z"/><path d="M3 9 5 4h14l2 5"/><path d="M9 20v-5h6v5"/>',
  creditCard:
    '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6.5 15h3"/>',
  wallet:
    '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5z"/><path d="M16 11h3v3h-3a1.5 1.5 0 0 1 0-3Z"/>',
  banknote:
    '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  scale:
    '<path d="M12 4v16"/><path d="M7 20h10"/><path d="M4 9h6L7 4Z"/><path d="M14 9h6l-3-5Z"/><path d="M4 9a3 3 0 0 0 6 0"/><path d="M14 9a3 3 0 0 0 6 0"/>',
  percent:
    '<path d="m6 18 12-12"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
  receipt:
    '<path d="M5 3h14v18l-2.3-1.6L14.4 21l-2.4-1.6L9.6 21l-2.3-1.6L5 21z"/><path d="M8.5 8h7"/><path d="M8.5 12h7"/>',

  /* --- User & account --- */
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users:
    '<circle cx="9" cy="8" r="3.3"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><path d="M16 5.4a3.3 3.3 0 0 1 0 6.2"/><path d="M17.5 13.6a6.5 6.5 0 0 1 4 5.9"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  logout:
    '<path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20H15"/><path d="M11 16.5 15.5 12 11 7.5"/><path d="M15.5 12H4"/>',
  shield:
    '<path d="M12 3 5 6v6c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="M4 4l16 16"/><path d="M9.5 9.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2"/><path d="M6.5 6.7C4 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1"/><path d="M17.5 17.3C19.9 15.6 21.5 12 21.5 12S18 5.5 12 5.5c-1 0-2 .2-2.9.5"/>',

  /* --- Health & medical --- */
  pill: '<path d="M10.5 3.5 3.5 10.5a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7Z"/><path d="m7 7 7 7"/>',
  capsule:
    '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5"/><path d="M12 8.5v7"/>',
  syringe:
    '<path d="m14 4 6 6"/><path d="m17 7-9.5 9.5L4 20l1.5-3.5L15 7"/><path d="m11 6 7 7"/>',
  flask:
    '<path d="M9 3h6"/><path d="M10 3v5.5L5.5 17A2.5 2.5 0 0 0 7.8 21h8.4a2.5 2.5 0 0 0 2.3-4L14 8.5V3"/><path d="M7.5 15h9"/>',
  stethoscope:
    '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-3"/><circle cx="19" cy="10" r="2"/>',
  heartPulse:
    '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.7 4.2 4.2 0 0 1 19 10.7C19 15.6 12 20 12 20Z"/><path d="M6.5 12.5h2.5l1-2 1.5 3.5 1.2-2.2 1 .7h2.8"/>',
  prescription:
    '<path d="M6 3h5.5a4.5 4.5 0 0 1 0 9H6z"/><path d="M6 3v18"/><path d="m13 14 6 7"/><path d="m19 14-6 7"/>',
  activity: '<path d="M3 12h4l2.5-6 4 12 2.5-6h5"/>',
  thermometer:
    '<path d="M13.5 14.4V5a2.5 2.5 0 0 0-5 0v9.4a4.5 4.5 0 1 0 5 0Z"/><path d="M11 7.5V17"/>',
  droplet:
    '<path d="M12 3.5s5.5 6 5.5 10a5.5 5.5 0 0 1-11 0c0-4 5.5-10 5.5-10Z"/>',
  bandage:
    '<rect x="1.8" y="8.5" width="20.4" height="7" rx="3.5"/><path d="M8.5 15.5 6 9M15.5 15.5 18 9"/><circle cx="12" cy="10.5" r=".8"/><circle cx="12" cy="13.5" r=".8"/>',
  firstAid:
    '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"/><path d="M12 10v6"/><path d="M9 13h6"/>',
  mask: '<path d="M3 8.5c3.5-1.6 14.5-1.6 18 0v3.7c0 4-4 7.8-9 7.8s-9-3.8-9-7.8z"/><path d="M3 10.5 1 12M21 10.5 23 12"/>',
  baby: '<circle cx="12" cy="8" r="4.5"/><path d="M9.5 12.5 8 21l4-2 4 2-1.5-8.5"/><circle cx="10.5" cy="7.5" r=".7"/><circle cx="13.5" cy="7.5" r=".7"/>',
  leaf: '<path d="M20 4C10 4 5 9 5 15a4 4 0 0 0 4 4c6 0 11-5 11-15Z"/><path d="M5 20c0-6 5-11 15-16"/>',
  sparkle:
    '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16.5 19 18l1.5.5-1.5.5-.5 1.5-.5-1.5L16 18l1.5-.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  moon: '<path d="M20 13.5A8 8 0 0 1 10.5 4a8 8 0 1 0 9.5 9.5Z"/>',
  tooth:
    '<path d="M8 3.5c2 0 2.5 1 4 1s2-1 4-1c3 0 3.5 3 3 6-.4 2.4-1.4 3-1.7 5.5-.3 2.5-1 7-2.3 7s-1.3-4.5-3-4.5-1.7 4.5-3 4.5-2-4.5-2.3-7C6.4 12.5 5.4 11.9 5 9.5c-.5-3 0-6 3-6Z"/>',
  bone: '<circle cx="7" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><path d="M9 9.5 15 14.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M14.5 8 9.5 13"/>',

  /* --- Interface & feedback --- */
  check: '<path d="m5 13 4.5 4.5L19 7"/>',
  checkCircle:
    '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>',
  x: '<path d="M6.5 6.5l11 11"/><path d="m17.5 6.5-11 11"/>',
  alert:
    '<path d="M12 4.5 2.8 20h18.4z"/><path d="M12 10v4.5"/><path d="M12 17.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9.3a2.4 2.4 0 0 1 4.6.7c0 1.6-2.3 2-2.3 3.5"/><path d="M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/>',
  trash:
    '<path d="M4 7h16"/><path d="M9.5 7V5h5v2"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10.5 11v5M13.5 11v5"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6a2 2 0 0 0-2 2v6.5A2.5 2.5 0 0 0 6.5 15"/>',
  upload:
    '<path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download:
    '<path d="M12 4v12"/><path d="m7.5 11.5 4.5 4.5 4.5-4.5"/><path d="M4 19h16"/>',
  image:
    '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 17 5-5 4 4 3-3 4 4"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/>',
  chart:
    '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  pieChart:
    '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M14 3.5A9 9 0 0 1 20.5 10H14z"/>',
  trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  trendingDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone:
    '<path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5L15.5 11l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  share:
    '<circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  map: '<path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>',
  marker:
    '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  award:
    '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
  crown: '<path d="m3 7 4 3 5-6 5 6 4-3-2 12H5z"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="M12 12v9"/><path d="m4 7.5 8 4.5 8-4.5"/>',
  database:
    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  code: '<path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/><path d="m13.5 5-3 14"/>',
  spark:
    '<path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21"/><path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  send: '<path d="m21 3-9.5 9.5"/><path d="M21 3 14.5 21l-3-7.5L4 10.5z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  history:
    '<path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9"/><path d="M3.5 4.5V9h4.5"/><path d="M12 8v4.5l3 1.8"/>',
  sliders:
    '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  target:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  megaphone:
    '<path d="M4 10v4l12 5V5z"/><path d="M16 7.5a3.5 3.5 0 0 1 0 7"/><path d="M7 15v4"/>',
  ticket:
    '<path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 7v10"/>',
  key: '<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8"/><path d="m15 8 2.5 2.5M17.5 5.5 20 8"/>',
  clipboard:
    '<rect x="6" y="4.5" width="12" height="16" rx="2.5"/><path d="M9.5 4.5V3.5A1.5 1.5 0 0 1 11 2h2a1.5 1.5 0 0 1 1.5 1.5v1"/><path d="M9.5 11h5M9.5 14.5h3"/>',
  shieldCheck:
    '<path d="M12 3 5 6v6c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/><path d="m9.5 12 1.8 1.8L15 10"/>',
  verified:
    '<path d="m12 2.5 2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.9 3.1-3.2-.3L12 21.5l-2.4-2.1-3.2.3-.9-3.1L2.7 15l1.3-2.9L2.7 9.2l2.8-1.6.9-3.1 3.2.3z"/><path d="m9.2 12 2 2 3.6-3.6"/>',
  currency:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5h5"/><path d="M9.5 12h5"/><path d="M12 9.5v6"/><path d="m10 17 2-1.5 2 1.5"/>',
};

/** Icons that read better as solid shapes. */
const FILLED = new Set([
  "star",
  "heart",
  "bookmark",
  "crown",
  "zap",
  "sparkle",
  "spark",
]);

export const iconNames = Object.keys(PATHS);

/**
 * Render an icon as an SVG string.
 *
 * @param {string} name                   key from PATHS
 * @param {object} [options]
 * @param {number} [options.size=20]      pixel size (width & height)
 * @param {number} [options.stroke=1.9]   stroke width
 * @param {boolean} [options.filled]      fill the shape (defaults per icon)
 * @param {string} [options.className]
 * @param {string} [options.title]        adds an accessible label
 * @param {object} [options.attrs]        extra SVG attributes
 */
export function icon(name, options = {}) {
  const path = PATHS[name];

  if (!path) {
    // Never render a broken box: an empty svg keeps layout intact.
    return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"></svg>';
  }

  const {
    size = 20,
    stroke = 1.9,
    filled = FILLED.has(name),
    className = "",
    title = "",
    attrs = {},
  } = options;

  const extra = Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value).replace(/"/g, "&quot;")}"`)
    .join(" ");

  const a11y = title
    ? `role="img" aria-label="${String(title).replace(/"/g, "&quot;")}"`
    : 'aria-hidden="true" focusable="false"';

  const paint = filled
    ? 'fill="currentColor" stroke="none"'
    : `fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;

  return (
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${paint} ` +
    `class="icon icon--${name}${className ? ` ${className}` : ""}" ${a11y} ${extra}>` +
    `${title ? `<title>${title}</title>` : ""}${path}</svg>`
  );
}

/** Category/group icon lookup with a safe fallback. */
export function categoryIcon(name, options) {
  return icon(PATHS[name] ? name : "pill", options);
}

export default icon;

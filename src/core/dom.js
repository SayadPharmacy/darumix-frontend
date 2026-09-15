/**
 * DARUMIX — DOM helpers.
 *
 * The UI is built from template strings. Two rules keep that safe:
 *   1. `html` escapes every interpolated value unless it is explicitly marked
 *      with `raw()` from a trusted source.
 *   2. Everything user-supplied (search terms, review text, profile fields)
 *      therefore cannot inject markup.
 */

/* ---------------------------------------------------------------------------
   Escaping
   --------------------------------------------------------------------------- */

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/** Escape a value for use inside HTML text or a quoted attribute. */
export function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/** Marker class so `html` can tell pre-sanitised strings apart. */
class SafeHtml {
  constructor(value) {
    this.value = String(value);
  }

  toString() {
    return this.value;
  }
}

/** Mark a string as already-safe markup. Only for our own templates. */
export function raw(value) {
  return value instanceof SafeHtml ? value : new SafeHtml(value ?? '');
}

export function isSafe(value) {
  return value instanceof SafeHtml;
}

/**
 * Tagged template that escapes interpolation by default.
 *
 *   html`<p>${userInput}</p>`            → escaped
 *   html`<p>${raw('<b>bold</b>')}</p>`   → inserted verbatim
 */
export function html(strings, ...values) {
  let out = '';

  for (let index = 0; index < strings.length; index += 1) {
    out += strings[index];

    if (index >= values.length) continue;

    const value = values[index];

    // null / undefined / booleans render as nothing, matching JSX semantics.
    if (value == null || value === false || value === true) continue;

    if (isSafe(value)) {
      out += value.toString();
    } else if (Array.isArray(value)) {
      // Arrays are assumed to be lists of already-safe fragments, but plain
      // values inside them are still escaped.
      out += value
        .map((item) => (isSafe(item) ? item.toString() : item == null ? '' : escapeHtml(item)))
        .join('');
    } else {
      out += escapeHtml(value);
    }
  }

  return raw(out);
}

/* ---------------------------------------------------------------------------
   Querying
   --------------------------------------------------------------------------- */

/** Scope a query to a root element (defaults to document). */
export function qs(selector, root = document) {
  return root ? root.querySelector(selector) : null;
}

export function qsa(selector, root = document) {
  return root ? [...root.querySelectorAll(selector)] : [];
}

/* ---------------------------------------------------------------------------
   Event delegation
   --------------------------------------------------------------------------- */

/**
 * Delegate events from a root to matching descendants.
 * Returns an unsubscribe function — pages must call it on unmount, otherwise
 * listeners accumulate across navigations.
 *
 * @param {Element} root
 * @param {string} type
 * @param {string} selector
 * @param {(event: Event, matched: Element) => void} handler
 */
export function delegate(root, type, selector, handler) {
  if (!root) return () => {};

  const listener = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const matched = target.closest(selector);
    if (matched && root.contains(matched)) {
      handler(event, matched);
    }
  };

  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}

/** Add a listener and get back its disposer. */
export function on(target, type, handler, options) {
  if (!target) return () => {};
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/* ---------------------------------------------------------------------------
   Element creation & classes
   --------------------------------------------------------------------------- */

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === false) return;

    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, value);
  });

  const list = Array.isArray(children) ? children : [children];
  list.forEach((child) => {
    if (child == null) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });

  return node;
}

/**
 * Toggle classes on a set of elements from a predicate, without the usual
 * `unwrap()` dance.
 */
export function setClass(target, className, active) {
  const nodes = typeof target === 'string' ? qsa(target) : [target].flat().filter(Boolean);
  nodes.forEach((node) => node.classList.toggle(className, Boolean(active)));
}

/* ---------------------------------------------------------------------------
   Focus management (drawers, modals, overlays)
   --------------------------------------------------------------------------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusables(root) {
  if (!root) return [];
  return qsa(FOCUSABLE, root).filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );
}

/**
 * Move focus into a container and keep Tab cycling inside it.
 * Returns a disposer that also restores the previously focused element.
 */
export function trapFocus(container) {
  const previous = document.activeElement;
  const candidates = focusables(container);

  if (candidates.length) {
    // Wait a frame so the enter transition has begun and the node is visible.
    requestAnimationFrame(() => candidates[0].focus({ preventScroll: true }));
  }

  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;

    const list = focusables(container);
    if (list.length === 0) {
      event.preventDefault();
      return;
    }

    const first = list[0];
    const last = list[list.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeydown);

  return () => {
    container.removeEventListener('keydown', onKeydown);
    if (previous instanceof HTMLElement && document.contains(previous)) {
      previous.focus({ preventScroll: true });
    }
  };
}

/* ---------------------------------------------------------------------------
   Scroll locking
   --------------------------------------------------------------------------- */

let lockDepth = 0;
let savedOverflow = '';

/** Reference-counted body scroll lock so nested drawers behave. */
export function lockScroll() {
  lockDepth += 1;
  if (lockDepth > 1) return;

  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

export function unlockScroll() {
  lockDepth = Math.max(0, lockDepth - 1);
  if (lockDepth > 0) return;

  document.body.style.overflow = savedOverflow;
}

/* ---------------------------------------------------------------------------
   Small utilities
   --------------------------------------------------------------------------- */

/** requestAnimationFrame double-tick: guarantees the browser has painted. */
export function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export function debounce(fn, wait = 220) {
  let timer = 0;

  const debounced = (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };

  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

export function throttle(fn, wait = 120) {
  let last = 0;
  let timer = 0;

  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);

    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = window.setTimeout(() => {
        last = Date.now();
        timer = 0;
        fn(...args);
      }, remaining);
    }
  };
}

/** Smooth-scroll an element into view, respecting reduced-motion. */
export function scrollIntoViewSafe(target, options = {}) {
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start', ...options });
}

/** Scroll back to the top of the page — used on every route change. */
export function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'instant' in document.documentElement.style ? 'auto' : 'auto' });
}

/** Copy to clipboard with a graceful fallback for non-secure contexts. */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Deterministic pseudo-random in [0,1) from a string seed. */
export function seededRandom(seed) {
  let h = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Pick one element from a list using the seeded RNG. */
export function seededPick(list, seed) {
  if (!list.length) return undefined;
  return list[Math.floor(seededRandom(seed) * list.length)];
}

/** Clamp a number into a range. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Group an array into a Map by a key function. */
export function groupBy(items, keyFn) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

/** Unique values, preserving first-seen order. */
export function unique(items) {
  return [...new Set(items)];
}

/** Fisher–Yates shuffle on a copy. */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

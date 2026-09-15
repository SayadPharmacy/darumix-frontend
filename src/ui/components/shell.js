/**
 * DARUMIX — application shell: glass header, mobile nav, footer, ambient
 * background, drawers and overlays.
 *
 * The shell is mounted once by main.js and stays alive across navigations; it
 * subscribes to the store so the cart badge, wishlist count and header state
 * update without any page having to know about it.
 */

import { html, raw, el, qs, qsa, delegate, on, lockScroll, unlockScroll, trapFocus, throttle } from '../../core/dom.js';
import { icon } from '../icons.js';
import { to, parseLocation } from '../../core/router.js';
import { appEvents, EVENTS } from '../../core/event-bus.js';
import { subscribe } from '../../core/store.js';
import { toPersianDigits, formatPrice } from '../../core/format.js';
import { categories } from '../../data/categories.js';
import * as cart from '../../services/cart.js';
import * as account from '../../services/account.js';

/* ==========================================================================
   Ambient background — the layer that makes the glass read as glass
   ========================================================================== */

export function ambientBackground() {
  const node = el('div', { class: 'ambient', 'aria-hidden': 'true' });
  node.innerHTML = html`
    <div class="ambient__orb ambient__orb--a"></div>
    <div class="ambient__orb ambient__orb--b"></div>
    <div class="ambient__orb ambient__orb--c"></div>
    <div class="ambient__grain"></div>
  `.toString();

  return node;
}

/* ==========================================================================
   Logo
   ========================================================================== */

export function logoMarkup(size = 40) {
  return `
    <span class="brand__mark" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
        <path d="M23 18.5h8.4c8.6 0 14.1 5.1 14.1 13.5S39.9 45.5 31.3 45.5H23z" stroke="#fff" stroke-width="4.4" stroke-linejoin="round"/>
        <path d="M30.4 26.5h1.1c3.7 0 6.2 2.2 6.2 5.5s-2.5 5.5-6.2 5.5h-1.1z" fill="#a9f0d8"/>
        <circle cx="45.4" cy="19.6" r="4.2" fill="#eddaab"/>
      </svg>
    </span>
  `;
}

export function brandLink() {
  const node = el('a', { class: 'brand', href: to('/'), 'aria-label': 'دارومیکس — صفحه اصلی' });
  node.innerHTML = `
    ${logoMarkup()}
    <span class="brand__text">
      <span class="brand__name">دارومیکس</span>
      <span class="brand__tag">داروخانه آنلاین و خدمات سلامت</span>
    </span>
  `;

  return node;
}

/* ==========================================================================
   Header
   ========================================================================== */

const PRIMARY_NAV = [
  { path: '/', label: 'خانه', icon: 'home' },
  { path: '/catalog', label: 'فروشگاه', icon: 'grid', match: ['/catalog', '/product', '/category'] },
  { path: '/categories', label: 'دسته‌بندی‌ها', icon: 'layers', match: ['/categories'] },
  { path: '/prescription', label: 'ثبت نسخه', icon: 'prescription' },
  { path: '/consultation', label: 'مشاوره داروساز', icon: 'stethoscope' },
  { path: '/magazine', label: 'مجله سلامت', icon: 'bookmark' },
  { path: '/contact', label: 'تماس با ما', icon: 'phone' }
];

export function header() {
  const node = el('header', { class: 'site-header' });

  node.innerHTML = html`
    <div class="site-header__inner">
      <button class="icon-btn nav-toggle" type="button" data-open-nav aria-label="منوی اصلی" aria-expanded="false">
        ${raw(icon('menu', { size: 22 }))}
      </button>

      <span data-slot="brand"></span>

      <nav class="main-nav" aria-label="ناوبری اصلی">
        ${PRIMARY_NAV.map(
          (item) =>
            html`<a class="main-nav__link" href="${to(item.path)}" data-nav="${item.path}" data-match="${(item.match || [item.path]).join(',')}">
              ${item.label}
            </a>`
        )}
      </nav>

      <div class="header-actions">
        <button class="search-trigger" type="button" data-open-search aria-label="جستجوی محصولات">
          ${raw(icon('search', { size: 17 }))}
          <span class="search-trigger__label">جستجو در دارو، مکمل و لوازم بهداشتی…</span>
          <span class="search-trigger__hint" aria-hidden="true">Ctrl K</span>
        </button>

        <a class="icon-btn tip hide-mobile" href="${to('/compare')}" data-tip="مقایسه محصولات" aria-label="مقایسه محصولات" data-slot="compare-link">
          ${raw(icon('scale', { size: 20 }))}
          <span class="icon-btn__badge icon-btn__badge--muted" data-badge="compare" hidden>۰</span>
        </a>

        <a class="icon-btn tip" href="${to('/wishlist')}" data-tip="علاقه‌مندی‌ها" aria-label="لیست علاقه‌مندی‌ها" data-slot="wishlist-link">
          ${raw(icon('heart', { size: 20 }))}
          <span class="icon-btn__badge" data-badge="wishlist" hidden>۰</span>
        </a>

        <a class="icon-btn tip hide-mobile" href="${to('/account/notifications')}" data-tip="اعلان‌ها" aria-label="اعلان‌ها" data-slot="notif-link">
          ${raw(icon('bell', { size: 20 }))}
          <span class="icon-btn__badge icon-btn__badge--gold" data-badge="notifications" hidden>۰</span>
        </a>

        <button class="icon-btn tip" type="button" data-open-cart data-tip="سبد خرید" aria-label="سبد خرید" data-slot="cart-button">
          ${raw(icon('cart', { size: 20 }))}
          <span class="icon-btn__badge" data-badge="cart" hidden>۰</span>
        </button>

        <a class="icon-btn tip" href="${to('/account')}" data-tip="حساب کاربری" aria-label="حساب کاربری">
          ${raw(icon('user', { size: 20 }))}
        </a>
      </div>
    </div>
  `.toString();

  qs('[data-slot="brand"]', node).replaceWith(brandLink());

  /* --- Badge + active-link syncing -------------------------------------- */
  const disposers = [];

  function syncBadges() {
    const counts = {
      cart: cart.count(),
      wishlist: account.wishlistIds().length,
      compare: account.compareIds().length,
      notifications: account.unreadCount()
    };

    Object.entries(counts).forEach(([key, value]) => {
      const badge = qs(`[data-badge="${key}"]`, node);
      if (!badge) return;

      badge.hidden = value <= 0;
      badge.textContent = toPersianDigits(value > 99 ? '۹+' : value);
    });
  }

  function syncActive() {
    const { path } = parseLocation();

    qsa('[data-nav]', node).forEach((link) => {
      const patterns = link.dataset.match.split(',');
      const active = patterns.some((pattern) => path === pattern || path.startsWith(`${pattern}/`));
      link.classList.toggle('is-active', active);

      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  /** Solidify the bar once the page has scrolled beneath it. */
  const onScroll = throttle(() => {
    node.classList.toggle('is-scrolled', window.scrollY > 8);
  }, 100);

  disposers.push(on(window, 'scroll', onScroll, { passive: true }));
  onScroll();

  disposers.push(subscribe(syncBadges));
  disposers.push(appEvents.on(EVENTS.routeChange, syncActive));

  syncBadges();
  syncActive();

  return {
    node,
    cleanup: () => disposers.forEach((dispose) => dispose())
  };
}

/* ==========================================================================
   Mobile navigation drawer
   ========================================================================== */

export function mobileNav() {
  const node = el('div', { class: 'mobile-nav' });

  const mainLinks = PRIMARY_NAV.map(
    (item) => html`
      <a class="mobile-nav__link" href="${to(item.path)}" data-nav="${item.path}" data-match="${(item.match || [item.path]).join(',')}">
        ${raw(icon(item.icon, { size: 19 }))}
        <span>${item.label}</span>
      </a>
    `
  );

  const accountLinks = [
    { path: '/account', label: 'پیشخوان حساب', icon: 'user' },
    { path: '/account/orders', label: 'سفارش‌های من', icon: 'package' },
    { path: '/account/prescriptions', label: 'نسخه‌های من', icon: 'prescription' },
    { path: '/account/reviews', label: 'نظرات من', icon: 'star' },
    { path: '/wishlist', label: 'علاقه‌مندی‌ها', icon: 'heart' },
    { path: '/compare', label: 'مقایسه محصولات', icon: 'scale' },
    { path: '/recently-viewed', label: 'بازدیدهای اخیر', icon: 'history' }
  ].map(
    (item) => html`
      <a class="mobile-nav__link" href="${to(item.path)}">
        ${raw(icon(item.icon, { size: 19 }))}
        <span>${item.label}</span>
      </a>
    `
  );

  node.innerHTML = html`
    <div class="mobile-nav__group">
      <p class="mobile-nav__group-title">فروشگاه</p>
      <ul class="mobile-nav__list">
        ${mainLinks.map((link) => raw(html`<li>${raw(link)}</li>`))}
      </ul>
    </div>

    <div class="mobile-nav__group">
      <p class="mobile-nav__group-title">حساب کاربری</p>
      <ul class="mobile-nav__list">
        ${accountLinks.map((link) => raw(html`<li>${raw(link)}</li>`))}
      </ul>
    </div>

    <div class="mobile-nav__group">
      <p class="mobile-nav__group-title">دسته‌بندی‌های پرطرفدار</p>
      <div class="chip-row">
        ${categories.slice(0, 8).map(
          (category) => raw(html`<a class="chip" href="${to('/catalog', { category: category.id })}">${category.title}</a>`)
        )}
      </div>
    </div>

    <div class="alert alert--info">
      ${raw(icon('info', { size: 18 }))}
      <span>این یک نسخه نمایشی است؛ داده‌ها روی همین مرورگر ذخیره می‌شوند و به هیچ سروری ارسال نمی‌شوند.</span>
    </div>
  `.toString();

  const syncActive = () => {
    const { path } = parseLocation();

    qsa('[data-nav]', node).forEach((link) => {
      const patterns = link.dataset.match.split(',');
      link.classList.toggle(
        'is-active',
        patterns.some((pattern) => path === pattern || path.startsWith(`${pattern}/`))
      );
    });
  };

  const disposeRoute = appEvents.on(EVENTS.routeChange, syncActive);
  syncActive();

  return { node, cleanup: disposeRoute };
}

/* ==========================================================================
   Search overlay
   ========================================================================== */

export function searchOverlay() {
  const node = el('div', {
    class: 'search-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'جستجوی محصولات'
  });

  node.innerHTML = html`
    <div class="search-overlay__panel" role="document">
      <div class="row">
        <div class="input-icon grow">
          ${raw(icon('search', { size: 18 }))}
          <input
            class="input"
            type="search"
            placeholder="نام دارو، مکمل، برند یا دسته‌بندی…"
            aria-label="عبارت جستجو"
            autocomplete="off"
            data-slot="input"
          />
        </div>
        <button class="icon-btn" type="button" data-close-search aria-label="بستن جستجو">
          ${raw(icon('close', { size: 20 }))}
        </button>
      </div>

      <div data-slot="results" class="search-results"></div>

      <div class="row row--between fs-xs text-soft">
        <span>برای بستن کلید Esc را بزنید</span>
        <a class="text-brand fw-semibold" href="${to('/catalog')}" data-close-search>مشاهده همه محصولات</a>
      </div>
    </div>
  `.toString();

  const input = qs('[data-slot="input"]', node);
  const results = qs('[data-slot="results"]', node);

  /*
   * The catalog service and the artwork renderer are loaded lazily so the
   * always-present shell stays small; a visitor who never opens search never
   * downloads either module.
   */
  let catalogModule = null;
  let artModule = null;

  async function ensureModules() {
    if (!catalogModule) catalogModule = await import('../../services/catalog.js');
    if (!artModule) artModule = await import('../product-art.js');
    return { catalog: catalogModule, art: artModule };
  }

  function renderIdle() {
    const history = account.searchHistory();

    if (!history.length) {
      const popularTerms = ['ویتامین D', 'استامینوفن', 'ضدآفتاب', 'شیر خشک', 'فشارسنج', 'امگا ۳'];

      results.innerHTML = html`
        <p class="mobile-nav__group-title">جستجوهای پرطرفدار</p>
        <div class="chip-row">
          ${popularTerms.map(
            (term) => raw(html`<button class="chip" type="button" data-term="${term}">${term}</button>`)
          )}
        </div>
      `.toString();
      return;
    }

    results.innerHTML = html`
      <div class="row row--between">
        <p class="mobile-nav__group-title">جستجوهای اخیر</p>
        <button class="btn btn--ghost btn--xs" type="button" data-clear-history>پاک کردن</button>
      </div>
      <div class="chip-row">
        ${history.map((term) => raw(html`<button class="chip" type="button" data-term="${term}">${term}</button>`))}
      </div>
    `.toString();
  }

  async function runSearch(term) {
    const query = String(term || '').trim();

    if (query.length < 2) {
      renderIdle();
      return;
    }

    const { catalog, art } = await ensureModules();
    const { items, total } = catalog.list(catalog.parseFilters({ q: query, perPage: 6 }));

    if (!items.length) {
      results.innerHTML = html`
        <p class="text-muted fs-sm mb-0">
          نتیجه‌ای برای «${query}» یافت نشد. عبارت دیگری را امتحان کنید.
        </p>
      `.toString();
      return;
    }

    results.innerHTML = html`
      ${items.map(
        (product) => raw(html`
          <a class="search-result" href="${to(`/product/${product.slug}`)}" data-close-search>
            <span class="search-result__media">
              ${raw(art.productArt(product))}
            </span>
            <span>
              <span class="search-result__title">${product.name}</span>
              <span class="search-result__meta">${product.brandName} · ${product.categoryTitle}</span>
            </span>
            <span class="price__now">${formatPrice(product.price, { withUnit: false })}</span>
          </a>
        `)
      )}
      <a class="btn btn--glass btn--sm w-full mt-2" href="${to('/catalog', { q: query })}" data-close-search>
        مشاهده همه ${toPersianDigits(total)} نتیجه
        ${raw(icon('arrowLeft', { size: 16 }))}
      </a>
    `.toString();
  }

  let debounceTimer = 0;
  const disposers = [];

  disposers.push(
    on(input, 'input', () => {
      clearTimeout(debounceTimer);
      const value = input.value;
      debounceTimer = window.setTimeout(() => runSearch(value), 180);
    })
  );

  disposers.push(
    on(input, 'keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const term = input.value.trim();
        if (term) {
          account.rememberSearch(term);
          close();
          window.location.hash = to('/catalog', { q: term }).slice(1);
        }
      }
    })
  );

  disposers.push(
    delegate(node, 'click', '[data-term]', (event, button) => {
      event.preventDefault();
      input.value = button.dataset.term;
      runSearch(button.dataset.term);
      input.focus();
    })
  );

  disposers.push(
    delegate(node, 'click', '[data-clear-history]', (event) => {
      event.preventDefault();
      account.clearSearchHistory();
      renderIdle();
    })
  );

  /* Close when the backdrop (not the panel) is clicked. */
  disposers.push(
    on(node, 'click', (event) => {
      if (event.target === node) close();
    })
  );

  let releaseFocus = () => {};

  function open() {
    if (node.classList.contains('is-open')) return;

    node.classList.add('is-open');
    lockScroll();
    releaseFocus = trapFocus(node);
    renderIdle();

    // Focus after the transition starts so the caret lands visibly.
    window.setTimeout(() => input.focus(), 60);
  }

  function close() {
    if (!node.classList.contains('is-open')) return;

    node.classList.remove('is-open');
    unlockScroll();
    releaseFocus();
    input.value = '';
  }

  function toggle() {
    if (node.classList.contains('is-open')) close();
    else open();
  }

  /** Ctrl/Cmd+K opens search from anywhere in the app. */
  disposers.push(
    on(window, 'keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle();
      }
    })
  );

  disposers.push(appEvents.on(EVENTS.openSearch, open));
  disposers.push(appEvents.on(EVENTS.closeSearch, close));

  // Closing on navigation keeps the overlay from surviving a route change.
  disposers.push(appEvents.on(EVENTS.routeChange, close));

  return {
    node,
    open,
    close,
    isOpen: () => node.classList.contains('is-open'),
    cleanup: () => {
      clearTimeout(debounceTimer);
      disposers.forEach((dispose) => dispose());
    }
  };
}

/* ==========================================================================
   Generic side drawer (cart, filters, details)
   ========================================================================== */

/**
 * @param {object} options
 * @param {string} options.title
 * @param {'start'|'end'|'bottom'} [options.side]
 * @param {string} [options.countLabel]
 * @param {boolean} [options.wide]
 */
export function drawer(options) {
  const { title, side = 'end', countLabel = '', wide = false } = options;

  const node = el('aside', {
    class: `drawer drawer--${side}${wide ? ' drawer--wide' : ''}`,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title
  });

  node.innerHTML = html`
    <header class="drawer__header">
      <h2 class="drawer__title">
        ${title}
        <span class="drawer__count" data-slot="count" ${countLabel ? '' : 'hidden'}>${countLabel}</span>
      </h2>
      <button class="icon-btn drawer__close" type="button" data-close aria-label="بستن">
        ${raw(icon('close', { size: 20 }))}
      </button>
    </header>
    <div class="drawer__body" data-slot="body"></div>
    <footer class="drawer__footer" data-slot="footer" hidden></footer>
  `.toString();

  const body = qs('[data-slot="body"]', node);
  const footer = qs('[data-slot="footer"]', node);
  const countSlot = qs('[data-slot="count"]', node);

  let releaseFocus = () => {};
  const disposers = [];

  function open() {
    if (node.classList.contains('is-open')) return;
    node.classList.add('is-open');
    lockScroll();
    releaseFocus = trapFocus(node);
  }

  function close() {
    if (!node.classList.contains('is-open')) return;
    node.classList.remove('is-open');
    unlockScroll();
    releaseFocus();
    if (options.onClose) options.onClose();
  }

  disposers.push(delegate(node, 'click', '[data-close]', (event) => {
    event.preventDefault();
    close();
  }));

  disposers.push(
    on(window, 'keydown', (event) => {
      if (event.key === 'Escape' && node.classList.contains('is-open')) close();
    })
  );

  return {
    node,
    body,
    footer,
    countSlot,
    open,
    close,
    isOpen: () => node.classList.contains('is-open'),
    setCount(text) {
      countSlot.textContent = text;
      countSlot.hidden = !text;
    },
    setFooter(content) {
      if (content == null) {
        footer.innerHTML = '';
        footer.hidden = true;
      } else {
        footer.innerHTML = content;
        footer.hidden = false;
      }
    },
    cleanup: () => disposers.forEach((dispose) => dispose())
  };
}

/* ==========================================================================
   Overlay backdrop
   ========================================================================== */

export function overlay() {
  const node = el('div', { class: 'overlay', hidden: true });
  return {
    node,
    show: () => {
      node.hidden = false;
      requestAnimationFrame(() => node.classList.add('is-open'));
    },
    hide: () => {
      node.classList.remove('is-open');
      window.setTimeout(() => {
        if (!node.classList.contains('is-open')) node.hidden = true;
      }, 240);
    }
  };
}

/* ==========================================================================
   Footer
   ========================================================================== */

const FOOTER_COLUMNS = [
  {
    title: 'دسترسی سریع',
    links: [
      { path: '/catalog', label: 'فروشگاه' },
      { path: '/categories', label: 'دسته‌بندی‌ها' },
      { path: '/prescription', label: 'ثبت نسخه' },
      { path: '/consultation', label: 'مشاوره داروساز' },
      { path: '/magazine', label: 'مجله سلامت' }
    ]
  },
  {
    title: 'خدمات مشتریان',
    links: [
      { path: '/account/orders', label: 'پیگیری سفارش' },
      { path: '/faq', label: 'سوالات متداول' },
      { path: '/contact', label: 'تماس و شعبه‌ها' },
      { path: '/about', label: 'درباره دارومیکس' },
      { path: '/compare', label: 'مقایسه محصولات' }
    ]
  },
  {
    title: 'حساب من',
    links: [
      { path: '/account', label: 'پیشخوان' },
      { path: '/wishlist', label: 'علاقه‌مندی‌ها' },
      { path: '/recently-viewed', label: 'بازدیدهای اخیر' },
      { path: '/account/notifications', label: 'اعلان‌ها' },
      { path: '/admin', label: 'پنل مدیریت (نمایشی)' }
    ]
  }
];

export function footer() {
  const node = el('footer', { class: 'site-footer' });
  const year = toPersianDigits(new Date().getFullYear());

  node.innerHTML = html`
    <div class="glass-2 site-footer__glass">
      <div class="shell shell--content">
        <div class="footer-grid">
          <div>
            <span data-slot="brand"></span>
            <p class="text-muted fs-sm mt-4">
              دارومیکس یک داروخانه آنلاین است که خرید دارو، مکمل و محصولات سلامت را ساده، سریع و مطمئن می‌کند.
              تیم داروسازان ما در تمام مراحل خرید و مصرف در کنار شماست.
            </p>
            <div class="trust-tile mt-4">
              ${raw(icon('shieldCheck', { size: 16 }))}
              <span>نمایشی — بدون پرداخت واقعی و بدون ارسال داده</span>
            </div>
            <div class="social-row mt-4">
              <a class="icon-btn" href="${to('/contact')}" aria-label="اینستاگرام دارومیکس">${raw(icon('share', { size: 18 }))}</a>
              <a class="icon-btn" href="${to('/contact')}" aria-label="تلگرام دارومیکس">${raw(icon('send', { size: 18 }))}</a>
              <a class="icon-btn" href="${to('/contact')}" aria-label="ایمیل دارومیکس">${raw(icon('mail', { size: 18 }))}</a>
            </div>
          </div>

          ${FOOTER_COLUMNS.map(
            (column) => raw(html`
              <div>
                <h3 class="footer-col__title">${column.title}</h3>
                <ul class="footer-links">
                  ${column.links.map(
                    (link) => raw(html`<li><a href="${to(link.path)}">${link.label}</a></li>`)
                  )}
                </ul>
              </div>
            `)
          )}
        </div>

        <div class="footer-bottom">
          <span>© ${year} دارومیکس — تمامی حقوق برای این نمونه نمایشی محفوظ است.</span>
          <div class="footer-badges">
            <span class="trust-tile">${raw(icon('truck', { size: 16 }))} ارسال سریع</span>
            <span class="trust-tile">${raw(icon('shieldCheck', { size: 16 }))} اصالت کالا</span>
            <span class="trust-tile">${raw(icon('stethoscope', { size: 16 }))} مشاوره رایگان</span>
          </div>
        </div>
      </div>
    </div>
  `.toString();

  qs('[data-slot="brand"]', node).replaceWith(brandLink());

  return { node };
}

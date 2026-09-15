/**
 * DARUMIX — shared UI components.
 *
 * Every page composes these. They all follow the same contract:
 *   fn(options) → { node: HTMLElement, cleanup?: () => void }
 * so the router can mount them and tear down their listeners on navigation.
 *
 * All markup goes through `html` (auto-escaping) — see core/dom.js.
 */

import {
  html,
  raw,
  el,
  qs,
  delegate,
  copyText,
  nextFrame,
} from "../../core/dom.js";
import { icon } from "../icons.js";
import { productArt } from "../product-art.js";
import {
  formatPrice,
  toPersianDigits,
  discountPercent,
} from "../../core/format.js";
import { navigate, to } from "../../core/router.js";
import { appEvents, EVENTS } from "../../core/event-bus.js";

/* ==========================================================================
   1. States — loading, empty, error, success
   ========================================================================== */

/** Full-section empty state. */
export function emptyState(options = {}) {
  const {
    title = "موردی یافت نشد",
    text = "هنوز چیزی در این بخش وجود ندارد.",
    iconName = "search",
    action,
    compact = false,
    tone = "neutral",
  } = options;

  const node = el("div", {
    class: `state-block${compact ? " state-block--compact" : ""}`,
  });

  node.innerHTML = html`
    <div class="state-block__icon">${raw(icon(iconName, { size: 30 }))}</div>
    <h3 class="state-block__title">${title}</h3>
    ${text ? html`<p class="state-block__text">${text}</p>` : ""}
  `.toString();

  if (action) {
    const button = el("button", {
      class: `btn ${action.variant || "btn--primary"}`,
      type: "button",
      text: action.label,
    });

    button.addEventListener("click", () => {
      if (typeof action.onClick === "function") action.onClick();
      else if (action.href) navigate(action.href.replace(/^#/, ""));
    });

    node.append(button);
  }

  if (tone === "error" || tone === "success") {
    node.classList.add(`state-block--${tone}`);
  }

  return { node };
}

export function errorState(options = {}) {
  return emptyState({
    iconName: "alert",
    title: "مشکلی پیش آمد",
    text: "بارگذاری این بخش ناموفق بود. لطفاً دوباره تلاش کنید.",
    tone: "error",
    action: {
      label: "تلاش مجدد",
      variant: "btn--glass",
      onClick: () => window.location.reload(),
    },
    ...options,
  });
}

export function successState(options = {}) {
  return emptyState({
    iconName: "checkCircle",
    title: "با موفقیت انجام شد",
    tone: "success",
    ...options,
  });
}

/** Centred spinner with a label. */
export function loadingState(label = "در حال بارگذاری…") {
  const node = el("div", {
    class: "loader",
    role: "status",
    "aria-live": "polite",
  });
  node.innerHTML = html`
    <span class="loader__ring" aria-hidden="true"></span>
    <span>${label}</span>
  `.toString();

  return { node };
}

/** Skeleton placeholder for a grid of product cards. */
export function productSkeletonGrid(count = 8) {
  const cards = Array.from({ length: count }, () =>
    raw(html`
      <div class="p-card glass radius-xl" aria-hidden="true">
        <div class="p-card__media">
          <div class="skeleton skeleton--img"></div>
        </div>
        <div class="p-card__body">
          <div class="skeleton skeleton--text skeleton--line-40"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text skeleton--line-80"></div>
          <div class="skeleton skeleton--text skeleton--line-60"></div>
        </div>
      </div>
    `),
  );

  const node = el("div", {
    class: "product-grid",
    "aria-busy": "true",
    "aria-label": "در حال بارگذاری محصولات",
  });
  node.innerHTML = cards.join("");

  return { node };
}

/** Skeleton for a table. */
export function tableSkeleton(rows = 6, columns = 5) {
  const body = Array.from({ length: rows }, () =>
    raw(
      `<tr>${Array.from({ length: columns }, () => '<td><div class="skeleton skeleton--text"></div></td>').join("")}</tr>`,
    ),
  );

  const node = el("div", { class: "table-wrap", "aria-busy": "true" });
  node.innerHTML = html`
    <table class="table">
      <tbody>
        ${raw(body.join(""))}
      </tbody>
    </table>
  `.toString();

  return { node };
}

/* ==========================================================================
   2. Small display atoms
   ========================================================================== */

/** Star rating with half-star support. */
export function ratingStars(rating = 0, options = {}) {
  const { size = 15, showValue = true, count = null, small = false } = options;
  const rounded = Math.round(rating * 2) / 2;

  const stars = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const modifier =
      position <= rounded
        ? ""
        : position - 0.5 === rounded
          ? " star--half"
          : " star--empty";
    return icon("star", { size, filled: true, className: modifier.trim() });
  }).join("");

  return html`
    <span class="rating${small ? " rating--sm" : ""}">
      <span class="rating__stars" aria-hidden="true">${raw(stars)}</span>
      <span class="visually-hidden"
        >امتیاز ${toPersianDigits(rating.toFixed(1))} از ۵</span
      >
      ${showValue
        ? html`<span class="rating__value"
            >${toPersianDigits(rating.toFixed(1))}</span
          >`
        : ""}
      ${count != null
        ? html`<span class="text-soft">(${toPersianDigits(count)} نظر)</span>`
        : ""}
    </span>
  `.toString();
}

/** Price block: current, old, and discount percentage. */
export function priceBlock(product, options = {}) {
  const { size = "md", showDiscount = true } = options;
  const nowClass =
    size === "lg" ? "price__now--lg" : size === "xl" ? "price__now--xl" : "";
  const off =
    product.discount ?? discountPercent(product.price, product.compareAt);

  return html`
    <span class="price">
      <span class="price__now ${nowClass}"
        >${formatPrice(product.price, { withUnit: false })}</span
      >
      <span class="price__unit">تومان</span>
      ${product.compareAt && off
        ? html`<span class="price__old"
            >${formatPrice(product.compareAt, { withUnit: false })}</span
          >`
        : ""}
      ${showDiscount && off
        ? html`<span class="price__off">${toPersianDigits(off)}٪</span>`
        : ""}
    </span>
  `.toString();
}

/** Status badge using the tone vocabulary from data/statuses.js. */
export function statusBadge(status, options = {}) {
  const { size = "", withIcon = true, withDot = false } = options;
  const toneMap = {
    brand: "badge--brand",
    mint: "badge--mint",
    gold: "badge--gold",
    danger: "badge--danger",
    warn: "badge--warn",
    info: "badge--info",
    neutral: "badge--neutral",
  };

  const classes = [
    "badge",
    toneMap[status.tone] || "badge--neutral",
    size === "lg" ? "badge--lg" : "",
    withDot ? "badge--dot" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return html`
    <span class="${classes}">
      ${withIcon && !withDot && status.icon
        ? raw(icon(status.icon, { size: 13 }))
        : ""}
      ${status.label || status.id}
    </span>
  `.toString();
}

/** Stock indicator with dot + label. */
export function stockIndicator(product) {
  const state = product.stock <= 0 ? "out" : product.stock <= 12 ? "low" : "in";
  const label =
    state === "out"
      ? "ناموجود"
      : state === "low"
        ? `تنها ${toPersianDigits(product.stock)} عدد باقی مانده`
        : "موجود در انبار";

  return html`
    <span class="p-card__stock p-card__stock--${state}">
      <span
        class="dot ${state === "out"
          ? "dot--danger"
          : state === "low"
            ? "dot--warn"
            : "dot--success"}"
      ></span>
      ${label}
    </span>
  `.toString();
}

/** Breadcrumb trail. */
export function breadcrumbs(trail = []) {
  const items = trail.map((crumb, index) => {
    const isLast = index === trail.length - 1;

    if (isLast) {
      return html`<span aria-current="page">${crumb.label}</span>`;
    }

    return html`
      <a href="${to(crumb.href || "/")}">${crumb.label}</a>
      <span class="breadcrumbs__sep" aria-hidden="true"
        >${raw(icon("chevronLeft", { size: 13 }))}</span
      >
    `;
  });

  return html`<nav class="breadcrumbs" aria-label="مسیر صفحه">
    ${items}
  </nav>`.toString();
}

/** Section heading with optional action link. */
export function sectionHead(options = {}) {
  const {
    title,
    subtitle,
    iconName,
    actionHref,
    actionLabel,
    actionIcon = "arrowLeft",
  } = options;

  return html`
    <div class="section-head">
      <div class="section-head__text">
        <h2 class="section-head__title">
          ${iconName ? raw(icon(iconName, { size: 24 })) : ""} ${title}
        </h2>
        ${subtitle ? html`<p class="section-head__sub">${subtitle}</p>` : ""}
      </div>
      ${actionHref
        ? html`
            <a class="btn btn--glass btn--sm" href="${to(actionHref)}">
              ${actionLabel} ${raw(icon(actionIcon, { size: 16 }))}
            </a>
          `
        : ""}
    </div>
  `.toString();
}

/** Page intro block used at the top of every secondary page. */
export function pageIntro(options = {}) {
  const { title, text, trail } = options;

  return html`
    ${trail ? raw(breadcrumbs(trail)) : ""}
    <header class="page-intro">
      <h1 class="page-intro__title">${title}</h1>
      ${text ? html`<p class="page-intro__text">${text}</p>` : ""}
    </header>
  `.toString();
}

/** KPI stat tile for dashboards. */
export function statTile(options = {}) {
  const {
    label,
    value,
    iconName = "chart",
    tone = "",
    change = null,
    hint = "",
    href = null,
  } = options;

  const trend =
    change == null
      ? ""
      : html`
          <span class="trend ${change >= 0 ? "trend--up" : "trend--down"}">
            ${raw(
              icon(change >= 0 ? "trendingUp" : "trendingDown", { size: 13 }),
            )}
            ${toPersianDigits(Math.abs(change))}٪
          </span>
        `;

  const content = html`
    <div class="stat__top">
      <span class="stat__icon ${tone ? `stat__icon--${tone}` : ""}"
        >${raw(icon(iconName, { size: 20 }))}</span
      >
      <div>
        <div class="stat__label">${label}</div>
      </div>
    </div>
    <div class="stat__value">${value}</div>
    ${change != null || hint
      ? html`<div class="stat__foot">
          ${trend}${hint ? html`<span>${hint}</span>` : ""}
        </div>`
      : ""}
  `.toString();

  if (href) {
    const link = el("a", { class: "stat glass radius-lg", href: to(href) });
    link.innerHTML = content;
    return link;
  }

  const node = el("div", { class: "stat glass radius-lg" });
  node.innerHTML = content;
  return node;
}

/** Progress meter. */
export function meter(percent, tone = "") {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return html`
    <div
      class="meter"
      role="progressbar"
      aria-valuenow="${toPersianDigits(value)}"
      aria-valuemin="0"
      aria-valuemax="۱۰۰"
    >
      <div
        class="meter__fill ${tone ? `meter__fill--${tone}` : ""}"
        style="width: ${value}%"
      ></div>
    </div>
  `.toString();
}

/* ==========================================================================
   3. Product card
   ========================================================================== */

/**
 * Product card for grids and rails.
 *
 * @param {object} product decorated product (see services/catalog.js)
 * @param {object} [options]
 * @param {object} [options.actions]  { wishlist, compare, add } handlers
 * @param {'grid'|'compact'} [options.variant]
 */
export function productCard(product, options = {}) {
  const {
    actions = {},
    variant = "grid",
    onAdd,
    badges = true,
    showQuickActions = true,
  } = options;

  const node = el("article", {
    class: "p-card glass radius-xl",
    "data-product-id": product.id,
  });
  const off =
    product.discount ?? discountPercent(product.price, product.compareAt);

  node.innerHTML = html`
    <div class="p-card__media">
      ${badges
        ? html`
            <div class="p-card__badges">
              ${off
                ? html`<span class="badge badge--danger"
                    >${toPersianDigits(off)}٪ تخفیف</span
                  >`
                : ""}
              ${product.rx
                ? html`<span class="badge badge--info"
                    >${raw(icon("prescription", { size: 13 }))} نسخه‌ای</span
                  >`
                : ""}
              ${product.featured && !off
                ? html`<span class="badge badge--gold"
                    >${raw(icon("crown", { size: 13 }))} ویژه</span
                  >`
                : ""}
              ${product.stock <= 0
                ? html`<span class="badge badge--neutral">ناموجود</span>`
                : ""}
            </div>
          `
        : ""}
      ${showQuickActions
        ? html`
            <div class="p-card__float">
              <button
                class="icon-btn tip"
                type="button"
                data-action="wishlist"
                data-tip="افزودن به علاقه‌مندی"
                aria-label="افزودن ${product.name} به علاقه‌مندی‌ها"
              >
                ${raw(icon("heart", { size: 17 }))}
              </button>
              <button
                class="icon-btn tip"
                type="button"
                data-action="compare"
                data-tip="افزودن به مقایسه"
                aria-label="افزودن ${product.name} به مقایسه"
              >
                ${raw(icon("scale", { size: 17 }))}
              </button>
            </div>
          `
        : ""}
      ${raw(productArt(product, { title: product.name }))}
    </div>

    <div class="p-card__body">
      <span class="p-card__brand">${product.brandName}</span>
      <h3 class="p-card__title clamp-2">
        <a href="${to(`/product/${product.slug}`)}">${product.name}</a>
      </h3>
      <div class="p-card__meta">
        ${raw(
          ratingStars(product.rating, {
            size: 13,
            count: variant === "grid" ? product.reviewCount : null,
          }),
        )}
      </div>
      ${variant === "grid"
        ? html`<div>${raw(stockIndicator(product))}</div>`
        : ""}
      <div class="p-card__foot">${raw(priceBlock(product))}</div>
    </div>
  `.toString();

  // Add-to-cart button is built as a real node so its busy state can be
  // animated without re-rendering the card.
  const addButton = el("button", {
    class: "btn btn--primary btn--sm p-card__add",
    type: "button",
    "data-action": "add",
    "aria-label": `افزودن ${product.name} به سبد خرید`,
  });

  addButton.innerHTML = html`${raw(icon("cart", { size: 16 }))}<span
      >افزودن</span
    >`.toString();

  if (product.stock <= 0) {
    addButton.disabled = true;
    addButton.setAttribute("aria-disabled", "true");
    addButton.innerHTML = html`<span>ناموجود</span>`.toString();
  }

  qs(".p-card__foot", node).append(addButton);

  // --- Interactions -------------------------------------------------------
  const disposers = [];

  disposers.push(
    delegate(node, "click", '[data-action="add"]', async (event, button) => {
      event.preventDefault();
      if (button.disabled) return;

      button.classList.add("is-busy");
      const result = await (onAdd
        ? onAdd(product)
        : Promise.resolve({ ok: true }));

      if (result && result.ok === false) {
        button.classList.remove("is-busy");
        return;
      }

      // Brief confirmation on the button itself — cheaper than a toast for
      // the most frequent action in the app.
      button.classList.remove("btn--primary");
      button.classList.add("btn--soft");
      button.innerHTML = html`${raw(icon("check", { size: 16 }))}<span
          >افزوده شد</span
        >`.toString();

      window.setTimeout(() => {
        if (!document.contains(button)) return;
        button.classList.remove("btn--soft");
        button.classList.add("btn--primary");
        button.innerHTML = html`${raw(icon("cart", { size: 16 }))}<span
            >افزودن</span
          >`.toString();
      }, 1400);
    }),
  );

  disposers.push(
    delegate(node, "click", '[data-action="wishlist"]', (event, button) => {
      event.preventDefault();
      if (actions.onWishlist) actions.onWishlist(product, button);
    }),
  );

  disposers.push(
    delegate(node, "click", '[data-action="compare"]', (event, button) => {
      event.preventDefault();
      if (actions.onCompare) actions.onCompare(product, button);
    }),
  );

  return {
    node,
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

/** Compact horizontal product row (cart, wishlist, compare, order items). */
export function productRow(product, options = {}) {
  const {
    endContent = null,
    metaContent = null,
    quantity = null,
    href = null,
  } = options;

  const node = el("article", {
    class: "p-row glass radius-lg",
    "data-product-id": product.id,
  });
  const link = href || to(`/product/${product.slug}`);

  node.innerHTML = html`
    <a class="p-row__media" href="${link}" aria-label="${product.name}">
      ${raw(productArt(product))}
    </a>
    <div>
      <span class="p-card__brand">${product.brandName}</span>
      <h3 class="p-row__title"><a href="${link}">${product.name}</a></h3>
      ${quantity != null
        ? html`<div class="text-soft fs-sm">
            تعداد: ${toPersianDigits(quantity)}
          </div>`
        : ""}
      ${metaContent ? raw(metaContent) : ""}
    </div>
    <div class="p-row__end">
      ${endContent ? raw(endContent) : raw(priceBlock(product, { size: "sm" }))}
    </div>
  `.toString();

  return { node };
}

/* ==========================================================================
   4. Quantity stepper
   ========================================================================== */

/**
 * Quantity control with +/- buttons.
 * @param {{value: number, min?: number, max?: number, onChange: (v: number) => void, size?: 'sm'|'md'}} options
 */
export function quantityStepper(options) {
  const { value = 1, min = 1, max = 20, onChange, size = "md" } = options;

  let current = Math.max(min, Math.min(max, value));

  const node = el("div", {
    class: `qty${size === "sm" ? " qty--sm" : ""}`,
    role: "group",
    "aria-label": "تعداد",
  });

  const render = () => {
    node.innerHTML = html`
      <button
        class="qty__btn"
        type="button"
        data-step="up"
        aria-label="افزایش تعداد"
        ${current >= max ? "disabled" : ""}
      >
        ${raw(icon("plus", { size: 15 }))}
      </button>
      <span class="qty__value" aria-live="polite"
        >${toPersianDigits(current)}</span
      >
      <button
        class="qty__btn"
        type="button"
        data-step="down"
        aria-label="کاهش تعداد"
        ${current <= min ? "disabled" : ""}
      >
        ${raw(icon("minus", { size: 15 }))}
      </button>
    `;
  };

  render();

  const dispose = delegate(node, "click", "[data-step]", (event, button) => {
    event.preventDefault();
    const step = button.dataset.step;

    if (step === "up" && current < max) current += 1;
    else if (step === "down" && current > min) current -= 1;
    else return;

    render();
    if (onChange) onChange(current);
  });

  return {
    node,
    getValue: () => current,
    cleanup: dispose,
  };
}

/* ==========================================================================
   5. Tabs & accordion
   ========================================================================== */

/**
 * Pill-style tab bar.
 * @param {{items: {id: string, label: string, icon?: string, count?: number}[], active: string, onChange: (id: string) => void}} options
 */
export function tabs(options) {
  const { items = [], onChange, variant = "tabs" } = options;

  // Reassigned by click and setActive, so it cannot be a destructured const.
  let active = options.active;

  const node = el("div", { class: variant, role: "tablist" });

  const render = (current) => {
    node.innerHTML = items
      .map((item) => {
        const classes =
          variant === "pill-tabs"
            ? `pill-tab${item.id === current ? " is-active" : ""}`
            : `tab${item.id === current ? " is-active" : ""}`;

        return html`
          <button
            class="${classes}"
            type="button"
            role="tab"
            data-tab="${item.id}"
            aria-selected="${item.id === current}"
          >
            ${item.icon ? raw(icon(item.icon, { size: 16 })) : ""}
            <span>${item.label}</span>
            ${item.count != null
              ? html`<span class="tab__count"
                  >${toPersianDigits(item.count)}</span
                >`
              : ""}
          </button>
        `;
      })
      .join("");
  };

  render(active);

  const dispose = delegate(node, "click", "[data-tab]", (event, button) => {
    event.preventDefault();
    const id = button.dataset.tab;
    if (id === active) return;

    active = id;
    render(id);
    if (onChange) onChange(id);
  });

  return {
    node,
    setActive(id) {
      active = id;
      render(id);
    },
    cleanup: dispose,
  };
}

/**
 * Accordion. Uses `grid-template-rows: 0fr → 1fr` for height-free animation.
 * @param {{items: {id: string, title: string, content: string, open?: boolean}[], multiple?: boolean}} options
 */
export function accordion(options) {
  const { items = [], multiple = false } = options;

  const openSet = new Set(
    items.filter((item) => item.open).map((item) => item.id),
  );
  const node = el("div", { class: "accordion" });

  const render = () => {
    node.innerHTML = items
      .map((item) => {
        const isOpen = openSet.has(item.id);

        return html`
          <div
            class="accordion__item glass radius-lg${isOpen ? " is-open" : ""}"
            data-item="${item.id}"
          >
            <h3>
              <button
                class="accordion__trigger"
                type="button"
                aria-expanded="${isOpen}"
                data-trigger="${item.id}"
              >
                <span>${item.title}</span>
                <span class="accordion__chevron" aria-hidden="true"
                  >${raw(icon("chevronDown", { size: 15 }))}</span
                >
              </button>
            </h3>
            <div class="accordion__panel" role="region">
              <div>
                <div class="accordion__content">${item.content}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  };

  render();

  const dispose = delegate(node, "click", "[data-trigger]", (event, button) => {
    event.preventDefault();
    const id = button.dataset.trigger;

    if (openSet.has(id)) {
      openSet.delete(id);
    } else {
      if (!multiple) openSet.clear();
      openSet.add(id);
    }

    render();
  });

  return { node, cleanup: dispose };
}

/* ==========================================================================
   6. Pagination
   ========================================================================== */

/**
 * Page number buttons with ellipsis.
 * @param {{page: number, pages: number, onChange: (page: number) => void}} options
 */
export function pagination(options) {
  const { page = 1, pages = 1, onChange } = options;
  const node = el("nav", { class: "pagination", "aria-label": "صفحه‌بندی" });

  if (pages <= 1) return { node, cleanup: () => {} };

  /** Build a compact page list: 1 … 4 5 6 … 20 */
  const buildRange = () => {
    const range = [];
    const window = 1;

    range.push(1);

    const start = Math.max(2, page - window);
    const end = Math.min(pages - 1, page + window);

    if (start > 2) range.push("…");

    for (let index = start; index <= end; index += 1) range.push(index);

    if (end < pages - 1) range.push("…");
    if (pages > 1) range.push(pages);

    return range;
  };

  node.innerHTML = html`
    <button
      class="pagination__btn"
      type="button"
      data-page="${page - 1}"
      ${page <= 1 ? "disabled" : ""}
      aria-label="صفحه قبل"
    >
      ${raw(icon("chevronRight", { size: 17 }))}
    </button>
    ${buildRange().map((entry) =>
      entry === "…"
        ? raw(html`<span class="pagination__ellipsis">…</span>`)
        : raw(html`
            <button
              class="pagination__btn${entry === page ? " is-active" : ""}"
              type="button"
              data-page="${entry}"
              aria-label="صفحه ${toPersianDigits(entry)}"
              ${entry === page ? 'aria-current="page"' : ""}
            >
              ${toPersianDigits(entry)}
            </button>
          `),
    )}
    <button
      class="pagination__btn"
      type="button"
      data-page="${page + 1}"
      ${page >= pages ? "disabled" : ""}
      aria-label="صفحه بعد"
    >
      ${raw(icon("chevronLeft", { size: 17 }))}
    </button>
  `.toString();

  const dispose = delegate(node, "click", "[data-page]", (event, button) => {
    event.preventDefault();
    if (button.disabled) return;

    const target = Number(button.dataset.page);
    if (
      !Number.isFinite(target) ||
      target === page ||
      target < 1 ||
      target > pages
    )
      return;

    onChange(target);
  });

  return { node, cleanup: dispose };
}

/* ==========================================================================
   7. Copy-to-clipboard button
   ========================================================================== */

export function copyButton(text, label = "کپی") {
  const node = el("button", {
    class: "btn btn--glass btn--xs",
    type: "button",
  });
  node.innerHTML = html`${raw(icon("copy", { size: 14 }))}<span
      >${label}</span
    >`.toString();

  node.addEventListener("click", async () => {
    const ok = await copyText(text);

    node.innerHTML = ok
      ? html`${raw(icon("check", { size: 14 }))}<span>کپی شد</span>`.toString()
      : html`<span>کپی نشد</span>`.toString();

    window.setTimeout(() => {
      if (document.contains(node)) {
        node.innerHTML = html`${raw(icon("copy", { size: 14 }))}<span
            >${label}</span
          >`.toString();
      }
    }, 1600);
  });

  return node;
}

/* ==========================================================================
   8. Re-exported helpers used by pages
   ========================================================================== */

export { icon, productArt, appEvents, EVENTS, nextFrame };

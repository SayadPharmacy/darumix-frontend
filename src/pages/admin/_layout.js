/**
 * DARUMIX — shared admin chrome.
 *
 * Every `/admin/*` page is wrapped by `adminLayout`, so the sidebar, the KPI
 * header and the responsive behaviour are defined exactly once. A page only
 * supplies its title, optional header stats and its content node.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { to, parseLocation } from "../../core/router.js";
import { toPersianDigits, formatPrice } from "../../core/format.js";
import { toast, confirmDialog } from "../../ui/components/overlays.js";
import * as admin from "../../services/admin.js";

/** Sidebar entries — grouped so the rail stays readable. */
export const ADMIN_NAV = [
  {
    group: "نمای کلی",
    items: [
      { path: "/admin", label: "پیشخوان", icon: "grid" },
      { path: "/admin/analytics", label: "تحلیل و آمار", icon: "chart" },
    ],
  },
  {
    group: "فروشگاه",
    items: [
      { path: "/admin/products", label: "محصولات", icon: "bag" },
      { path: "/admin/categories", label: "دسته‌بندی و برند", icon: "layers" },
      { path: "/admin/orders", label: "سفارش‌ها", icon: "package" },
      { path: "/admin/customers", label: "مشتریان", icon: "users" },
    ],
  },
  {
    group: "خدمات سلامت",
    items: [
      { path: "/admin/prescriptions", label: "نسخه‌ها", icon: "prescription" },
      { path: "/admin/content", label: "محتوا و مجله", icon: "bookmark" },
      { path: "/admin/marketing", label: "بازاریابی", icon: "megaphone" },
    ],
  },
];

/**
 * Read a query value as a page number, clamped to 1..pages.
 * Pages use this instead of repeating the parse-and-clamp dance.
 */
export function pageOf(query, pages = 1) {
  const value = Math.max(1, Number(query.page) || 1);
  return Math.min(value, Math.max(1, pages));
}

/**
 * Render the admin shell around page content.
 *
 * @param {object} options
 * @param {string} options.title       Page heading
 * @param {string} [options.subtitle]
 * @param {string} [options.iconName]
 * @param {HTMLElement} [options.actions] Node placed next to the heading
 * @param {HTMLElement[]} [options.stats] Stat tiles for the header strip
 * @param {HTMLElement} options.content   The page body
 * @returns {{node: HTMLElement, cleanup: () => void, contentSlot: HTMLElement}}
 */
export function adminLayout(options = {}) {
  const {
    title,
    subtitle = "",
    iconName = "grid",
    actions = null,
    stats = [],
    content,
  } = options;

  const node = el("div", { class: "admin" });
  const disposers = [];

  node.innerHTML = html`
    <div class="shell shell--wide admin__inner">
      <!-- ===================== Sidebar ===================== -->
      <aside class="admin-nav glass-2" data-slot="nav">
        <div class="admin-nav__brand">
          <span class="badge badge--brand"
            >${raw(icon("spark", { size: 13 }))} پنل مدیریت</span
          >
          <span class="fs-xs text-soft">نسخه نمایشی — بدون سرور</span>
        </div>

        <nav aria-label="ناوبری پنل مدیریت">
          ${ADMIN_NAV.map((section) =>
            raw(html`
              <div class="admin-nav__group">
                <p class="admin-nav__group-title">${section.group}</p>
                <ul class="admin-nav__list">
                  ${section.items.map((item) =>
                    raw(html`
                      <li>
                        <a
                          class="admin-nav__link"
                          href="${to(item.path)}"
                          data-admin-link="${item.path}"
                        >
                          ${raw(icon(item.icon, { size: 18 }))}
                          <span>${item.label}</span>
                          <span
                            class="admin-nav__count"
                            data-count-for="${item.path}"
                            hidden
                          ></span>
                        </a>
                      </li>
                    `),
                  )}
                </ul>
              </div>
            `),
          )}
        </nav>

        <div class="admin-nav__foot">
          <a class="admin-nav__link" href="${to("/")}">
            ${raw(icon("arrowRight", { size: 18 }))}
            <span>بازگشت به فروشگاه</span>
          </a>
          <button class="admin-nav__link" type="button" data-open-search>
            ${raw(icon("search", { size: 18 }))}
            <span>جستجوی محصولات</span>
          </button>
        </div>
      </aside>

      <!-- ===================== Main ===================== -->
      <div class="admin-main">
        <header class="admin-head glass radius-xl">
          <div class="grow">
            <div class="row row--sm">
              <span class="admin-head__icon" data-slot="head-icon"></span>
              <div>
                <h1 class="admin-head__title">${title}</h1>
                ${subtitle
                  ? html`<p class="admin-head__sub">${subtitle}</p>`
                  : ""}
              </div>
            </div>
          </div>

          <div class="admin-head__actions" data-slot="head-actions"></div>
        </header>

        ${stats.length
          ? html`<div class="admin-stats" data-slot="stats"></div>`
          : ""}

        <div class="admin-content" data-slot="content"></div>

        <div class="alert alert--info mt-6">
          ${raw(icon("info", { size: 18 }))}
          <span
            >این پنل روی داده‌های نمونه کار می‌کند. همه ویرایش‌ها فقط در حافظه
            محلی همین مرورگر ذخیره می‌شوند و داده‌های واقعی را تغییر نمی‌دهند.
            <button class="link-like" type="button" data-reset-demo>
              بازنشانی داده‌های نمونه
            </button></span
          >
        </div>
      </div>
    </div>

    <!-- Mobile admin nav toggle -->
    <button
      class="admin-fab"
      type="button"
      data-toggle-nav
      aria-label="منوی مدیریت"
    >
      ${raw(icon("menu", { size: 22 }))}
    </button>
  `.toString();

  /* --- Heading icon + actions --- */
  qs('[data-slot="head-icon"]', node).innerHTML = icon(iconName, { size: 22 });

  const actionsSlot = qs('[data-slot="head-actions"]', node);
  if (actions) actionsSlot.append(actions);

  /* --- Stats strip --- */
  const statsSlot = qs('[data-slot="stats"]', node);
  if (stats.length) stats.forEach((tile) => statsSlot.append(tile));

  /* --- Content --- */
  const contentSlot = qs('[data-slot="content"]', node);
  if (content) contentSlot.append(content);

  /* -------------------------------------------------------------------------
     Active link + live badge counts
     ------------------------------------------------------------------------- */

  function syncNav() {
    const { path } = parseLocation();

    node.querySelectorAll("[data-admin-link]").forEach((link) => {
      const target = link.dataset.adminLink;
      const active =
        target === "/admin" ? path === "/admin" : path.startsWith(target);
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    // Pending work is surfaced next to the relevant nav item.
    const counts = {
      "/admin/orders": admin
        .orders()
        .filter((order) => ["pending", "confirmed"].includes(order.status))
        .length,
      "/admin/prescriptions": admin.prescriptions({ status: "submitted" })
        .length,
      "/admin/products": admin.overview().lowStock,
    };

    Object.entries(counts).forEach(([path_, count]) => {
      const badge = node.querySelector(`[data-count-for="${path_}"]`);
      if (!badge) return;
      badge.hidden = !count;
      badge.textContent = toPersianDigits(count);
    });
  }

  disposers.push(
    delegate(node, "click", "[data-toggle-nav]", (event) => {
      event.preventDefault();
      qs('[data-slot="nav"]', node)?.classList.toggle("is-open");
    }),
  );

  /* Close the mobile rail after picking a destination. */
  disposers.push(
    delegate(node, "click", "[data-admin-link]", () => {
      qs('[data-slot="nav"]', node)?.classList.remove("is-open");
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reset-demo]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "بازنشانی داده‌های نمونه",
        message:
          "همه ویرایش‌های مدیریتی و داده‌های ذخیره‌شده در مرورگر پاک می‌شوند و برنامه به حالت اولیه برمی‌گردد. ادامه می‌دهید؟",
        confirmLabel: "بازنشانی کن",
        danger: true,
      });

      if (!ok) return;

      admin.resetDemoData();
      toast.success("داده‌های نمونه بازنشانی شد");
      window.location.reload();
    }),
  );

  syncNav();

  return {
    node,
    contentSlot,
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

/** Small helper: a KPI tile built from the overview payload. */
export function kpiTile({
  label,
  value,
  iconName,
  tone,
  change = null,
  hint = "",
}) {
  const tile = el("div", { class: "stat glass radius-lg" });
  tile.innerHTML = html`
    <div class="stat__top">
      <span class="stat__icon ${tone ? `stat__icon--${tone}` : ""}"
        >${raw(icon(iconName, { size: 20 }))}</span
      >
      <div><div class="stat__label">${label}</div></div>
    </div>
    <div class="stat__value">${value}</div>
    ${change != null || hint
      ? html`
          <div class="stat__foot">
            ${change != null
              ? html`<span
                  class="trend ${change >= 0 ? "trend--up" : "trend--down"}"
                >
                  ${raw(
                    icon(change >= 0 ? "trendingUp" : "trendingDown", {
                      size: 13,
                    }),
                  )}
                  ${toPersianDigits(Math.abs(change))}٪
                </span>`
              : ""}
            ${hint ? html`<span>${hint}</span>` : ""}
          </div>
        `
      : ""}
  `.toString();
  return tile;
}

/** Money in a compact form for dense admin tables. */
export function money(amount) {
  return formatPrice(amount, { withUnit: false });
}

export { toPersianDigits, formatPrice };

/**
 * DARUMIX — account dashboard.
 *
 * A single glass "control panel": profile summary, quick stats, recent orders,
 * prescription status, wishlist preview and shortcuts to every account area.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
  formatRelativeTime,
  initials,
} from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  emptyState,
  statTile,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import { statusOf } from "../data/statuses.js";
import * as account from "../services/account.js";
import * as prescriptions from "../services/prescriptions.js";

/** The account navigation rail, shared by every /account/* page. */
export const ACCOUNT_NAV = [
  { path: "/account", label: "پیشخوان", icon: "home" },
  { path: "/account/orders", label: "سفارش‌های من", icon: "package" },
  {
    path: "/account/prescriptions",
    label: "نسخه‌های من",
    icon: "prescription",
  },
  { path: "/account/reviews", label: "نظرات من", icon: "star" },
  { path: "/account/notifications", label: "اعلان‌ها", icon: "bell" },
  { path: "/account/settings", label: "تنظیمات حساب", icon: "sliders" },
];

export default async function accountPage() {
  const node = el("div");
  const disposers = [];

  const profile = account.ensureProfile();
  const stats = account.accountStats();
  const orders = account.orderHistory(4);
  const ownOrders = account.orders();
  const scriptionStats = prescriptions.prescriptionStats();
  const wishlist = account.wishlist().slice(0, 4);
  const notifications = account.notifications().slice(0, 4);
  const addresses = account.addresses();

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([{ label: "خانه", href: "/" }, { label: "حساب کاربری" }]),
      )}

      <!-- ===================== Profile header ===================== -->
      <header class="account-hero glass-2 radius-xl">
        <span class="account-hero__avatar">${initials(profile.name)}</span>

        <div class="grow">
          <h1 class="account-hero__name">${profile.name}</h1>
          <p class="account-hero__meta">
            ${profile.phone} ${profile.email ? html` · ${profile.email}` : ""}
          </p>
          <div class="row row--sm mt-2">
            <span class="badge badge--brand"
              >${raw(icon("crown", { size: 13 }))} عضو از
              ${formatDate(profile.joinDate)}</span
            >
            <span class="badge badge--gold"
              >${toPersianDigits(profile.loyaltyPoints)} امتیاز باشگاه</span
            >
          </div>
        </div>

        <div class="account-hero__actions">
          <a class="btn btn--glass btn--sm" href="${to("/account/settings")}">
            ${raw(icon("edit", { size: 15 }))} ویرایش پروفایل
          </a>
          <a class="btn btn--primary btn--sm" href="${to("/catalog")}">
            ${raw(icon("bag", { size: 15 }))} شروع خرید
          </a>
        </div>
      </header>

      <!-- ===================== Money + quick stats ===================== -->
      <div class="auto-grid auto-grid--wide mt-6" data-slot="stats"></div>

      <!-- ===================== Notifications strip ===================== -->
      ${notifications.length
        ? html`
            <section class="section section--tight">
              <div class="glass radius-xl p-6">
                <div class="row row--between mb-4">
                  <h2 class="mb-0">
                    ${raw(icon("bell", { size: 20 }))} آخرین اعلان‌ها
                  </h2>
                  <a
                    class="btn btn--ghost btn--xs"
                    href="${to("/account/notifications")}"
                    >مشاهده همه</a
                  >
                </div>
                <div class="stack stack--sm" data-slot="notifications"></div>
              </div>
            </section>
          `
        : ""}

      <!-- ===================== Orders ===================== -->
      <section class="section">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${raw(icon("package", { size: 20 }))} سفارش‌های اخیر
            </h2>
            <a class="btn btn--ghost btn--xs" href="${to("/account/orders")}"
              >همه سفارش‌ها</a
            >
          </div>
          <div class="stack" data-slot="orders"></div>
        </div>
      </section>

      <!-- ===================== Prescriptions ===================== -->
      <section class="section section--tight">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${raw(icon("prescription", { size: 20 }))} وضعیت نسخه‌ها
            </h2>
            <a
              class="btn btn--ghost btn--xs"
              href="${to("/account/prescriptions")}"
              >نسخه‌های من</a
            >
          </div>

          <div class="auto-grid auto-grid--tight">
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${toPersianDigits(scriptionStats.inReview)}</span
              >
              <span class="mini-stat__label">در حال بررسی</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${toPersianDigits(scriptionStats.approved)}</span
              >
              <span class="mini-stat__label">تأیید شده</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${toPersianDigits(scriptionStats.ready)}</span
              >
              <span class="mini-stat__label">آماده تحویل</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${toPersianDigits(scriptionStats.delivered)}</span
              >
              <span class="mini-stat__label">تحویل شده</span>
            </div>
          </div>

          <div class="row mt-4">
            <a class="btn btn--glass btn--sm" href="${to("/prescription")}">
              ${raw(icon("upload", { size: 15 }))} ثبت نسخه جدید
            </a>
            <a class="btn btn--glass btn--sm" href="${to("/consultation")}">
              ${raw(icon("stethoscope", { size: 15 }))} مشاوره داروساز
            </a>
          </div>
        </div>
      </section>

      <!-- ===================== Wishlist + address ===================== -->
      <div class="split mt-6">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${raw(icon("heart", { size: 20 }))} علاقه‌مندی‌ها
            </h2>
            <a class="btn btn--ghost btn--xs" href="${to("/wishlist")}"
              >مشاهده همه</a
            >
          </div>
          <div class="stack stack--sm" data-slot="wishlist"></div>
        </div>

        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${raw(icon("marker", { size: 20 }))} نشانی‌های من
            </h2>
            <button
              class="btn btn--ghost btn--xs"
              type="button"
              data-goto-settings
            >
              مدیریت
            </button>
          </div>
          <div class="stack stack--sm" data-slot="addresses"></div>
        </div>
      </div>

      <!-- ===================== Shortcuts ===================== -->
      <section class="section">
        <h2 class="section-head__title mb-4" style="padding-inline:0">
          دسترسی سریع
        </h2>
        <div class="auto-grid auto-grid--tight" data-slot="shortcuts"></div>
      </section>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Stats
     ------------------------------------------------------------------------- */

  const statsSlot = qs('[data-slot="stats"]', node);

  [
    statTile({
      label: "سفارش ثبت‌شده",
      value: toPersianDigits(ownOrders.length),
      iconName: "package",
      tone: "brand",
      hint: "در این حساب محلی",
    }),
    statTile({
      label: "مجموع خرید",
      value: formatPrice(stats.spent, { withUnit: false }),
      iconName: "currency",
      tone: "mint",
      hint: "بر اساس سفارش‌های شما",
    }),
    statTile({
      label: "اعتبار کیف پول",
      value: formatPrice(stats.wallet, { withUnit: false }),
      iconName: "wallet",
      tone: "gold",
      hint: "قابل استفاده در خرید بعدی",
    }),
    statTile({
      label: "امتیاز باشگاه",
      value: toPersianDigits(stats.points),
      iconName: "crown",
      tone: "blue",
      hint: "با هر خرید بیشتر می‌شود",
    }),
  ].forEach((tile) => statsSlot.append(tile));

  /* -------------------------------------------------------------------------
     Notifications
     ------------------------------------------------------------------------- */

  const notificationsSlot = qs('[data-slot="notifications"]', node);

  if (notificationsSlot) {
    notifications.forEach((entry) => {
      const row = el("a", {
        class: `notification${entry.read ? "" : " is-unread"}`,
        href: entry.href || to("/account/notifications"),
      });
      row.innerHTML = html`
        <span class="notification__dot" aria-hidden="true"></span>
        <span class="grow">
          <span class="notification__title">${entry.title}</span>
          <span class="notification__text clamp-2">${entry.text}</span>
        </span>
        <span class="fs-xs text-soft"
          >${formatRelativeTime(entry.createdAt)}</span
        >
      `.toString();
      notificationsSlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Orders
     ------------------------------------------------------------------------- */

  const ordersSlot = qs('[data-slot="orders"]', node);

  if (!orders.length) {
    ordersSlot.append(
      emptyState({
        iconName: "package",
        title: "هنوز سفارشی ثبت نکرده‌اید",
        text: "اولین سفارش خود را ثبت کنید تا وضعیت آن را اینجا پیگیری کنید.",
        compact: true,
        action: {
          label: "شروع خرید",
          variant: "btn--primary",
          href: "/catalog",
        },
      }).node,
    );
  } else {
    orders.forEach((order) => {
      const status = statusOf("order", order.status);

      const row = el("article", { class: "record-card glass radius-lg" });
      row.innerHTML = html`
        <div class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong class="fs-sm">${order.id}</strong>
              ${raw(statusBadge(status))}
              ${order.demo
                ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
                : ""}
            </div>
            <span class="fs-xs text-soft"
              >${formatDate(order.placedAt)} ·
              ${toPersianDigits(order.itemCount)} قلم</span
            >
          </div>
          <div style="text-align:end">
            <div class="fw-bold">${formatPrice(order.total)}</div>
            <span class="fs-xs text-soft">${order.city || ""}</span>
          </div>
        </div>

        <div class="row mt-3">
          <a
            class="btn btn--glass btn--xs"
            href="${to(`/account/order/${order.id}`)}"
          >
            ${raw(icon("eye", { size: 14 }))} جزئیات سفارش
          </a>
          <button
            class="btn btn--ghost btn--xs"
            type="button"
            data-reorder="${order.id}"
          >
            ${raw(icon("rotate", { size: 14 }))} خرید مجدد
          </button>
        </div>
      `.toString();

      ordersSlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Wishlist preview
     ------------------------------------------------------------------------- */

  const wishlistSlot = qs('[data-slot="wishlist"]', node);

  if (!wishlist.length) {
    wishlistSlot.innerHTML = html`
      <p class="text-muted fs-sm mb-0">
        هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.
      </p>
    `.toString();
  } else {
    wishlist.forEach((product) => {
      const row = el("a", {
        class: "mini-product",
        href: to(`/product/${product.slug}`),
      });
      row.innerHTML = html`
        <span class="mini-product__media">${raw(productArt(product))}</span>
        <span class="grow">
          <span class="mini-product__title clamp-1">${product.name}</span>
          <span class="fs-xs text-soft">${product.brandName}</span>
        </span>
        <span class="fw-bold fs-sm"
          >${formatPrice(product.price, { withUnit: false })}</span
        >
      `.toString();
      wishlistSlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Addresses
     ------------------------------------------------------------------------- */

  const addressSlot = qs('[data-slot="addresses"]', node);

  addresses.slice(0, 2).forEach((address) => {
    const card = el("div", { class: "address-mini glass radius-lg" });
    card.innerHTML = html`
      <div class="row row--sm">
        <span class="fw-bold fs-sm">${address.title}</span>
        ${address.isDefault
          ? html`<span class="badge badge--brand">پیش‌فرض</span>`
          : ""}
      </div>
      <p class="fs-xs text-muted mb-0 mt-2">
        ${address.province}، ${address.city}، ${address.line1}
      </p>
      <span class="fs-xs text-soft"
        >${address.recipient} — ${address.phone}</span
      >
    `.toString();
    addressSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Shortcuts
     ------------------------------------------------------------------------- */

  const shortcutsSlot = qs('[data-slot="shortcuts"]', node);

  const shortcuts = [
    {
      path: "/account/orders",
      label: "سفارش‌های من",
      icon: "package",
      count: ownOrders.length,
    },
    {
      path: "/account/prescriptions",
      label: "نسخه‌های من",
      icon: "prescription",
      count: account.accountStats().prescriptions,
    },
    {
      path: "/account/reviews",
      label: "نظرات من",
      icon: "star",
      count: account.myReviews().length,
    },
    {
      path: "/account/notifications",
      label: "اعلان‌ها",
      icon: "bell",
      count: account.unreadCount(),
    },
    {
      path: "/wishlist",
      label: "علاقه‌مندی‌ها",
      icon: "heart",
      count: account.wishlistIds().length,
    },
    {
      path: "/compare",
      label: "مقایسه محصولات",
      icon: "scale",
      count: account.compareIds().length,
    },
    {
      path: "/recently-viewed",
      label: "بازدیدهای اخیر",
      icon: "history",
      count: account.recentlyViewed().length,
    },
    { path: "/account/settings", label: "تنظیمات حساب", icon: "sliders" },
  ];

  shortcuts.forEach((entry) => {
    const card = el("a", {
      class: "shortcut glass radius-lg",
      href: to(entry.path),
    });
    card.innerHTML = html`
      <span class="shortcut__icon">${raw(icon(entry.icon, { size: 20 }))}</span>
      <span class="grow">
        <span class="shortcut__label">${entry.label}</span>
        ${entry.count != null
          ? html`<span class="fs-xs text-soft"
              >${toPersianDigits(entry.count)} مورد</span
            >`
          : ""}
      </span>
      ${raw(icon("chevronLeft", { size: 16 }))}
    `.toString();
    shortcutsSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-reorder]", (event, button) => {
      event.preventDefault();
      const result = account.reorder(button.dataset.reorder);

      if (result.added) {
        toast.success(
          "کالاها به سبد اضافه شد",
          `${toPersianDigits(result.added)} محصول از این سفارش به سبد خرید اضافه شد.`,
          {
            action: {
              label: "مشاهده سبد",
              onClick: () => {
                window.location.hash = to("/cart").slice(1);
              },
            },
          },
        );
      }
      if (result.skipped) {
        toast.warn(
          "برخی کالاها اضافه نشدند",
          `${toPersianDigits(result.skipped)} محصول در حال حاضر ناموجود است.`,
        );
      }
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-goto-settings]", (event) => {
      event.preventDefault();
      window.location.hash = to("/account/settings").slice(1);
    }),
  );

  return {
    node,
    title: "حساب کاربری",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

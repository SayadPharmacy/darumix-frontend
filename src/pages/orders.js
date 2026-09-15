/**
 * DARUMIX — order history.
 *
 * Filter tabs (all / active / delivered / cancelled) plus a search box; both
 * are reflected in the URL so the view survives a reload and the back button.
 */

import { html, raw, el, qs, delegate, on, debounce } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to, updateQuery } from "../core/router.js";
import { toPersianDigits, formatPrice, formatDate } from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  emptyState,
  tabs,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import { ORDER_STATUSES, statusOf } from "../data/statuses.js";
import * as account from "../services/account.js";

const ACTIVE_STATUSES = ["pending", "confirmed", "processing", "shipped"];

/** Buckets used by the filter tabs. */
const FILTERS = {
  all: () => true,
  active: (order) => ACTIVE_STATUSES.includes(order.status),
  delivered: (order) => order.status === "delivered",
  cancelled: (order) => ["cancelled", "returned"].includes(order.status),
};

export default async function ordersPage({ query = {} } = {}) {
  const node = el("div");
  const disposers = [];

  const activeTab = FILTERS[query.status] ? query.status : "all";
  const search = query.q || "";

  /* -------------------------------------------------------------------------
     Data
     ------------------------------------------------------------------------- */

  const all = account.orderHistory(50);
  const needle = search.trim().toLowerCase();

  const visible = all.filter(FILTERS[activeTab]).filter((order) => {
    if (!needle) return true;
    const haystack = [
      order.id,
      order.customerName,
      order.city,
      ...(order.items || []).map((item) => item.name),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  const counts = Object.fromEntries(
    Object.entries(FILTERS).map(([key, predicate]) => [
      key,
      all.filter(predicate).length,
    ]),
  );

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          { label: "سفارش‌های من" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "سفارش‌های من",
          text: `${toPersianDigits(all.length)} سفارش در سابقه شما ثبت شده است.`,
        }),
      )}

      <div class="glass radius-lg p-6">
        <div data-slot="tabs"></div>

        <form class="input-icon mt-4" data-order-search role="search">
          ${raw(icon("search", { size: 17 }))}
          <label class="visually-hidden" for="orders-q"
            >جستجو در سفارش‌ها</label
          >
          <input
            class="input"
            id="orders-q"
            type="search"
            name="q"
            placeholder="جستجو با کد سفارش، نام کالا یا شهر…"
            value="${search}"
            autocomplete="off"
          />
        </form>
      </div>

      <div class="stack mt-6" data-slot="list"></div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Filter tabs
     ------------------------------------------------------------------------- */

  const tabBar = tabs({
    items: [
      { id: "all", label: "همه", icon: "layers", count: counts.all },
      { id: "active", label: "در جریان", icon: "truck", count: counts.active },
      {
        id: "delivered",
        label: "تحویل شده",
        icon: "checkCircle",
        count: counts.delivered,
      },
      {
        id: "cancelled",
        label: "لغو / مرجوع",
        icon: "x",
        count: counts.cancelled,
      },
    ],
    active: activeTab,
    variant: "pill-tabs",
    onChange: (id) => updateQuery({ status: id === "all" ? null : id }),
  });

  qs('[data-slot="tabs"]', node).append(tabBar.node);
  disposers.push(tabBar.cleanup);

  /* -------------------------------------------------------------------------
     List
     ------------------------------------------------------------------------- */

  const listSlot = qs('[data-slot="list"]', node);

  if (!visible.length) {
    listSlot.append(
      emptyState({
        iconName: "package",
        title: search
          ? "سفارشی با این مشخصات یافت نشد"
          : "سفارشی در این وضعیت نیست",
        text: search
          ? `برای «${search}» نتیجه‌ای نداشتیم. کد سفارش دیگری را امتحان کنید.`
          : "با ثبت سفارش جدید، این بخش پر می‌شود.",
        action: {
          label: "مشاهده فروشگاه",
          variant: "btn--primary",
          href: "/catalog",
        },
      }).node,
    );
  } else {
    visible.forEach((order) => {
      const status = statusOf("order", order.status);
      const items = order.items || [];

      const card = el("article", { class: "order-card glass radius-xl" });

      card.innerHTML = html`
        <header class="order-card__head">
          <div>
            <div class="row row--sm">
              <strong>${order.id}</strong>
              ${raw(statusBadge(status))}
              ${order.demo
                ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
                : ""}
              ${order.hasPrescription
                ? html`<span class="badge badge--info"
                    >${raw(icon("prescription", { size: 12 }))} نسخه‌ای</span
                  >`
                : ""}
            </div>
            <div class="row row--sm fs-xs text-soft mt-2">
              <span>${formatDate(order.placedAt)}</span>
              <span>•</span>
              <span>${toPersianDigits(order.itemCount)} قلم کالا</span>
              ${order.city
                ? html`<span>•</span><span>${order.city}</span>`
                : ""}
            </div>
          </div>

          <div class="order-card__total">
            <span class="fs-xs text-soft">مبلغ کل</span>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </header>

        <!-- Item thumbnails -->
        <div class="order-card__items">
          ${items.slice(0, 5).map((item) => {
            const product = {
              id: item.productId,
              name: item.name,
              slug: item.slug,
              shape: "pack",
              tone: "emerald",
            };
            return raw(html`
              <a
                class="order-thumb tip"
                href="${to(`/product/${item.slug}`)}"
                data-tip="${item.name}"
                aria-label="${item.name}"
              >
                ${raw(productArt(product))}
                <span class="order-thumb__qty"
                  >${toPersianDigits(item.quantity)}</span
                >
              </a>
            `);
          })}
          ${items.length > 5
            ? html`<span class="order-thumb order-thumb--more"
                >+${toPersianDigits(items.length - 5)}</span
              >`
            : ""}
        </div>

        <!-- Progress track -->
        <div class="order-track">
          ${["pending", "confirmed", "processing", "shipped", "delivered"].map(
            (stepId) => {
              const stepIndex = [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
              ].indexOf(stepId);
              const currentIndex = [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
              ].indexOf(order.status);
              const reached = currentIndex >= 0 && stepIndex <= currentIndex;
              const step = ORDER_STATUSES.find((entry) => entry.id === stepId);

              return raw(html`
                <span class="order-track__step${reached ? " is-done" : ""}">
                  <span class="order-track__dot"></span>
                  <span class="order-track__label"
                    >${step?.label || stepId}</span
                  >
                </span>
              `);
            },
          )}
        </div>

        <footer class="order-card__foot">
          <a
            class="btn btn--glass btn--sm"
            href="${to(`/account/order/${order.id}`)}"
          >
            ${raw(icon("eye", { size: 15 }))} جزئیات کامل
          </a>

          <button
            class="btn btn--ghost btn--sm"
            type="button"
            data-reorder="${order.id}"
          >
            ${raw(icon("rotate", { size: 15 }))} خرید مجدد
          </button>

          ${["pending", "confirmed"].includes(order.status) && order.mine
            ? html`<button
                class="btn btn--ghost btn--sm text-danger"
                type="button"
                data-cancel="${order.id}"
              >
                ${raw(icon("x", { size: 15 }))} لغو سفارش
              </button>`
            : ""}

          <span class="grow"></span>

          <span class="fs-xs text-soft">
            ${order.shipping === 0
              ? "ارسال رایگان"
              : `ارسال ${formatPrice(order.shipping, { withUnit: false })} تومان`}
          </span>
        </footer>
      `.toString();

      listSlot.append(card);
    });
  }

  /* -------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------- */

  const runSearch = debounce((term) => {
    updateQuery({ q: term || null });
  }, 400);

  disposers.push(
    on(qs("[data-order-search] input", node), "input", (event) => {
      runSearch(event.target.value.trim());
    }),
  );

  disposers.push(
    delegate(node, "submit", "[data-order-search]", (event) =>
      event.preventDefault(),
    ),
  );

  /* -------------------------------------------------------------------------
     Row actions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-reorder]", (event, button) => {
      event.preventDefault();
      const result = account.reorder(button.dataset.reorder);

      if (result.added) {
        toast.success(
          "کالاها به سبد اضافه شد",
          `${toPersianDigits(result.added)} محصول اضافه شد.`,
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
          "برخی کالاها ناموجود بودند",
          `${toPersianDigits(result.skipped)} مورد اضافه نشد.`,
        );
      }
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-cancel]", async (event, button) => {
      event.preventDefault();

      const { confirmDialog } = await import("../ui/components/overlays.js");
      const ok = await confirmDialog({
        title: "لغو سفارش",
        message: `سفارش ${button.dataset.cancel} لغو شود؟ این کار قابل بازگشت نیست.`,
        confirmLabel: "لغو سفارش",
        danger: true,
      });

      if (!ok) return;

      account.cancelOrder(button.dataset.cancel);
      toast.info(
        "سفارش لغو شد",
        "در صورت پرداخت، مبلغ در نسخه واقعی بازگردانده می‌شود.",
      );
      window.location.reload();
    }),
  );

  return {
    node,
    title: "سفارش‌های من",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

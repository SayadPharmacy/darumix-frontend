/**
 * DARUMIX — single order detail.
 *
 * The tracking timeline, line items, address, payment summary and the
 * cancel / reorder actions for one order.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
  formatTime,
  formatRelativeTime,
  deliveryWindow,
} from "../core/format.js";
import { copyText } from "../core/dom.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  emptyState,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import {
  ORDER_STATUSES,
  statusOf,
  SHIPPING_METHODS,
  PAYMENT_METHODS,
} from "../data/statuses.js";
import * as account from "../services/account.js";
import * as catalogService from "../services/catalog.js";
import { productArt } from "../ui/product-art.js";

const TRACK = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function orderDetailPage({ params = {} }) {
  const node = el("div");
  const disposers = [];

  const order = account.orderById(params.id);

  /* -------------------------------------------------------------------------
     Not found
     ------------------------------------------------------------------------- */
  if (!order) {
    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "حساب کاربری", href: "/account" },
            { label: "سفارش‌های من", href: "/account/orders" },
            { label: "سفارش یافت نشد" },
          ]),
        )}
        <div data-slot="missing" class="mt-8"></div>
      </div>
    `.toString();

    qs('[data-slot="missing"]', node).append(
      emptyState({
        iconName: "package",
        title: "این سفارش پیدا نشد",
        text: "مکن است این سفارش حذف شده باشد یا کد آن اشتباه باشد.",
        action: {
          label: "سفارش‌های من",
          variant: "btn--primary",
          href: "/account/orders",
        },
      }).node,
    );

    return { node, title: "سفارش یافت نشد", cleanup: () => {} };
  }

  const status = statusOf("order", order.status);
  const items = order.items || [];
  const shippingMethod = SHIPPING_METHODS.find(
    (method) => method.id === order.shippingMethod,
  );
  const paymentMethod = PAYMENT_METHODS.find(
    (method) => method.id === order.paymentMethod,
  );
  const currentIndex = TRACK.indexOf(order.status);
  const isCancelled = ["cancelled", "returned"].includes(order.status);

  /* -------------------------------------------------------------------------
     Build the timeline: real events first, then projected steps.
     ------------------------------------------------------------------------- */
  const timeline = [];
  TRACK.forEach((stepId, index) => {
    const step = ORDER_STATUSES.find((entry) => entry.id === stepId);
    const event = (order.timeline || []).find(
      (entry) => entry.status === stepId,
    );

    let state = "todo";
    if (isCancelled) state = event ? "done" : "todo";
    else if (currentIndex >= index) state = event ? "done" : "projected";

    timeline.push({
      id: stepId,
      label: event?.label || step?.label || stepId,
      icon: step?.icon || "clock",
      at: event?.at || null,
      state,
    });
  });

  if (isCancelled) {
    const cancelEvent = (order.timeline || []).find((entry) =>
      ["cancelled", "returned"].includes(entry.status),
    );
    timeline.push({
      id: order.status,
      label: cancelEvent?.label || status.label,
      icon: status.icon,
      at: cancelEvent?.at || order.updatedAt,
      state: "cancelled",
    });
  }

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          { label: "سفارش‌های من", href: "/account/orders" },
          { label: order.id },
        ]),
      )}

      <!-- ===================== Header ===================== -->
      <header class="order-hero glass-2 radius-xl">
        <div class="grow">
          <div class="row row--sm">
            <h1 class="order-hero__id">${order.id}</h1>
            ${raw(statusBadge(status, { size: "lg" }))}
            ${order.demo
              ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
              : ""}
          </div>
          <p class="fs-sm text-muted mt-2 mb-0">
            ثبت شده در ${formatDate(order.placedAt)} ساعت
            ${formatTime(order.placedAt)}
            ${order.updatedAt
              ? html` · آخرین به‌روزرسانی ${formatRelativeTime(order.updatedAt)}`
              : ""}
          </p>
        </div>

        <div class="order-hero__total">
          <span class="fs-xs text-soft">مبلغ کل</span>
          <strong class="fs-xl">${formatPrice(order.total)}</strong>
        </div>

        <div class="row row--sm">
          <button class="btn btn--glass btn--sm" type="button" data-copy-id>
            ${raw(icon("copy", { size: 15 }))} کپی کد سفارش
          </button>
        </div>
      </header>

      <div class="order-layout">
        <div class="stack stack--lg">
          <!-- ===================== Tracking ===================== -->
          <section class="glass radius-xl p-6">
            <h2 class="mb-4">
              ${raw(icon("truck", { size: 20 }))} وضعیت سفارش
            </h2>

            ${isCancelled
              ? html`
                  <div class="alert alert--danger mb-4">
                    ${raw(icon("x", { size: 18 }))}
                    <span
                      >این سفارش ${status.label} است. در صورت نیاز به پیگیری، با
                      پشتیبانی تماس بگیرید.</span
                    >
                  </div>
                `
              : order.trackingCode
                ? html`
                    <div class="alert alert--info mb-4">
                      ${raw(icon("package", { size: 18 }))}
                      <span
                        >کد رهگیری پستی:
                        <strong>${order.trackingCode}</strong> — تحویل تقریبی
                        ${deliveryWindow(1)}</span
                      >
                    </div>
                  `
                : ""}

            <ol class="timeline timeline--order">
              ${timeline.map((entry) =>
                raw(html`
                  <li class="timeline__item timeline__item--${entry.state}">
                    <span class="timeline__dot" aria-hidden="true"></span>
                    <span class="timeline__body">
                      <span class="timeline__title">
                        ${raw(icon(entry.icon, { size: 16 }))} ${entry.label}
                      </span>
                      <span class="fs-xs text-soft">
                        ${entry.at
                          ? formatDate(entry.at) + " — " + formatTime(entry.at)
                          : "در انتظار"}
                      </span>
                    </span>
                  </li>
                `),
              )}
            </ol>
          </section>

          <!-- ===================== Items ===================== -->
          <section class="glass radius-xl p-6">
            <h2 class="mb-4">
              ${raw(icon("bag", { size: 20 }))} کالاهای این سفارش
              <span class="fs-sm text-soft"
                >(${toPersianDigits(order.itemCount)} عدد)</span
              >
            </h2>

            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">کالا</th>
                    <th scope="col">تعداد</th>
                    <th scope="col">قیمت واحد</th>
                    <th scope="col">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item) => {
                    const product = catalogService.getProductById(
                      item.productId,
                    ) || {
                      id: item.productId,
                      name: item.name,
                      slug: item.slug,
                    };

                    return raw(html`
                      <tr>
                        <td>
                          <div class="row row--sm">
                            <span class="mini-product__media"
                              >${raw(
                                productArt(product, {
                                  className: "product-art--xs",
                                }),
                              )}</span
                            >
                            <a
                              class="fw-semibold"
                              href="${to(`/product/${item.slug}`)}"
                              >${item.name}</a
                            >
                          </div>
                        </td>
                        <td>${toPersianDigits(item.quantity)}</td>
                        <td>
                          ${formatPrice(item.price, { withUnit: false })} تومان
                        </td>
                        <td class="fw-bold">
                          ${formatPrice(item.lineTotal, { withUnit: false })}
                          تومان
                        </td>
                      </tr>
                    `);
                  })}
                </tbody>
              </table>
            </div>

            <div class="row mt-4">
              <button
                class="btn btn--primary btn--sm"
                type="button"
                data-reorder
              >
                ${raw(icon("rotate", { size: 15 }))} خرید مجدد این سفارش
              </button>

              ${["pending", "confirmed"].includes(order.status) && order.mine
                ? html`<button
                    class="btn btn--ghost btn--sm text-danger"
                    type="button"
                    data-cancel
                  >
                    ${raw(icon("x", { size: 15 }))} لغو سفارش
                  </button>`
                : ""}

              <a class="btn btn--ghost btn--sm" href="${to("/contact")}">
                ${raw(icon("message", { size: 15 }))} پشتیبانی
              </a>
            </div>
          </section>
        </div>

        <!-- ===================== Aside ===================== -->
        <aside class="stack stack--lg">
          <!-- Payment summary -->
          <section class="glass radius-xl p-6">
            <h2 class="mb-4">
              ${raw(icon("receipt", { size: 20 }))} خلاصه پرداخت
            </h2>

            <div class="summary-rows">
              <div class="summary-row">
                <span>جمع کالاها</span>
                <span
                  >${formatPrice(order.subtotal, { withUnit: false })}
                  تومان</span
                >
              </div>
              <div class="summary-row">
                <span>هزینه ارسال</span>
                <span>
                  ${order.shipping === 0
                    ? html`<span class="text-success fw-bold">رایگان</span>`
                    : `${formatPrice(order.shipping, { withUnit: false })} تومان`}
                </span>
              </div>
              ${order.discount
                ? html`<div class="summary-row text-success">
                    <span>تخفیف ${order.couponCode || ""}</span>
                    <span
                      >−${formatPrice(order.discount, { withUnit: false })}
                      تومان</span
                    >
                  </div>`
                : ""}
              <div class="summary-row summary-row--total">
                <span>مبلغ پرداختی</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            </div>

            <div class="stack stack--sm fs-sm mt-4">
              <div class="summary-row">
                <span>روش پرداخت</span>
                <span>${paymentMethod?.label || order.paymentMethod}</span>
              </div>
              <div class="summary-row">
                <span>روش ارسال</span>
                <span>${shippingMethod?.label || order.shippingMethod}</span>
              </div>
            </div>
          </section>

          <!-- Delivery -->
          <section class="glass radius-xl p-6">
            <h2 class="mb-4">
              ${raw(icon("marker", { size: 20 }))} اطلاعات تحویل
            </h2>

            <div class="stack stack--sm fs-sm">
              <div>
                <span class="fs-xs text-soft">گیرنده</span>
                <div class="fw-semibold">${order.customerName}</div>
              </div>
              <div>
                <span class="fs-xs text-soft">شماره تماس</span>
                <div>${order.customerPhone}</div>
              </div>
              <div>
                <span class="fs-xs text-soft">نشانی</span>
                <div>${order.address || "—"}</div>
              </div>
              ${order.note
                ? html`<div>
                    <span class="fs-xs text-soft">یادداشت</span>
                    <div>${order.note}</div>
                  </div>`
                : ""}
            </div>
          </section>

          <!-- Help -->
          <section class="glass radius-xl p-6">
            <h2 class="mb-4">
              ${raw(icon("help", { size: 20 }))} نیاز به کمک دارید؟
            </h2>
            <p class="fs-sm text-muted">
              اگر درباره این سفارش سوالی دارید یا مشکلی در تحویل پیش آمده، با
              پشتیبانی تماس بگیرید.
            </p>
            <div class="row row--sm">
              <a class="btn btn--glass btn--sm" href="${to("/faq")}"
                >سوالات متداول</a
              >
              <a class="btn btn--glass btn--sm" href="${to("/contact")}"
                >تماس با ما</a
              >
            </div>
          </section>
        </aside>
      </div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-copy-id]", async (event) => {
      event.preventDefault();
      const ok = await copyText(order.id);
      toast[ok ? "success" : "error"](
        ok ? "کد سفارش کپی شد" : "کپی نشد",
        ok ? order.id : "مرورگر اجازه کپی نداد.",
      );
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reorder]", (event) => {
      event.preventDefault();
      const result = account.reorder(order.id);

      if (result.added) {
        toast.success(
          "کالاها به سبد اضافه شد",
          `${toPersianDigits(result.added)} محصول`,
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
    delegate(node, "click", "[data-cancel]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "لغو سفارش",
        message: `سفارش ${order.id} لغو شود؟ این کار قابل بازگشت نیست.`,
        confirmLabel: "لغو سفارش",
        danger: true,
      });

      if (!ok) return;

      account.cancelOrder(order.id);
      toast.info("سفارش لغو شد");
      window.location.hash = to("/account/orders").slice(1);
    }),
  );

  return {
    node,
    title: `سفارش ${order.id}`,
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

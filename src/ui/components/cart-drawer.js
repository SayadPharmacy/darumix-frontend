/**
 * DARUMIX — cart drawer.
 *
 * Mounted once in the shell. It re-renders from the store on every cart change
 * and on every open, so the drawer can never show stale quantities.
 */

import { html, raw, el, qs, delegate, on } from "../../core/dom.js";
import { icon } from "../icons.js";
import { to } from "../../core/router.js";
import { subscribe } from "../../core/store.js";
import { appEvents, EVENTS } from "../../core/event-bus.js";
import {
  toPersianDigits,
  formatPrice,
  discountPercent,
} from "../../core/format.js";
import { productArt } from "../product-art.js";
import { drawer } from "./shell.js";
import { quantityStepper, emptyState, meter } from "./common.js";
import { toast } from "./overlays.js";
import * as cart from "../../services/cart.js";

export function cartDrawer() {
  const panel = drawer({
    title: html`${raw(icon("cart", { size: 20 }))} سبد خرید`.toString(),
    side: "end",
  });

  /** Holds the quantity steppers so they can be cleaned up on re-render. */
  let stepperCleanups = [];

  function teardownSteppers() {
    stepperCleanups.forEach((dispose) => dispose());
    stepperCleanups = [];
  }

  function renderLine(item) {
    const node = el("article", {
      class: "cart-item glass radius-lg",
      "data-line": item.productId,
    });
    const off = discountPercent(item.unitPrice, item.compareAt);

    node.innerHTML = html`
      <a
        class="cart-item__media"
        href="${to(`/product/${item.product.slug}`)}"
        data-close
        aria-label="${item.product.name}"
      >
        ${raw(productArt(item.product))}
      </a>

      <div class="grow">
        <span class="p-card__brand">${item.product.brandName}</span>
        <h3 class="p-card__title clamp-2" style="min-height:auto">
          <a href="${to(`/product/${item.product.slug}`)}" data-close
            >${item.product.name}</a
          >
        </h3>
        ${item.variant
          ? html`<div class="text-soft fs-xs mt-2">${item.variant}</div>`
          : ""}
        ${!item.inStock
          ? html`<span class="badge badge--danger mt-2"
              >ناموجود — از سبد حذف کنید</span
            >`
          : item.product.rx
            ? html`<span class="badge badge--info mt-2"
                >${raw(icon("prescription", { size: 13 }))} نیازمند نسخه</span
              >`
            : ""}
      </div>

      <div class="cart-item__end">
        <div class="price">
          <span class="price__now"
            >${formatPrice(item.lineTotal, { withUnit: false })}</span
          >
          <span class="price__unit">تومان</span>
          ${off
            ? html`<span class="price__off">${toPersianDigits(off)}٪</span>`
            : ""}
        </div>
        <span data-slot="stepper"></span>
        <button
          class="btn btn--ghost btn--xs text-danger"
          type="button"
          data-remove="${item.productId}"
        >
          ${raw(icon("trash", { size: 14 }))} حذف
        </button>
      </div>
    `.toString();

    // A real stepper node keeps +/- interactions cheap and accessible.
    if (item.inStock) {
      const stepper = quantityStepper({
        value: item.quantity,
        min: 1,
        max: item.maxQuantity,
        size: "sm",
        onChange: (value) => {
          cart.updateQuantity(item.productId, value, item.variant);
        },
      });

      qs('[data-slot="stepper"]', node).replaceWith(stepper.node);
      stepperCleanups.push(stepper.cleanup);
    }

    return node;
  }

  function render() {
    teardownSteppers();

    const items = cart.items();
    const totals = cart.totals();

    panel.setCount(items.length ? toPersianDigits(items.length) : "");

    if (items.length === 0) {
      panel.body.innerHTML = "";
      const empty = emptyState({
        iconName: "cart",
        title: "سبد خرید شما خالی است",
        text: "محصولات مورد نیاز خود را از فروشگاه انتخاب کنید و به سبد اضافه کنید.",
        action: {
          label: "شروع خرید",
          variant: "btn--primary",
          onClick: () => {
            panel.close();
            window.location.hash = to("/catalog").slice(1);
          },
        },
      });

      panel.body.append(empty.node);
      panel.setFooter(null);
      return;
    }

    panel.body.innerHTML = "";

    // Free-shipping nudge — a real conversion tool, not decoration.
    if (!totals.qualifiesFreeShipping) {
      const nudge = el("div", { class: "glass radius-lg card--pad-sm" });
      nudge.innerHTML = html`
        <p class="fs-sm mb-2 text-muted">
          تا ارسال رایگان
          <strong class="text-brand"
            >${formatPrice(totals.freeShippingGap)}</strong
          >
          باقی مانده است.
        </p>
        ${raw(meter(totals.freeShippingProgress))}
      `.toString();
      panel.body.append(nudge);
    } else {
      const bonus = el("div", { class: "alert alert--success" });
      bonus.innerHTML = html`
        ${raw(icon("checkCircle", { size: 18 }))}
        <span>سفارش شما شامل <strong>ارسال رایگان</strong> است.</span>
      `.toString();
      panel.body.append(bonus);
    }

    items.forEach((item) => panel.body.append(renderLine(item)));

    // --- Footer: totals + checkout --------------------------------------
    panel.setFooter(
      html`
        <div class="kv">
          <div class="kv__row">
            <dt>جمع کالاها (${toPersianDigits(totals.units)} عدد)</dt>
            <dd>${formatPrice(totals.subtotal)}</dd>
          </div>
          ${totals.savings > 0
            ? html`
                <div class="kv__row">
                  <dt>سود شما از تخفیف</dt>
                  <dd class="text-success">${formatPrice(totals.savings)}</dd>
                </div>
              `
            : ""}
          <div class="kv__row kv__row--total">
            <dt>مبلغ قابل پرداخت</dt>
            <dd>${formatPrice(totals.subtotal)}</dd>
          </div>
        </div>

        ${totals.requiresPrescription
          ? html`
              <div class="alert alert--warn">
                ${raw(icon("prescription", { size: 18 }))}
                <span
                  >در سبد شما داروی نسخه‌ای وجود دارد؛ برای نهایی‌سازی، نسخه
                  پزشک لازم است.</span
                >
              </div>
            `
          : ""}

        <a
          class="btn btn--primary btn--block btn--lg"
          href="${to("/checkout")}"
          data-close
        >
          ${raw(icon("shieldCheck", { size: 18 }))} نهایی‌سازی خرید
        </a>
        <a class="btn btn--glass btn--block" href="${to("/cart")}" data-close>
          مشاهده سبد خرید
        </a>
      `.toString(),
    );
  }

  /* --- Wiring ------------------------------------------------------------ */

  const disposers = [];

  disposers.push(
    delegate(panel.node, "click", "[data-remove]", (event, button) => {
      event.preventDefault();
      const id = button.dataset.remove;
      const item = cart.items().find((entry) => entry.productId === id);

      cart.remove(id);
      toast.info("از سبد حذف شد", item ? item.product.name : "");
    }),
  );

  // Re-render whenever the cart slice (or a pending lazy render) changes.
  disposers.push(
    subscribe(() => {
      if (panel.isOpen()) render();
    }),
  );

  disposers.push(
    appEvents.on(EVENTS.openCart, () => {
      render();
      panel.open();
    }),
  );

  disposers.push(appEvents.on(EVENTS.closeCart, () => panel.close()));

  // A fresh render whenever the drawer opens, even if nothing changed.
  disposers.push(
    on(panel.node, "transitionend", () => {
      if (panel.isOpen()) render();
    }),
  );

  return {
    node: panel.node,
    open: () => {
      render();
      panel.open();
    },
    close: panel.close,
    // Part of the drawer contract the shell relies on to coordinate panels:
    // main.js asks every panel whether it is open before hiding the backdrop.
    isOpen: panel.isOpen,
    cleanup: () => {
      teardownSteppers();
      disposers.forEach((dispose) => dispose());
      panel.cleanup();
    },
  };
}

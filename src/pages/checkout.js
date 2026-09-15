/**
 * DARUMIX — multi-step checkout.
 *
 * Four steps held in local component state; the URL is not used because an
 * abandoned checkout should not survive a reload. The cart itself is the single
 * source of truth for money — this page only chooses address, shipping, payment
 * and then calls `account.createOrder`.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import {
  formatPrice,
  toPersianDigits,
  deliveryWindow,
} from "../core/format.js";
import {
  breadcrumbs,
  emptyState,
  pageIntro,
  meter,
} from "../ui/components/common.js";
import { toast, modal } from "../ui/components/overlays.js";
import {
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  FREE_SHIPPING_THRESHOLD,
} from "../data/statuses.js";
import * as cart from "../services/cart.js";
import * as account from "../services/account.js";

const STEPS = [
  { id: "address", label: "نشانی تحویل", icon: "marker" },
  { id: "shipping", label: "روش ارسال", icon: "truck" },
  { id: "payment", label: "پرداخت", icon: "creditCard" },
  { id: "review", label: "بازبینی و ثبت", icon: "checkCircle" },
];

export default async function checkoutPage() {
  const node = el("div");
  const disposers = [];

  /* -------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------- */

  const state = {
    step: 0,
    address: account.defaultAddress(),
    shippingId: "standard",
    paymentMethod: "online",
    coupon: null,
    note: "",
    placedOrder: null,
  };

  const validators = {
    address: () =>
      Boolean(
        state.address &&
        state.address.recipient &&
        state.address.line1 &&
        state.address.city,
      ),
    shipping: () => Boolean(state.shippingId),
    payment: () => Boolean(state.paymentMethod),
    review: () => true,
  };

  /* -------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------- */

  function renderStepper() {
    return html`
      <ol class="checkout-steps" aria-label="مراحل تسویه حساب">
        ${STEPS.map((step, index) => {
          const status =
            index < state.step
              ? "done"
              : index === state.step
                ? "active"
                : "todo";

          return raw(html`
            <li class="checkout-step checkout-step--${status}">
              <span class="checkout-step__marker">
                ${status === "done"
                  ? raw(icon("check", { size: 15 }))
                  : raw(icon(step.icon, { size: 15 }))}
              </span>
              <span class="checkout-step__label">${step.label}</span>
            </li>
          `);
        })}
      </ol>
    `.toString();
  }

  function renderAddressStep() {
    const addresses = account.addresses();

    return html`
      <div class="stack">
        <h2 class="mb-0">نشانی تحویل سفارش</h2>
        <p class="text-muted fs-sm">
          نشانی‌ای را انتخاب کنید که سفارش به آن ارسال شود. می‌توانید نشانی جدید
          هم اضافه کنید.
        </p>

        <div class="stack" data-slot="address-list">
          ${addresses.map((address) =>
            raw(html`
              <label
                class="address-card glass radius-lg${state.address?.id ===
                address.id
                  ? " is-selected"
                  : ""}"
                data-address="${address.id}"
              >
                <input
                  type="radio"
                  name="address"
                  value="${address.id}"
                  ${state.address?.id === address.id ? "checked" : ""}
                  data-address-radio
                />
                <div>
                  <div class="row row--sm">
                    <span class="fw-bold">${address.title}</span>
                    ${address.isDefault
                      ? html`<span class="badge badge--brand">پیش‌فرض</span>`
                      : ""}
                  </div>
                  <p class="fs-sm text-muted mb-1 mt-2">
                    ${address.province}، ${address.city}، ${address.line1}
                    ${address.line2 ? `، ${address.line2}` : ""}
                  </p>
                  <div class="row row--sm fs-xs text-soft">
                    <span>${address.recipient}</span>
                    <span>•</span>
                    <span>${address.phone}</span>
                    <span>•</span>
                    <span>کد پستی ${toPersianDigits(address.postalCode)}</span>
                  </div>
                </div>
              </label>
            `),
          )}
        </div>

        <button class="btn btn--glass" type="button" data-add-address>
          ${raw(icon("plus", { size: 16 }))} افزودن نشانی جدید
        </button>

        <div class="field">
          <label class="field__label" for="order-note"
            >یادداشت برای پیک (اختیاری)</label
          >
          <textarea
            class="textarea"
            id="order-note"
            rows="2"
            placeholder="مثلاً: تحویل به نگهبانی ساختمان"
            data-note
          >
${state.note}</textarea
          >
        </div>
      </div>
    `.toString();
  }

  function renderShippingStep() {
    const base = cart.totals();

    return html`
      <div class="stack">
        <h2 class="mb-0">روش ارسال</h2>
        <p class="text-muted fs-sm">
          ${base.qualifiesFreeShipping
            ? html`سفارش شما واجد شرایط ارسال رایگان است.`
            : html`برای ارسال رایگان، ${formatPrice(base.freeShippingGap)} دیگر
              خرید کنید.`}
        </p>

        <div class="stack" data-slot="shipping-list">
          ${SHIPPING_METHODS.map((method) => {
            const free = base.qualifiesFreeShipping || method.price === 0;

            return raw(html`
              <label
                class="option-card glass radius-lg${state.shippingId ===
                method.id
                  ? " is-selected"
                  : ""}"
                data-shipping="${method.id}"
              >
                <input
                  type="radio"
                  name="shipping"
                  value="${method.id}"
                  ${state.shippingId === method.id ? "checked" : ""}
                  data-shipping-radio
                />
                <span class="option-card__icon"
                  >${raw(icon(method.icon, { size: 20 }))}</span
                >
                <div class="grow">
                  <div class="fw-bold">${method.label}</div>
                  <p class="fs-xs text-muted mb-0">${method.description}</p>
                </div>
                <span class="fw-bold">
                  ${free
                    ? html`<span class="text-success">رایگان</span>`
                    : formatPrice(method.price, { withUnit: false })}
                </span>
              </label>
            `);
          })}
        </div>

        <div class="alert alert--info">
          ${raw(icon("clock", { size: 18 }))}
          <span>زمان تقریبی تحویل: ${deliveryWindow(2)}</span>
        </div>
      </div>
    `.toString();
  }

  function renderPaymentStep() {
    const wallet = account.profile()?.walletBalance || 0;

    return html`
      <div class="stack">
        <h2 class="mb-0">روش پرداخت</h2>
        <p class="text-muted fs-sm">
          این نسخه نمایشی است؛ هیچ پرداخت واقعی انجام نمی‌شود و اطلاعات کارت
          دریافت نمی‌گردد.
        </p>

        <div class="stack" data-slot="payment-list">
          ${PAYMENT_METHODS.map((method) => {
            const disabled = method.id === "wallet" && wallet <= 0;

            return raw(html`
              <label
                class="option-card glass radius-lg${state.paymentMethod ===
                method.id
                  ? " is-selected"
                  : ""}${disabled ? " is-disabled" : ""}"
                data-payment="${method.id}"
              >
                <input
                  type="radio"
                  name="payment"
                  value="${method.id}"
                  ${state.paymentMethod === method.id ? "checked" : ""}
                  ${disabled ? "disabled" : ""}
                  data-payment-radio
                />
                <span class="option-card__icon"
                  >${raw(icon(method.icon, { size: 20 }))}</span
                >
                <div class="grow">
                  <div class="fw-bold">${method.label}</div>
                  <p class="fs-xs text-muted mb-0">${method.description}</p>
                </div>
                ${method.id === "wallet"
                  ? html`<span class="fs-xs fw-bold"
                      >${formatPrice(wallet, { withUnit: false })}</span
                    >`
                  : ""}
              </label>
            `);
          })}
        </div>

        ${state.paymentMethod === "online"
          ? html`
              <div class="alert alert--warn">
                ${raw(icon("alert", { size: 18 }))}
                <span
                  >با انتخاب پرداخت آنلاین، در نسخه واقعی به درگاه بانکی هدایت
                  می‌شوید. در این نمایش، سفارش مستقیماً ثبت می‌شود.</span
                >
              </div>
            `
          : ""}
      </div>
    `.toString();
  }

  function renderReviewStep() {
    const summary = cart.checkoutTotals({
      shippingId: state.shippingId,
      coupon: state.coupon,
    });
    const items = cart.items();
    const shippingMethod = SHIPPING_METHODS.find(
      (method) => method.id === state.shippingId,
    );

    return html`
      <div class="stack stack--lg">
        <div>
          <h2 class="mb-2">بازبینی نهایی</h2>
          <p class="text-muted fs-sm mb-0">
            پیش از ثبت سفارش، اطلاعات زیر را بررسی کنید.
          </p>
        </div>

        ${summary.requiresPrescription
          ? html`
              <div class="alert alert--warn">
                ${raw(icon("prescription", { size: 18 }))}
                <span
                  >در سبد شما داروی نیازمند نسخه وجود دارد. سفارش ثبت می‌شود اما
                  پیش از ارسال، داروساز نسخه شما را بررسی می‌کند.</span
                >
              </div>
            `
          : ""}

        <!-- Items -->
        <section class="glass radius-lg review-block">
          <h3 class="review-block__title">
            کالاها (${toPersianDigits(summary.units)} عدد)
          </h3>
          <div class="stack stack--sm">
            ${items.map((line) =>
              raw(html`
                <div class="review-item">
                  <span class="review-item__media"
                    >${raw(productArt(line.product))}</span
                  >
                  <div class="grow">
                    <div class="fw-semibold">${line.product.name}</div>
                    <span class="fs-xs text-soft"
                      >${toPersianDigits(line.quantity)} ×
                      ${formatPrice(line.unitPrice, { withUnit: false })}
                      تومان</span
                    >
                  </div>
                  <span class="fw-bold"
                    >${formatPrice(line.lineTotal, { withUnit: false })}
                    تومان</span
                  >
                </div>
              `),
            )}
          </div>
        </section>

        <!-- Address -->
        <section class="glass radius-lg review-block">
          <div class="row row--between">
            <h3 class="review-block__title">نشانی تحویل</h3>
            <button class="btn btn--ghost btn--xs" type="button" data-goto="0">
              ویرایش
            </button>
          </div>
          <p class="fs-sm mb-1">
            ${state.address?.province}، ${state.address?.city}،
            ${state.address?.line1}
          </p>
          <div class="row row--sm fs-xs text-soft">
            <span>${state.address?.recipient}</span>
            <span>•</span>
            <span>${state.address?.phone}</span>
          </div>
        </section>

        <!-- Shipping & payment -->
        <section class="glass radius-lg review-block">
          <div class="row row--between">
            <h3 class="review-block__title">ارسال و پرداخت</h3>
            <button class="btn btn--ghost btn--xs" type="button" data-goto="1">
              ویرایش
            </button>
          </div>
          <div class="summary-row">
            <span>روش ارسال</span>
            <span>${shippingMethod?.label || "—"}</span>
          </div>
          <div class="summary-row">
            <span>روش پرداخت</span>
            <span
              >${PAYMENT_METHODS.find(
                (method) => method.id === state.paymentMethod,
              )?.label || "—"}</span
            >
          </div>
          <div class="summary-row">
            <span>تاریخ تحویل تقریبی</span>
            <span>${deliveryWindow(shippingMethod?.etaDays ?? 2)}</span>
          </div>
        </section>

        <label class="check">
          <input type="checkbox" data-terms />
          <span class="check__box">${raw(icon("check", { size: 13 }))}</span>
          <span class="check__text"
            >قوانین فروش و سیاست بازگشت کالای دارومیکس را مطالعه کرده و
            می‌پذیرم.</span
          >
        </label>
      </div>
    `.toString();
  }

  function renderBody() {
    switch (STEPS[state.step].id) {
      case "address":
        return renderAddressStep();
      case "shipping":
        return renderShippingStep();
      case "payment":
        return renderPaymentStep();
      default:
        return renderReviewStep();
    }
  }

  function renderSummaryPanel() {
    const summary = cart.checkoutTotals({
      shippingId: state.shippingId,
      coupon: state.coupon,
    });
    const base = cart.totals();

    return html`
      <aside class="cart-summary glass-2 radius-xl">
        <h2 class="cart-summary__title">
          ${raw(icon("receipt", { size: 19 }))} خلاصه پرداخت
        </h2>

        <div class="free-ship">
          ${base.qualifiesFreeShipping
            ? html`<div class="row row--sm text-success">
                ${raw(icon("truck", { size: 17 }))}
                <span class="fs-sm fw-semibold">ارسال رایگان فعال شد</span>
              </div>`
            : html`<p class="fs-sm mb-2">
                تا ارسال رایگان
                <strong
                  >${formatPrice(base.freeShippingGap, { withUnit: false })}
                  تومان</strong
                >
                باقی مانده
              </p>`}
          ${raw(meter(base.freeShippingProgress, "brand"))}
        </div>

        <div class="summary-rows">
          <div class="summary-row">
            <span>جمع کالاها</span>
            <span>${formatPrice(summary.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>هزینه ارسال</span>
            <span>
              ${summary.shippingFree
                ? html`<span class="text-success fw-bold">رایگان</span>`
                : formatPrice(summary.shipping)}
            </span>
          </div>
          ${summary.discount
            ? html`<div class="summary-row text-success">
                <span>تخفیف</span>
                <span>−${formatPrice(summary.discount)}</span>
              </div>`
            : ""}
          <div class="summary-row summary-row--total">
            <span>قابل پرداخت</span>
            <span>${formatPrice(summary.payable)}</span>
          </div>
        </div>

        ${STEPS.length > 1
          ? html`<p class="fs-xs text-soft mt-3 mb-0">
              آستانه ارسال رایگان: ${formatPrice(FREE_SHIPPING_THRESHOLD)}
            </p>`
          : ""}
      </aside>
    `.toString();
  }

  function render() {
    /* --- Success screen --- */
    if (state.placedOrder) {
      const order = state.placedOrder;

      node.innerHTML = html`
        <div class="shell shell--narrow">
          <div class="order-success glass-2 radius-xl">
            <span class="order-success__icon"
              >${raw(icon("checkCircle", { size: 44 }))}</span
            >
            <h1 class="order-success__title">سفارش شما ثبت شد</h1>
            <p class="text-muted">
              از خرید شما سپاسگزاریم. کد پیگیری سفارش شما در ادامه آمده است.
            </p>

            <div class="order-code">
              <span class="fs-xs text-soft">کد سفارش</span>
              <strong class="fs-xl">${order.id}</strong>
            </div>

            <div class="summary-rows mt-6" style="text-align:start">
              <div class="summary-row">
                <span>مبلغ پرداختی</span>
                <span>${formatPrice(order.total)}</span>
              </div>
              <div class="summary-row">
                <span>تعداد اقلام</span>
                <span>${toPersianDigits(order.itemCount)} عدد</span>
              </div>
              <div class="summary-row">
                <span>تحویل تقریبی</span>
                <span>${deliveryWindow(2)}</span>
              </div>
            </div>

            <div class="row mt-8" style="justify-content:center">
              <a
                class="btn btn--primary"
                href="${to(`/account/order/${order.id}`)}"
              >
                ${raw(icon("package", { size: 18 }))} پیگیری سفارش
              </a>
              <a class="btn btn--glass" href="${to("/catalog")}">
                ${raw(icon("bag", { size: 18 }))} ادامه خرید
              </a>
            </div>
          </div>
        </div>
      `.toString();

      return;
    }

    /* --- Empty cart guard --- */
    if (cart.isEmpty()) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([
              { label: "خانه", href: "/" },
              { label: "تسویه حساب" },
            ]),
          )}
          ${raw(pageIntro({ title: "تسویه حساب" }))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "cart",
          title: "برای تسویه حساب، سبد خرید نباید خالی باشد",
          text: "ابتدا محصولی را به سبد اضافه کنید، سپس فرآیند خرید را کامل کنید.",
          action: {
            label: "مشاهده فروشگاه",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    /* --- Normal flow --- */
    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "سبد خرید", href: "/cart" },
            { label: "تسویه حساب" },
          ]),
        )}

        <header class="page-intro">
          <h1 class="page-intro__title">تسویه حساب</h1>
        </header>

        ${raw(renderStepper())}

        <div class="checkout-layout">
          <div>
            <div class="glass radius-xl checkout-panel" data-slot="body"></div>

            <div class="checkout-nav">
              <button
                class="btn btn--glass"
                type="button"
                data-prev
                ${state.step === 0 ? "disabled" : ""}
              >
                ${raw(icon("arrowRight", { size: 17 }))} مرحله قبل
              </button>

              ${state.step < STEPS.length - 1
                ? html`<button class="btn btn--primary" type="button" data-next>
                    مرحله بعد ${raw(icon("arrowLeft", { size: 17 }))}
                  </button>`
                : html`<button
                    class="btn btn--primary btn--lg"
                    type="button"
                    data-place-order
                  >
                    ${raw(icon("checkCircle", { size: 18 }))} ثبت نهایی سفارش
                  </button>`}
            </div>
          </div>

          <div data-slot="summary"></div>
        </div>
      </div>
    `.toString();

    qs('[data-slot="body"]', node).innerHTML = renderBody();
    qs('[data-slot="summary"]', node).innerHTML = renderSummaryPanel();

    // Reflect the note field's live value so it survives a re-render.
    const noteField = qs("[data-note]", node);
    if (noteField) {
      noteField.addEventListener("input", () => {
        state.note = noteField.value;
      });
    }
  }

  /* -------------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------------- */

  function goTo(step) {
    if (step < 0 || step >= STEPS.length) return;
    state.step = step;
    render();
    qs(".checkout-steps", node)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function next() {
    const current = STEPS[state.step].id;

    if (!validators[current]()) {
      toast.error(
        "تکمیل این مرحله الزامی است",
        "لطفاً اطلاعات خواسته‌شده را کامل کنید.",
      );
      return;
    }

    goTo(state.step + 1);
  }

  async function placeOrder() {
    const terms = qs("[data-terms]", node);
    if (terms && !terms.checked) {
      toast.warn(
        "پذیرش قوانین الزامی است",
        "برای ثبت سفارش باید قوانین را بپذیرید.",
      );
      return;
    }

    const button = qs("[data-place-order]", node);
    button.classList.add("is-busy");

    const result = account.createOrder({
      address: state.address,
      shippingId: state.shippingId,
      paymentMethod: state.paymentMethod,
      couponCode: state.coupon?.code || "",
      note: state.note,
    });

    button.classList.remove("is-busy");

    if (!result.ok) {
      toast.error("ثبت سفارش ناموفق بود", result.reason);
      return;
    }

    state.placedOrder = result.order;
    render();

    toast.success("سفارش شما ثبت شد", `کد سفارش: ${result.order.id}`);
  }

  /* -------------------------------------------------------------------------
     Address modal
     ------------------------------------------------------------------------- */

  function openAddressModal() {
    const dialog = modal({
      title: "افزودن نشانی جدید",
      size: "md",
      body: html`
        <form class="form-grid form-grid--2" data-address-form novalidate>
          <div class="field">
            <label class="field__label" for="addr-title">عنوان نشانی</label>
            <input
              class="input"
              id="addr-title"
              name="title"
              placeholder="خانه، محل کار…"
            />
          </div>
          <div class="field">
            <label class="field__label" for="addr-recipient"
              >نام گیرنده <span class="field__required">*</span></label
            >
            <input class="input" id="addr-recipient" name="recipient" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-phone"
              >شماره تماس <span class="field__required">*</span></label
            >
            <input class="input" id="addr-phone" name="phone" inputmode="tel" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-postal">کد پستی</label>
            <input
              class="input"
              id="addr-postal"
              name="postalCode"
              inputmode="numeric"
            />
          </div>
          <div class="field">
            <label class="field__label" for="addr-province"
              >استان <span class="field__required">*</span></label
            >
            <input class="input" id="addr-province" name="province" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-city"
              >شهر <span class="field__required">*</span></label
            >
            <input class="input" id="addr-city" name="city" />
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="addr-line1"
              >نشانی کامل <span class="field__required">*</span></label
            >
            <input class="input" id="addr-line1" name="line1" />
            <span class="field__error" data-error hidden></span>
          </div>
          <label class="check" style="grid-column:1/-1">
            <input type="checkbox" name="isDefault" />
            <span class="check__box">${raw(icon("check", { size: 13 }))}</span>
            <span class="check__text">این نشانی پیش‌فرض من باشد</span>
          </label>
        </form>
      `,
      footer:
        `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
        `<button class="btn btn--primary" type="button" data-save-address>ذخیره نشانی</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-address]")) return;

      const form = qs("[data-address-form]", dialog.node);
      const errorSlot = qs("[data-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      const missing = [
        "recipient",
        "phone",
        "province",
        "city",
        "line1",
      ].filter((name) => !value(name));

      if (missing.length) {
        errorSlot.hidden = false;
        errorSlot.textContent = "پر کردن فیلدهای ستاره‌دار الزامی است.";
        return;
      }

      const created = account.addAddress({
        title: value("title") || "نشانی جدید",
        recipient: value("recipient"),
        phone: value("phone"),
        postalCode: value("postalCode"),
        province: value("province"),
        city: value("city"),
        line1: value("line1"),
        line2: "",
        isDefault: Boolean(qs('[name="isDefault"]', form)?.checked),
      });

      dialog.close();

      // A newly added address becomes the selected one, which is what the user
      // almost always wants after filling the form.
      state.address = created;
      toast.success("نشانی ذخیره شد");
      render();
    });
  }

  /* -------------------------------------------------------------------------
     Delegated wiring (one listener for the whole page)
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-next]", (event) => {
      event.preventDefault();
      next();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-prev]", (event) => {
      event.preventDefault();
      goTo(state.step - 1);
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-goto]", (event, button) => {
      event.preventDefault();
      goTo(Number(button.dataset.goto));
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-place-order]", (event) => {
      event.preventDefault();
      placeOrder();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-add-address]", (event) => {
      event.preventDefault();
      openAddressModal();
    }),
  );

  // Radio selections: update state, then repaint so the summary follows.
  disposers.push(
    delegate(node, "change", "[data-address-radio]", (event, input) => {
      const address = account
        .addresses()
        .find((entry) => entry.id === input.value);
      if (!address) return;
      state.address = address;
      render();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-shipping-radio]", (event, input) => {
      state.shippingId = input.value;
      render();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-payment-radio]", (event, input) => {
      state.paymentMethod = input.value;
      render();
    }),
  );

  render();

  return {
    node,
    title: "تسویه حساب",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

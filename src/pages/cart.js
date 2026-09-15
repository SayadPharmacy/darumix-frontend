/**
 * DARUMIX — full cart page.
 *
 * The drawer is for quick edits; this page is the considered view: line items
 * with quantity controls, a coupon field, the free-shipping progress meter and
 * the order summary that leads into checkout.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to, navigate } from "../core/router.js";
import { formatPrice, toPersianDigits } from "../core/format.js";
import {
  breadcrumbs,
  emptyState,
  quantityStepper,
  pageIntro,
  meter,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import * as cart from "../services/cart.js";
import * as catalogService from "../services/catalog.js";
import * as account from "../services/account.js";

export default async function cartPage() {
  const node = el("div");
  const disposers = [];

  const couponState = { coupon: null };
  const steppers = [];

  /* -------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------- */

  function render() {
    // Tear down the previous render's stepper listeners before rebuilding.
    steppers.splice(0).forEach((dispose) => dispose());

    const items = cart.items();
    const totalsData = cart.totals();
    const summary = cart.checkoutTotals({ coupon: couponState.coupon });

    /* --- Empty --- */
    if (!items.length) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([{ label: "خانه", href: "/" }, { label: "سبد خرید" }]),
          )}
          ${raw(
            pageIntro({
              title: "سبد خرید",
              text: "سبد خرید شما در حال حاضر خالی است.",
            }),
          )}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "cart",
          title: "سبد خرید شما خالی است",
          text: "محصولی را از فروشگاه انتخاب کنید تا اینجا نمایش داده شود. اگر مطمئن نیستید از کجا شروع کنید، پرفروش‌ترین‌ها را ببینید.",
          action: {
            label: "شروع خرید",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    /* --- With items --- */
    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([{ label: "خانه", href: "/" }, { label: "سبد خرید" }]),
        )}
        ${raw(
          pageIntro({
            title: "سبد خرید",
            text: `${toPersianDigits(totalsData.lines)} محصول در سبد شما قرار دارد.`,
          }),
        )}

        <div class="cart-layout">
          <!-- ======================= Lines ======================= -->
          <div>
            ${totalsData.requiresPrescription
              ? html`
                  <div class="alert alert--warn">
                    ${raw(icon("prescription", { size: 18 }))}
                    <span
                      >در سبد شما داروی نیازمند نسخه وجود دارد. برای تکمیل سفارش
                      لازم است نسخه را ثبت کنید.
                      <a class="fw-bold" href="${to("/prescription")}"
                        >ثبت نسخه</a
                      ></span
                    >
                  </div>
                `
              : ""}

            <div class="stack" data-slot="lines"></div>

            <div class="row row--between mt-6">
              <a class="btn btn--glass btn--sm" href="${to("/catalog")}">
                ${raw(icon("arrowRight", { size: 16 }))} ادامه خرید
              </a>
              <button
                class="btn btn--ghost btn--sm text-danger"
                type="button"
                data-clear-cart
              >
                ${raw(icon("trash", { size: 16 }))} خالی کردن سبد
              </button>
            </div>
          </div>

          <!-- ======================= Summary ======================= -->
          <aside class="cart-summary glass-2 radius-xl">
            <h2 class="cart-summary__title">خلاصه سفارش</h2>

            <!-- Free-shipping meter -->
            <div class="free-ship">
              ${totalsData.qualifiesFreeShipping
                ? html`
                    <div class="row row--sm text-success">
                      ${raw(icon("truck", { size: 17 }))}
                      <span class="fs-sm fw-semibold"
                        >ارسال شما رایگان است</span
                      >
                    </div>
                  `
                : html`
                    <p class="fs-sm mb-2">
                      تا ارسال رایگان
                      <strong
                        >${formatPrice(totalsData.freeShippingGap, {
                          withUnit: false,
                        })}
                        تومان</strong
                      >
                      باقی مانده
                    </p>
                  `}
              ${raw(meter(totalsData.freeShippingProgress, "brand"))}
            </div>

            <!-- Coupon -->
            <form class="coupon" data-coupon-form novalidate>
              <label class="field__label" for="coupon-input">کد تخفیف</label>
              <div class="row row--nowrap">
                <input
                  class="input"
                  id="coupon-input"
                  name="code"
                  placeholder="مثلاً DARUMIX10"
                  value="${summary.couponCode}"
                  autocomplete="off"
                />
                <button class="btn btn--glass" type="submit">
                  ${raw(icon("tag", { size: 16 }))} اعمال
                </button>
              </div>
              <p class="field__hint" data-coupon-hint>
                کدهای نمایشی: DARUMIX10، WELCOME50، SALAMAT15، FREESHIP
              </p>
            </form>

            <!-- Totals -->
            <div class="summary-rows">
              <div class="summary-row">
                <span
                  >جمع کالاها (${toPersianDigits(totalsData.units)} عدد)</span
                >
                <span>${formatPrice(summary.subtotal)}</span>
              </div>

              ${summary.savings
                ? html`
                    <div class="summary-row text-success">
                      <span>سود شما از خرید</span>
                      <span>${formatPrice(summary.savings)}</span>
                    </div>
                  `
                : ""}

              <div class="summary-row">
                <span>هزینه ارسال</span>
                <span>
                  ${summary.shippingFree
                    ? html`<span class="text-success fw-bold">رایگان</span>`
                    : formatPrice(summary.shipping)}
                </span>
              </div>

              ${summary.discount
                ? html`
                    <div class="summary-row text-success">
                      <span>تخفیف ${summary.couponCode}</span>
                      <span>−${formatPrice(summary.discount)}</span>
                    </div>
                  `
                : ""}

              <div class="summary-row summary-row--total">
                <span>مبلغ قابل پرداخت</span>
                <span>${formatPrice(summary.total)}</span>
              </div>
            </div>

            <button
              class="btn btn--primary btn--lg btn--block mt-4"
              type="button"
              data-checkout
            >
              ${raw(icon("creditCard", { size: 18 }))} ادامه فرآیند خرید
            </button>

            <div class="trust-tile mt-4">
              ${raw(icon("shieldCheck", { size: 16 }))}
              <span
                >پرداخت امن؛ در این نسخه نمایشی پرداخت واقعی انجام
                نمی‌شود.</span
              >
            </div>
          </aside>
        </div>
      </div>
    `.toString();

    /* --- Line items --- */
    const linesSlot = qs('[data-slot="lines"]', node);

    items.forEach((line) => {
      const row = el("article", {
        class: "cart-line glass radius-lg",
        "data-product-id": line.productId,
      });

      row.innerHTML = html`
        <a
          class="cart-line__media"
          href="${to(`/product/${line.product.slug}`)}"
          aria-label="${line.product.name}"
        >
          ${raw(productArt(line.product))}
        </a>

        <div class="cart-line__body">
          <span class="p-card__brand">${line.product.brandName}</span>
          <h3 class="cart-line__title">
            <a href="${to(`/product/${line.product.slug}`)}"
              >${line.product.name}</a
            >
          </h3>
          ${line.variant
            ? html`<span class="fs-xs text-soft"
                >بسته‌بندی: ${line.variant}</span
              >`
            : ""}
          ${line.inStock
            ? html`<span class="fs-xs text-success"
                >${raw(icon("check", { size: 12 }))} موجود</span
              >`
            : html`<span class="fs-xs text-danger"
                >ناموجود — لطفاً حذف کنید</span
              >`}
        </div>

        <div class="cart-line__qty" data-slot="qty"></div>

        <div class="cart-line__price">
          <span class="price">
            <span class="price__now"
              >${formatPrice(line.lineTotal, { withUnit: false })}</span
            >
            <span class="price__unit">تومان</span>
          </span>
          ${line.quantity > 1
            ? html`<span class="fs-xs text-soft"
                >واحد: ${formatPrice(line.unitPrice, { withUnit: false })}
                تومان</span
              >`
            : ""}
        </div>

        <div class="cart-line__actions">
          <button
            class="icon-btn"
            type="button"
            data-line-wishlist
            data-tip="انتقال به علاقه‌مندی‌ها"
            aria-label="انتقال ${line.product.name} به علاقه‌مندی‌ها"
          >
            ${raw(icon("heart", { size: 17 }))}
          </button>
          <button
            class="icon-btn"
            type="button"
            data-line-remove
            data-tip="حذف از سبد"
            aria-label="حذف ${line.product.name} از سبد"
          >
            ${raw(icon("trash", { size: 17 }))}
          </button>
        </div>
      `.toString();

      const stepper = quantityStepper({
        value: line.quantity,
        min: 1,
        max: line.maxQuantity,
        size: "sm",
        onChange: (value) => {
          cart.updateQuantity(line.productId, value);
          render();
        },
      });

      qs('[data-slot="qty"]', row).append(stepper.node);
      steppers.push(stepper.cleanup);

      linesSlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Event wiring — delegated once, survives every re-render
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-line-remove]", async (event, button) => {
      event.preventDefault();
      const row = button.closest("[data-product-id]");
      const productId = row?.dataset.productId;
      if (!productId) return;

      const product = catalogService.getProductById(productId);
      const ok = await confirmDialog({
        title: "حذف از سبد خرید",
        message: `«${product?.name || "این محصول"}» از سبد خرید حذف شود؟`,
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      cart.remove(productId);
      toast.info("از سبد خرید حذف شد", product?.name);
      render();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-line-wishlist]", (event, button) => {
      event.preventDefault();
      const row = button.closest("[data-product-id]");
      const productId = row?.dataset.productId;
      if (!productId) return;

      account.toggleWishlist(productId);
      cart.remove(productId);
      toast.success("به علاقه‌مندی‌ها منتقل شد");
      render();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-clear-cart]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "خالی کردن سبد خرید",
        message: "همه کالاهای سبد خرید حذف شوند؟ این کار قابل بازگشت نیست.",
        confirmLabel: "خالی کن",
        danger: true,
      });

      if (!ok) return;

      cart.clear();
      toast.info("سبد خرید خالی شد");
      render();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-checkout]", (event) => {
      event.preventDefault();
      if (cart.isEmpty()) {
        toast.warn("سبد خرید خالی است");
        return;
      }
      navigate("/checkout");
    }),
  );

  disposers.push(
    delegate(node, "submit", "[data-coupon-form]", (event, form) => {
      event.preventDefault();

      const input = qs('input[name="code"]', form);
      const hint = qs("[data-coupon-hint]", node);
      const code = input?.value.trim() || "";

      // Clearing the field removes the coupon rather than failing validation.
      if (!code) {
        couponState.coupon = null;
        if (hint) hint.textContent = "کد تخفیف حذف شد.";
        render();
        return;
      }

      const result = cart.validateCoupon(code, cart.totals().subtotal);

      if (!result.ok) {
        if (hint) hint.textContent = result.reason;
        toast.error("کد تخفیف پذیرفته نشد", result.reason);
        return;
      }

      couponState.coupon = result.coupon;
      toast.success("کد تخفیف اعمال شد", result.coupon.label);
      render();
    }),
  );

  render();

  return {
    node,
    title: "سبد خرید",
    cleanup: () => {
      steppers.splice(0).forEach((dispose) => dispose());
      disposers.forEach((dispose) => dispose());
    },
  };
}

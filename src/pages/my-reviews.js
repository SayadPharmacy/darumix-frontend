/**
 * DARUMIX — "my reviews" list.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatDate,
  formatRelativeTime,
} from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  emptyState,
  ratingStars,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import * as account from "../services/account.js";
import * as catalogService from "../services/catalog.js";

export default async function myReviewsPage() {
  const node = el("div");
  const disposers = [];

  function render() {
    const reviews = account.myReviews();

    if (!reviews.length) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([
              { label: "خانه", href: "/" },
              { label: "حساب کاربری", href: "/account" },
              { label: "نظرات من" },
            ]),
          )}
          ${raw(pageIntro({ title: "نظرات من" }))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "star",
          title: "هنوز نظری ثبت نکرده‌اید",
          text: "تجربه خود از محصولات دارومیکس را با دیگران به اشتراک بگذارید؛ نظر شما به انتخاب بهتر دیگران کمک می‌کند.",
          action: {
            label: "مشاهده محصولات",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    const average =
      reviews.reduce((total, review) => total + (review.rating || 0), 0) /
      reviews.length;

    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "حساب کاربری", href: "/account" },
            { label: "نظرات من" },
          ]),
        )}
        ${raw(
          pageIntro({
            title: "نظرات من",
            text: `${toPersianDigits(reviews.length)} نظر ثبت کرده‌اید — میانگین امتیاز شما ${toPersianDigits(
              average.toFixed(1),
            )} از ۵ است.`,
          }),
        )}

        <div class="catalog-toolbar glass radius-lg">
          <span
            >نظرات شما پس از بررسی کارشناسان در صفحه محصول نمایش داده
            می‌شوند.</span
          >
          <a class="btn btn--glass btn--sm" href="${to("/catalog")}">
            ${raw(icon("bag", { size: 15 }))} خرید و ثبت نظر جدید
          </a>
        </div>

        <div class="stack mt-6" data-slot="list"></div>
      </div>
    `.toString();

    const listSlot = qs('[data-slot="list"]', node);

    reviews.forEach((review) => {
      const product = catalogService.getProductById(review.productId);

      const card = el("article", { class: "review-card glass radius-xl" });
      card.innerHTML = html`
        <div class="review-card__product">
          <span class="review-card__media">
            ${raw(
              productArt(
                product || {
                  id: review.productId,
                  name: review.productName,
                  shape: "pack",
                  tone: "emerald",
                },
              ),
            )}
          </span>
          <div class="grow">
            <a
              class="fw-semibold"
              href="${product
                ? to(`/product/${product.slug}`)
                : to("/catalog")}"
              >${product?.name || review.productName || "محصول"}</a
            >
            <span class="fs-xs text-soft">${product?.brandName || ""}</span>
          </div>
          <span class="badge badge--neutral"
            >${formatRelativeTime(review.date)}</span
          >
        </div>

        <div class="review-card__body">
          <div class="row row--sm">
            ${raw(ratingStars(review.rating || 0, { showValue: true }))}
            ${review.verified
              ? html`<span class="badge badge--mint"
                  >${raw(icon("check", { size: 12 }))} خرید تأییدشده</span
                >`
              : ""}
          </div>

          ${review.title
            ? html`<h3 class="review-card__title">${review.title}</h3>`
            : ""}
          <p class="mb-0">${review.text}</p>

          <div class="row row--sm fs-xs text-soft mt-3">
            <span>${formatDate(review.date)}</span>
            <span>•</span>
            <span
              >${toPersianDigits(review.helpful || 0)} نفر این نظر را مفید
              دانستند</span
            >
          </div>
        </div>

        <div class="row mt-4">
          ${product
            ? html`
                <a
                  class="btn btn--glass btn--sm"
                  href="${to(`/product/${product.slug}`)}"
                >
                  ${raw(icon("eye", { size: 15 }))} مشاهده محصول
                </a>
              `
            : ""}
          <button
            class="btn btn--ghost btn--sm text-danger"
            type="button"
            data-delete="${review.id}"
          >
            ${raw(icon("trash", { size: 15 }))} حذف نظر
          </button>
        </div>
      `.toString();

      listSlot.append(card);
    });
  }

  disposers.push(
    delegate(node, "click", "[data-delete]", async (event, button) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "حذف نظر",
        message: "این نظر برای همیشه حذف شود؟",
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      account.removeReview(button.dataset.delete);
      toast.info("نظر شما حذف شد");
      render();
    }),
  );

  render();

  return {
    node,
    title: "نظرات من",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

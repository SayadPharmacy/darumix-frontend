/**
 * DARUMIX — recently viewed products.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { toPersianDigits } from "../core/format.js";
import {
  productCard,
  breadcrumbs,
  emptyState,
  pageIntro,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import * as account from "../services/account.js";
import * as cart from "../services/cart.js";

export default async function recentlyViewedPage() {
  const node = el("div");
  const disposers = [];
  const cards = [];

  function render() {
    cards.splice(0).forEach((dispose) => dispose());

    const items = account.recentlyViewed();

    if (!items.length) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([
              { label: "خانه", href: "/" },
              { label: "بازدیدهای اخیر" },
            ]),
          )}
          ${raw(pageIntro({ title: "بازدیدهای اخیر" }))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "history",
          title: "هنوز محصولی بازدید نکرده‌اید",
          text: "محصولاتی که مشاهده می‌کنید اینجا نگه داشته می‌شوند تا بعداً سریع‌تر پیدایشان کنید.",
          action: {
            label: "مشاهده فروشگاه",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "بازدیدهای اخیر" },
          ]),
        )}
        ${raw(
          pageIntro({
            title: "بازدیدهای اخیر",
            text: `${toPersianDigits(items.length)} محصول اخیراً توسط شما دیده شده است.`,
          }),
        )}

        <div class="catalog-toolbar glass radius-lg">
          <span
            >آخرین ${toPersianDigits(items.length)} محصولی که مشاهده
            کرده‌اید</span
          >
          <button
            class="btn btn--ghost btn--sm text-danger"
            type="button"
            data-clear
          >
            ${raw(icon("trash", { size: 15 }))} پاک کردن تاریخچه
          </button>
        </div>

        <div class="product-grid mt-6" data-slot="grid"></div>
      </div>
    `.toString();

    const grid = qs('[data-slot="grid"]', node);

    items.forEach((product) => {
      const card = productCard(product, {
        onAdd: async (item) => {
          const result = cart.add(item.id, 1);
          if (!result.ok && result.reason === "out-of-stock") {
            toast.error("این محصول موجود نیست", item.name);
          }
          return result;
        },
        actions: {
          onWishlist: (item, button) => {
            const added = account.toggleWishlist(item.id);
            button.classList.toggle("is-active", added);
          },
          onCompare: (item, button) => {
            const result = account.toggleCompare(item.id);
            if (!result.ok) {
              toast.warn("مقایسه محدود است", result.reason);
              return;
            }
            button.classList.toggle("is-active", result.added);
          },
        },
      });

      grid.append(card.node);
      cards.push(card.cleanup);
    });
  }

  disposers.push(
    delegate(node, "click", "[data-clear]", async (event) => {
      event.preventDefault();
      const ok = await confirmDialog({
        title: "پاک کردن تاریخچه بازدید",
        message: "فهرست بازدیدهای اخیر پاک شود؟",
        confirmLabel: "پاک کن",
        danger: true,
      });
      if (!ok) return;

      account.clearRecentlyViewed();
      toast.info("تاریخچه بازدید پاک شد");
      render();
    }),
  );

  render();

  return {
    node,
    title: "بازدیدهای اخیر",
    cleanup: () => {
      cards.splice(0).forEach((dispose) => dispose());
      disposers.forEach((dispose) => dispose());
    },
  };
}

/**
 * DARUMIX — wishlist page.
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

export default async function wishlistPage() {
  const node = el("div");
  const disposers = [];
  const cards = [];

  function render() {
    cards.splice(0).forEach((dispose) => dispose());

    const items = account.wishlist();

    if (!items.length) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([
              { label: "خانه", href: "/" },
              { label: "علاقه‌مندی‌ها" },
            ]),
          )}
          ${raw(pageIntro({ title: "علاقه‌مندی‌ها" }))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "heart",
          title: "لیست علاقه‌مندی‌های شما خالی است",
          text: "با زدن آیکن قلب روی هر محصول، آن را برای بررسی بعدی اینجا ذخیره کنید.",
          action: {
            label: "مشاهده محصولات",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    const available = items.filter((product) => product.stock > 0);

    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "علاقه‌مندی‌ها" },
          ]),
        )}
        ${raw(
          pageIntro({
            title: "علاقه‌مندی‌ها",
            text: `${toPersianDigits(items.length)} محصول ذخیره شده است.`,
          }),
        )}

        <div class="catalog-toolbar glass radius-lg">
          <span
            >${toPersianDigits(available.length)} کالا از
            ${toPersianDigits(items.length)} موجود است</span
          >
          <div class="row row--sm">
            <button
              class="btn btn--primary btn--sm"
              type="button"
              data-add-all
              ${available.length ? "" : "disabled"}
            >
              ${raw(icon("cart", { size: 16 }))} افزودن همه موجودها به سبد
            </button>
            <button
              class="btn btn--ghost btn--sm text-danger"
              type="button"
              data-clear
            >
              ${raw(icon("trash", { size: 15 }))} خالی کردن لیست
            </button>
          </div>
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
            account.toggleWishlist(item.id);
            button.classList.remove("is-active");
            toast.info("از علاقه‌مندی‌ها حذف شد", item.name);
            render();
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
    delegate(node, "click", "[data-add-all]", (event) => {
      event.preventDefault();
      const ids = account
        .wishlist()
        .filter((product) => product.stock > 0)
        .map((product) => product.id);
      const result = cart.addMany(ids);

      if (result.added) {
        toast.success(
          "به سبد خرید اضافه شد",
          `${toPersianDigits(result.added)} محصول موجود به سبد اضافه شد.`,
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
    delegate(node, "click", "[data-clear]", async (event) => {
      event.preventDefault();
      const ok = await confirmDialog({
        title: "خالی کردن علاقه‌مندی‌ها",
        message: "همه محصولات از لیست علاقه‌مندی‌ها حذف شوند؟",
        confirmLabel: "حذف کن",
        danger: true,
      });
      if (!ok) return;

      account.clearWishlist();
      toast.info("لیست علاقه‌مندی‌ها خالی شد");
      render();
    }),
  );

  render();

  return {
    node,
    title: "علاقه‌مندی‌ها",
    cleanup: () => {
      cards.splice(0).forEach((dispose) => dispose());
      disposers.forEach((dispose) => dispose());
    },
  };
}

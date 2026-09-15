/**
 * DARUMIX — product comparison page.
 *
 * Up to four products side by side as a real table, so specs line up row by
 * row. The union of every spec label is used, so products with different spec
 * sets still compare meaningfully (missing values render as a dash).
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import { formatPrice, toPersianDigits } from "../core/format.js";
import {
  breadcrumbs,
  emptyState,
  pageIntro,
  ratingStars,
  stockIndicator,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import * as account from "../services/account.js";
import * as cart from "../services/cart.js";
import * as catalogService from "../services/catalog.js";

/** Rows rendered for every product, independent of specs. */
function baseRows(products) {
  return [
    {
      label: "تصویر",
      render: (product) =>
        raw(productArt(product, { className: "product-art--sm" })),
    },
    {
      label: "برند",
      render: (product) => product.brandName,
    },
    {
      label: "دسته‌بندی",
      render: (product) =>
        `${product.categoryTitle}${product.subcategoryTitle ? ` · ${product.subcategoryTitle}` : ""}`,
    },
    {
      label: "امتیاز کاربران",
      render: (product) =>
        raw(ratingStars(product.rating, { count: product.reviewCount })),
    },
    {
      label: "قیمت",
      render: (product) =>
        raw(html`
          <span class="price">
            <span class="price__now"
              >${formatPrice(product.price, { withUnit: false })}</span
            >
            <span class="price__unit">تومان</span>
          </span>
        `),
    },
    {
      label: "موجودی",
      render: (product) => raw(stockIndicator(product)),
    },
    {
      label: "نسخه‌ای",
      render: (product) =>
        product.rx
          ? raw(html`<span class="badge badge--info">نیازمند نسخه</span>`)
          : raw(html`<span class="badge badge--neutral">بدون نسخه</span>`),
    },
    {
      label: "بسته‌بندی",
      render: (product) => (product.variants || []).join("، ") || "—",
    },
  ];
}

export default async function comparePage() {
  const node = el("div");
  const disposers = [];

  function render() {
    const products = account.compareList();

    /* --- Empty --- */
    if (products.length < 1) {
      node.innerHTML = html`
        <div class="shell">
          ${raw(
            breadcrumbs([
              { label: "خانه", href: "/" },
              { label: "مقایسه محصولات" },
            ]),
          )}
          ${raw(pageIntro({ title: "مقایسه محصولات" }))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString();

      qs('[data-slot="empty"]', node).append(
        emptyState({
          iconName: "scale",
          title: "لیست مقایسه خالی است",
          text: "با زدن آیکن ترازو روی کارت هر محصول، حداکثر ۴ کالا را برای مقایسه اینجا اضافه کنید.",
          action: {
            label: "مشاهده محصولات",
            variant: "btn--primary",
            href: "/catalog",
          },
        }).node,
      );

      return;
    }

    /* --- Build the row set: base rows + union of spec labels --- */
    const specLabels = [];
    products.forEach((product) => {
      (product.specs || []).forEach((spec) => {
        const label = spec.label || spec.key;
        if (label && !specLabels.includes(label)) specLabels.push(label);
      });
    });

    const specRows = specLabels.map((label) => ({
      label,
      render: (product) => {
        const spec = (product.specs || []).find(
          (entry) => (entry.label || entry.key) === label,
        );
        return spec ? spec.value : "—";
      },
    }));

    const rows = [...baseRows(products), ...specRows];

    /* --- Combination price for the whole set --- */
    const setTotal = products.reduce(
      (total, product) => total + product.price,
      0,
    );
    const inStockCount = products.filter((product) => product.stock > 0).length;

    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "مقایسه محصولات" },
          ]),
        )}
        ${raw(
          pageIntro({
            title: "مقایسه محصولات",
            text: `${toPersianDigits(products.length)} محصول انتخاب شده است. می‌توانید حداکثر ۴ محصول را با هم بسنجید.`,
          }),
        )}

        <div class="catalog-toolbar glass radius-lg">
          <span
            >جمع قیمت این ${toPersianDigits(products.length)} محصول:
            <strong>${formatPrice(setTotal)}</strong></span
          >
          <div class="row row--sm">
            <button
              class="btn btn--primary btn--sm"
              type="button"
              data-add-all
              ${inStockCount ? "" : "disabled"}
            >
              ${raw(icon("cart", { size: 16 }))} افزودن همه
            </button>
            <button
              class="btn btn--ghost btn--sm text-danger"
              type="button"
              data-clear
            >
              ${raw(icon("trash", { size: 15 }))} پاک کردن مقایسه
            </button>
          </div>
        </div>

        <div class="table-wrap compare-table-wrap mt-6">
          <table class="table compare-table">
            <thead>
              <tr>
                <th scope="col" class="compare-table__corner">ویژگی</th>
                ${products.map((product) =>
                  raw(html`
                    <th scope="col" data-product-id="${product.id}">
                      <div class="compare-col">
                        <button
                          class="icon-btn compare-col__remove"
                          type="button"
                          data-remove="${product.id}"
                          aria-label="حذف ${product.name} از مقایسه"
                        >
                          ${raw(icon("close", { size: 15 }))}
                        </button>
                        <a
                          class="compare-col__title"
                          href="${to(`/product/${product.slug}`)}"
                          >${product.name}</a
                        >
                        <button
                          class="btn btn--primary btn--xs"
                          type="button"
                          data-col-add="${product.id}"
                          ${product.stock <= 0 ? "disabled" : ""}
                        >
                          ${product.stock <= 0 ? "ناموجود" : "افزودن به سبد"}
                        </button>
                      </div>
                    </th>
                  `),
                )}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) =>
                raw(html`
                  <tr>
                    <th scope="row">${row.label}</th>
                    ${products.map((product) =>
                      raw(html`<td>${row.render(product)}</td>`),
                    )}
                  </tr>
                `),
              )}
            </tbody>
          </table>
        </div>

        ${products.length < 4
          ? html`
              <div class="alert alert--info mt-6">
                ${raw(icon("info", { size: 18 }))}
                <span
                  >می‌توانید ${toPersianDigits(4 - products.length)} محصول دیگر
                  هم اضافه کنید.
                  <a class="fw-bold" href="${to("/catalog")}"
                    >افزودن از فروشگاه</a
                  ></span
                >
              </div>
            `
          : ""}
      </div>
    `.toString();
  }

  disposers.push(
    delegate(node, "click", "[data-remove]", (event, button) => {
      event.preventDefault();
      account.toggleCompare(button.dataset.remove);
      toast.info("از لیست مقایسه حذف شد");
      render();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-col-add]", (event, button) => {
      event.preventDefault();
      const product = catalogService.getProductById(button.dataset.colAdd);
      if (!product) return;

      const result = cart.add(product.id, 1);
      if (!result.ok) {
        toast.error("افزودن ناموفق بود", product.name);
        return;
      }
      toast.success("به سبد خرید اضافه شد", product.name);
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-add-all]", (event) => {
      event.preventDefault();
      const ids = account
        .compareList()
        .filter((product) => product.stock > 0)
        .map((product) => product.id);

      const result = cart.addMany(ids);
      if (result.added) {
        toast.success(
          "به سبد خرید اضافه شد",
          `${toPersianDigits(result.added)} محصول`,
        );
      }
      if (result.skipped) {
        toast.warn(
          "برخی کالاها اضافه نشدند",
          `${toPersianDigits(result.skipped)} مورد ناموجود بود.`,
        );
      }
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-clear]", async (event) => {
      event.preventDefault();
      const ok = await confirmDialog({
        title: "پاک کردن لیست مقایسه",
        message: "همه محصولات از لیست مقایسه حذف شوند؟",
        confirmLabel: "پاک کن",
        danger: true,
      });
      if (!ok) return;

      account.clearCompare();
      toast.info("لیست مقایسه پاک شد");
      render();
    }),
  );

  render();

  return {
    node,
    title: "مقایسه محصولات",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

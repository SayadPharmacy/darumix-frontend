/**
 * DARUMIX — product detail page.
 *
 * Gallery, variant picker, quantity, add-to-cart, wishlist/compare, tabs
 * (description / specs / reviews), review form, related products and a
 * frequently-bought-together bundle.
 */

import { html, raw, el, qs, delegate, on } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { productArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import { formatPrice, toPersianDigits, formatDate } from "../core/format.js";
import {
  productCard,
  breadcrumbs,
  emptyState,
  ratingStars,
  priceBlock,
  tabs,
  quantityStepper,
  sectionHead,
} from "../ui/components/common.js";
import { toast, modal } from "../ui/components/overlays.js";
import * as catalogService from "../services/catalog.js";
import * as account from "../services/account.js";
import * as cart from "../services/cart.js";

export default async function productPage({ params = {} }) {
  const node = el("div");
  const disposers = [];

  const product = catalogService.getProductBySlug(params.slug);

  /* -------------------------------------------------------------------------
     Not found
     ------------------------------------------------------------------------- */
  if (!product) {
    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "فروشگاه", href: "/catalog" },
            { label: "محصول یافت نشد" },
          ]),
        )}
        <div data-slot="missing" class="mt-8"></div>
      </div>
    `.toString();

    qs('[data-slot="missing"]', node).append(
      emptyState({
        iconName: "search",
        title: "این محصول پیدا نشد",
        text: "مکن است این محصول حذف شده یا نشانی آن تغییر کرده باشد. می‌توانید در فروشگاه جستجو کنید.",
        action: {
          label: "بازگشت به فروشگاه",
          variant: "btn--primary",
          href: "/catalog",
        },
      }).node,
    );

    return { node, title: "محصول یافت نشد", cleanup: () => {} };
  }

  // Record the visit so "recently viewed" stays accurate.
  account.trackView(product.id);

  let quantity = 1;
  let variant = product.variants?.[0] || "بسته استاندارد";
  let activeImage = 0;

  const related = catalogService.related(product, 8);
  const bundle = catalogService.bundleWith(product, 3);
  const myReviews = account.reviewsForProduct(product.id);

  /* -------------------------------------------------------------------------
     Static shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "فروشگاه", href: "/catalog" },
          {
            label: product.categoryTitle,
            href: `/catalog?category=${product.categoryId}`,
          },
          { label: product.name },
        ]),
      )}

      <div class="product-layout">
        <!-- ===================== Media ===================== -->
        <div class="product-media">
          <div
            class="product-media__main glass radius-xl"
            data-slot="main-media"
          >
            ${raw(
              productArt(product, {
                className: "product-art--lg",
                title: product.name,
              }),
            )}
          </div>

          <div class="product-media__thumbs" data-slot="thumbs"></div>

          <div class="product-media__badges">
            ${product.rx
              ? html`<span class="badge badge--info"
                  >${raw(icon("prescription", { size: 14 }))} نیازمند نسخه</span
                >`
              : ""}
            ${product.featured
              ? html`<span class="badge badge--gold"
                  >${raw(icon("crown", { size: 14 }))} محصول ویژه</span
                >`
              : ""}
          </div>
        </div>

        <!-- ===================== Summary ===================== -->
        <div class="product-summary">
          <span class="p-card__brand" data-slot="brand"></span>

          <h1 class="product-summary__title">${product.name}</h1>

          <div class="row row--sm product-summary__meta">
            ${raw(ratingStars(product.rating, { count: product.reviewCount }))}
            <span class="text-soft fs-xs">|</span>
            <span class="fs-xs text-soft"
              >کد کالا: ${toPersianDigits(product.id)}</span
            >
          </div>

          <p class="product-summary__lead">
            ${product.shortDescription || product.description}
          </p>

          <div
            class="glass radius-lg product-summary__price"
            data-slot="price-box"
          ></div>

          <div data-slot="stock"></div>

          <!-- Variants -->
          ${product.variants?.length
            ? html`
                <div class="product-option">
                  <h3 class="product-option__title">انتخاب بسته‌بندی</h3>
                  <div class="chip-row" data-slot="variants"></div>
                </div>
              `
            : ""}

          <!-- Quantity + actions -->
          <div class="product-buy">
            <div data-slot="qty"></div>
            <button
              class="btn btn--primary btn--lg grow"
              type="button"
              data-add
            >
              ${raw(icon("cart", { size: 19 }))}
              <span>افزودن به سبد خرید</span>
            </button>
          </div>

          <div class="row">
            <button class="btn btn--glass grow" type="button" data-wishlist>
              ${raw(icon("heart", { size: 17 }))}
              <span data-wishlist-label>افزودن به علاقه‌مندی</span>
            </button>
            <button class="btn btn--glass grow" type="button" data-compare>
              ${raw(icon("scale", { size: 17 }))}
              <span>مقایسه</span>
            </button>
          </div>

          <!-- Trust tiles -->
          <div class="product-trust">
            <div class="trust-tile">
              ${raw(icon("truck", { size: 17 }))}
              <span>ارسال سریع به سراسر کشور</span>
            </div>
            <div class="trust-tile">
              ${raw(icon("shieldCheck", { size: 17 }))}
              <span>تضمین اصالت و تاریخ انقضا</span>
            </div>
            <div class="trust-tile">
              ${raw(icon("stethoscope", { size: 17 }))}
              <span>مشاوره رایگان داروساز</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== Tabs ===================== -->
      <section class="section">
        <div data-slot="tabs"></div>
        <div data-slot="tab-panel" class="glass radius-xl product-panel"></div>
      </section>

      <!-- ===================== Bundle ===================== -->
      ${bundle.length
        ? html`
            <section class="section">
              <div class="shell">
                ${raw(
                  sectionHead({
                    title: "همراه با این محصول خریداری می‌شود",
                    subtitle: "ترکیبی که مشتریان معمولاً با هم سفارش می‌دهند.",
                    iconName: "gift",
                  }),
                )}
                <div data-slot="bundle"></div>
              </div>
            </section>
          `
        : ""}

      <!-- ===================== Related ===================== -->
      ${related.length
        ? html`
            <section class="section">
              <div class="shell">
                ${raw(
                  sectionHead({
                    title: "محصولات مشابه",
                    subtitle: "گزینه‌های دیگری که ممکن است مناسب شما باشند.",
                    iconName: "layers",
                    actionHref: `/catalog?category=${product.categoryId}`,
                    actionLabel: "همه این دسته",
                  }),
                )}
                <div data-slot="related"></div>
              </div>
            </section>
          `
        : ""}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Decorated slots
     ------------------------------------------------------------------------- */

  qs('[data-slot="brand"]', node).innerHTML = html`
    ساخته ${product.brandName} —
    ${product.subcategoryTitle || product.categoryTitle}
  `.toString();

  qs('[data-slot="price-box"]', node).innerHTML = html`
    ${raw(priceBlock(product, { size: "xl" }))}
    ${product.discount
      ? html`<p class="fs-xs text-success mb-0 mt-2">
          شما
          ${formatPrice((product.compareAt || product.price) - product.price)}
          سود می‌کنید.
        </p>`
      : ""}
  `.toString();

  qs('[data-slot="stock"]', node).innerHTML = html`
    <div class="row mt-4">
      ${product.stock <= 0
        ? html`<span class="badge badge--danger">ناموجود</span>`
        : product.stock <= 12
          ? html`<span class="badge badge--warn"
              >تنها ${toPersianDigits(product.stock)} عدد باقی مانده</span
            >`
          : html`<span class="badge badge--mint"
              >${raw(icon("check", { size: 13 }))} موجود در انبار</span
            >`}
      ${product.rx
        ? html`<span class="fs-xs text-soft"
            >این دارو برای خرید نیازمند نسخه است.</span
          >`
        : ""}
    </div>
  `.toString();

  /* --- Thumbnails: same shape, alternating tones reads as a gallery --- */
  const thumbs = qs('[data-slot="thumbs"]', node);
  const tones = ["emerald", "mint", "teal", "blue", "gold"];
  tones.forEach((tone, index) => {
    const thumb = el("button", {
      class: `product-thumb glass${index === 0 ? " is-active" : ""}`,
      type: "button",
      "data-thumb": String(index),
      "aria-label": `تصویر ${toPersianDigits(index + 1)} از ${product.name}`,
    });
    thumb.innerHTML = productArt(
      { ...product, tone },
      { className: "product-art--sm" },
    );
    thumbs.append(thumb);
  });

  /* --- Variants --- */
  if (product.variants?.length) {
    const variantSlot = qs('[data-slot="variants"]', node);
    product.variants.forEach((entry, index) => {
      const chip = el("button", {
        class: `chip${index === 0 ? " is-active" : ""}`,
        type: "button",
        "data-variant": entry,
        text: entry,
      });
      variantSlot.append(chip);
    });
  }

  /* --- Quantity --- */
  const stepper = quantityStepper({
    value: 1,
    min: 1,
    max: Math.min(20, Math.max(1, product.stock)),
    onChange: (value) => {
      quantity = value;
    },
  });
  qs('[data-slot="qty"]', node).append(stepper.node);
  disposers.push(stepper.cleanup);

  /* --- Bundle --- */
  if (bundle.length) {
    const bundleSlot = qs('[data-slot="bundle"]', node);
    const wrapper = el("div", { class: "bundle glass radius-xl" });

    wrapper.innerHTML = html`
      <div class="bundle__main">
        ${raw(productArt(product, { className: "product-art--sm" }))}
        <span class="bundle__plus" aria-hidden="true"
          >${raw(icon("plus", { size: 16 }))}</span
        >
        ${bundle.map((item) =>
          raw(html`${raw(productArt(item, { className: "product-art--sm" }))}`),
        )}
      </div>
      <div class="bundle__info">
        <h3 class="mb-2">
          بسته پیشنهادی ${toPersianDigits(bundle.length + 1)} محصولی
        </h3>
        <p class="text-muted fs-sm mb-0">
          ${product.name}${bundle.map((item) => `، ${item.name}`).join("")}
        </p>
      </div>
      <button class="btn btn--primary" type="button" data-add-bundle>
        ${raw(icon("cart", { size: 17 }))} افزودن همه به سبد
      </button>
    `.toString();

    bundleSlot.append(wrapper);
  }

  /* --- Related --- */
  if (related.length) {
    const relatedSlot = qs('[data-slot="related"]', node);
    const grid = el("div", { class: "product-grid" });

    related.forEach((item) => {
      const card = productCard(item, {
        onAdd: async (target) => {
          const result = cart.add(target.id, 1);
          if (!result.ok && result.reason === "out-of-stock") {
            toast.error("این محصول موجود نیست", target.name);
          }
          return result;
        },
        actions: {
          onWishlist: (entry, button) => {
            const added = account.toggleWishlist(entry.id);
            button.classList.toggle("is-active", added);
          },
          onCompare: (entry, button) => {
            const result = account.toggleCompare(entry.id);
            if (!result.ok) {
              toast.warn("مقایسه محدود است", result.reason);
              return;
            }
            button.classList.toggle("is-active", result.added);
          },
        },
      });
      grid.append(card.node);
      disposers.push(card.cleanup);
    });

    relatedSlot.append(grid);
  }

  /* -------------------------------------------------------------------------
     Tabs: description / specs / reviews
     ------------------------------------------------------------------------- */

  function renderDescription() {
    return html`
      <div class="prose">
        <p>${product.description}</p>
        ${(product.tags || []).length
          ? html`
              <h3>برچسب‌ها</h3>
              <div class="chip-row">
                ${product.tags.map((tag) =>
                  raw(
                    html`<a class="chip" href="${to("/catalog", { q: tag })}"
                      >${tag}</a
                    >`,
                  ),
                )}
              </div>
            `
          : ""}
        <h3>نکات مهم مصرف</h3>
        <ul>
          <li>
            دستور مصرف را از داروساز یا پزشک خود بپرسید و از مصرف خودسرانه پرهیز
            کنید.
          </li>
          <li>
            در صورت بارداری، شیردهی یا مصرف داروهای دیگر، پیش از مصرف با داروساز
            مشورت کنید.
          </li>
          <li>دارو را در دمای مناسب و دور از دسترس کودکان نگهداری کنید.</li>
        </ul>
      </div>
    `.toString();
  }

  function renderSpecs() {
    const specs = product.specs || [];

    if (!specs.length) {
      return html`<p class="text-muted mb-0">
        مشخصات فنی برای این محصول ثبت نشده است.
      </p>`.toString();
    }

    return html`
      <div class="table-wrap">
        <table class="table">
          <tbody>
            ${specs.map((spec) =>
              raw(html`
                <tr>
                  <th scope="row" style="width:220">
                    ${spec.label || spec.key}
                  </th>
                  <td>${spec.value}</td>
                </tr>
              `),
            )}
          </tbody>
        </table>
      </div>
    `.toString();
  }

  function reviewCard(review) {
    const tone =
      review.rating >= 4 ? "mint" : review.rating >= 3 ? "warn" : "danger";
    return html`
      <article class="review glass radius-lg">
        <div class="review__head">
          <div>
            <span class="fw-bold">${review.author}</span>
            ${review.verified
              ? html`<span class="badge badge--mint"
                  >${raw(icon("check", { size: 12 }))} خرید تأییدشده</span
                >`
              : ""}
          </div>
          <span class="fs-xs text-soft">${formatDate(review.date)}</span>
        </div>
        ${raw(ratingStars(review.rating, { showValue: false }))}
        ${review.title
          ? html`<h4 class="review__title">${review.title}</h4>`
          : ""}
        <p class="review__text mb-0">${review.text}</p>
        <span class="badge badge--${tone} mt-3"
          >امتیاز ${toPersianDigits(review.rating)} از ۵</span
        >
      </article>
    `.toString();
  }

  function renderReviews() {
    // Seeded reviews come from the fixture slice on the product record.
    const seeded = product.reviews || [];
    const all = [...myReviews, ...seeded];

    return html`
      <div class="reviews-layout">
        <div>
          <div class="row row--between mb-4">
            <h3 class="mb-0">نظرات کاربران ${toPersianDigits(all.length)}</h3>
            <button
              class="btn btn--glass btn--sm"
              type="button"
              data-write-review
            >
              ${raw(icon("edit", { size: 15 }))} نوشتن نظر
            </button>
          </div>

          ${all.length
            ? html`<div class="stack">
                ${all.map((review) => raw(reviewCard(review)))}
              </div>`
            : html`<p class="text-muted">
                هنوز نظری برای این محصول ثبت نشده است.
              </p>`}
        </div>

        <aside class="glass radius-xl review-summary">
          <h3 class="mb-4">امتیاز کلی</h3>
          <div class="review-summary__score">
            ${toPersianDigits(product.rating.toFixed(1))}
          </div>
          ${raw(ratingStars(product.rating, { showValue: false, size: 20 }))}
          <p class="text-soft fs-xs mt-2">
            از ${toPersianDigits(product.reviewCount)} نظر
          </p>
          ${[5, 4, 3, 2, 1].map((score) => {
            const share =
              score === Math.round(product.rating)
                ? 52
                : score === Math.round(product.rating) - 1
                  ? 24
                  : 8;
            return raw(html`
              <div class="review-summary__bar">
                <span class="fs-xs">${toPersianDigits(score)}</span>
                <div class="meter">
                  <div class="meter__fill" style="width:${share}%"></div>
                </div>
                <span class="fs-xs text-soft">${toPersianDigits(share)}٪</span>
              </div>
            `);
          })}
        </aside>
      </div>
    `.toString();
  }

  /* --- Tab bar --- */
  const panel = qs('[data-slot="tab-panel"]', node);
  const tabItems = [
    { id: "description", label: "توضیحات", icon: "file" },
    {
      id: "specs",
      label: "مشخصات",
      icon: "clipboard",
      count: (product.specs || []).length,
    },
    { id: "reviews", label: "نظرات", icon: "star", count: product.reviewCount },
  ];

  const renderPanel = (id) => {
    panel.innerHTML =
      id === "specs"
        ? renderSpecs()
        : id === "reviews"
          ? renderReviews()
          : renderDescription();
  };

  const tabBar = tabs({
    items: tabItems,
    active: "description",
    onChange: renderPanel,
  });

  qs('[data-slot="tabs"]', node).append(tabBar.node);
  disposers.push(tabBar.cleanup);
  renderPanel("description");

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  const wishlistButton = qs("[data-wishlist]", node);
  const syncWishlist = () => {
    const active = account.inWishlist(product.id);
    wishlistButton.classList.toggle("is-active", active);
    qs("[data-wishlist-label]", node).textContent = active
      ? "در علاقه‌مندی‌ها"
      : "افزودن به علاقه‌مندی";
  };
  syncWishlist();

  disposers.push(
    on(wishlistButton, "click", (event) => {
      event.preventDefault();
      account.toggleWishlist(product.id);
      syncWishlist();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-compare]", (event) => {
      event.preventDefault();
      const result = account.toggleCompare(product.id);
      if (!result.ok) {
        toast.warn("مقایسه محدود است", result.reason);
        return;
      }
      toast.success(
        result.added ? "به لیست مقایسه اضافه شد" : "از لیست مقایسه حذف شد",
        "برای مشاهده به صفحه مقایسه بروید.",
      );
    }),
  );

  /* Variant picker */
  disposers.push(
    delegate(node, "click", "[data-variant]", (event, button) => {
      event.preventDefault();
      const value = button.dataset.variant;
      if (!value) return;

      variant = value;
      const container = button.parentElement;
      container
        ?.querySelectorAll("[data-variant]")
        .forEach((entry) =>
          entry.classList.toggle("is-active", entry === button),
        );
    }),
  );

  /* Gallery thumbnails */
  disposers.push(
    delegate(node, "click", "[data-thumb]", (event, button) => {
      event.preventDefault();
      activeImage = Number(button.dataset.thumb);
      const tone = tones[activeImage] || "emerald";

      qs('[data-slot="main-media"]', node).innerHTML = productArt(
        { ...product, tone },
        { className: "product-art--lg", title: product.name },
      );

      button.parentElement
        ?.querySelectorAll("[data-thumb]")
        .forEach((entry) =>
          entry.classList.toggle("is-active", entry === button),
        );
    }),
  );

  /* Add to cart */
  async function handleAdd() {
    if (product.stock <= 0) {
      toast.error("این محصول موجود نیست", product.name);
      return;
    }

    const button = qs("[data-add]", node);
    button.classList.add("is-busy");

    const result = cart.add(product.id, quantity, variant);

    button.classList.remove("is-busy");

    if (!result.ok) {
      toast.error(
        result.reason === "max-reached"
          ? "بیشتر از این موجود نیست"
          : "افزودن ناموفق بود",
        product.name,
      );
      return;
    }

    // The shell already raises the "added" toast via the event bus; this just
    // confirms the exact quantity that landed in the basket.
    toast.success(
      "به سبد خرید اضافه شد",
      `${product.name} — ${toPersianDigits(quantity)} عدد`,
    );
  }

  disposers.push(
    delegate(node, "click", "[data-add]", (event) => {
      event.preventDefault();
      handleAdd();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-add-bundle]", async (event, button) => {
      event.preventDefault();
      button.classList.add("is-busy");

      cart.add(product.id, 1, variant);
      bundle.forEach((item) => cart.add(item.id, 1));

      button.classList.remove("is-busy");
      toast.success(
        "بسته به سبد خرید اضافه شد",
        `${toPersianDigits(bundle.length + 1)} محصول`,
      );
    }),
  );

  /* Review modal */
  disposers.push(
    delegate(node, "click", "[data-write-review]", async (event) => {
      event.preventDefault();

      const dialog = modal({
        title: "نوشتن نظر",
        subtitle: product.name,
        size: "md",
        body: html`
          <form class="stack" data-review-form novalidate>
            <div class="field">
              <label class="field__label" for="review-rating">امتیاز شما</label>
              <select class="select" id="review-rating" name="rating">
                <option value="5">۵ — عالی</option>
                <option value="4">۴ — خوب</option>
                <option value="3">۳ — متوسط</option>
                <option value="2">۲ — ضعیف</option>
                <option value="1">۱ — نامناسب</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="review-title">عنوان نظر</label>
              <input
                class="input"
                id="review-title"
                name="title"
                placeholder="مثلاً: کیفیت خوبی داشت"
              />
            </div>
            <div class="field">
              <label class="field__label" for="review-text"
                >متن نظر <span class="field__required">*</span></label
              >
              <textarea
                class="textarea"
                id="review-text"
                name="text"
                rows="4"
                placeholder="تجربه خود از این محصول را بنویسید…"
              ></textarea>
              <span class="field__error" data-error hidden></span>
            </div>
          </form>
        `,
        footer:
          `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
          `<button class="btn btn--primary" type="button" data-submit-review>ثبت نظر</button>`,
      });

      dialog.open();

      dialog.node.addEventListener("click", (clickEvent) => {
        if (!clickEvent.target.closest("[data-submit-review]")) return;

        const form = qs("[data-review-form]", dialog.node);
        const text = qs("[name='text']", form)?.value.trim() || "";
        const errorSlot = qs("[data-error]", form);

        if (text.length < 10) {
          errorSlot.hidden = false;
          errorSlot.textContent = "متن نظر باید حداقل ۱۰ کاراکتر باشد.";
          return;
        }

        account.addReview({
          productId: product.id,
          productName: product.name,
          rating: Number(qs("[name='rating']", form)?.value) || 5,
          title: qs("[name='title']", form)?.value.trim() || "",
          text,
        });

        dialog.close();
        toast.success(
          "نظر شما ثبت شد",
          "پس از بررسی، نظر شما نمایش داده می‌شود.",
        );
        renderPanel("reviews");
      });
    }),
  );

  return {
    node,
    title: product.name,
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

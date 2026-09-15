/**
 * DARUMIX — categories page.
 *
 * Two modes on one route:
 *   /categories              → group + category grid
 *   /category/:id            → one category with its subcategories and products
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { brandArt } from "../ui/product-art.js";
import { to, navigate } from "../core/router.js";
import { toPersianDigits, formatPrice } from "../core/format.js";
import {
  productCard,
  breadcrumbs,
  emptyState,
  pageIntro,
  sectionHead,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import * as catalogService from "../services/catalog.js";
import * as account from "../services/account.js";
import * as cart from "../services/cart.js";

/** Shared card actions so every grid on this page behaves the same way. */
function cardHandlers() {
  return {
    onAdd: async (product) => {
      const result = cart.add(product.id, 1);
      if (!result.ok && result.reason === "out-of-stock") {
        toast.error("این محصول موجود نیست", product.name);
      }
      return result;
    },
    actions: {
      onWishlist: (product, button) => {
        const added = account.toggleWishlist(product.id);
        button.classList.toggle("is-active", added);
        button.setAttribute("aria-pressed", String(added));
      },
      onCompare: (product, button) => {
        const result = account.toggleCompare(product.id);
        if (!result.ok) {
          toast.warn("مقایسه محدود است", result.reason);
          return;
        }
        button.classList.toggle("is-active", result.added);
      },
    },
  };
}

/** Grid of product cards; returns the node plus its disposers. */
function productGrid(products) {
  const grid = el("div", { class: "product-grid" });
  const disposers = [];

  products.forEach((product) => {
    const card = productCard(product, cardHandlers());
    grid.append(card.node);
    disposers.push(card.cleanup);
  });

  return { node: grid, disposers };
}

/** Category tile used on the index view. */
function categoryTile(category) {
  const node = el("a", {
    class: "category-card glass radius-xl",
    href: to(`/category/${category.id}`),
  });

  node.innerHTML = html`
    <span class="category-card__icon"
      >${raw(icon(category.icon, { size: 30 }))}</span
    >
    <h3 class="category-card__name">${category.title}</h3>
    <span class="category-card__count"
      >${toPersianDigits(category.productCount)} محصول</span
    >
    <span class="category-card__subs">
      ${(category.subcategories || [])
        .slice(0, 3)
        .map((sub) =>
          raw(html`<span class="category-card__sub">${sub.title}</span>`),
        )}
    </span>
  `.toString();

  return node;
}

export default async function categoriesPage({ params = {} }) {
  const node = el("div");
  const disposers = [];

  const categoryId = params.id || "";
  const category = categoryId
    ? catalogService.getCategoryById(categoryId)
    : null;

  /* =========================================================================
     Single category: /category/:id
     ========================================================================= */
  if (categoryId && category) {
    const products = catalogService
      .allProducts()
      .filter((product) => product.categoryId === category.id);

    const subcategories = category.subcategories || [];
    const grid = productGrid(products);
    disposers.push(...grid.disposers);

    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "دسته‌بندی‌ها", href: "/categories" },
            { label: category.title },
          ]),
        )}

        <header class="page-intro">
          <div class="row">
            <span class="category-card__icon"
              >${raw(icon(category.icon, { size: 30 }))}</span
            >
            <div>
              <h1 class="page-intro__title">${category.title}</h1>
              <p class="page-intro__text">${category.description}</p>
            </div>
          </div>
        </header>

        <div class="catalog-toolbar glass radius-lg">
          <span
            >${toPersianDigits(products.length)} محصول در این دسته‌بندی</span
          >
          <a
            class="btn btn--glass btn--sm"
            href="${to("/catalog", { category: category.id })}"
          >
            ${raw(icon("filter", { size: 15 }))} فیلتر و مرتب‌سازی
          </a>
        </div>

        ${subcategories.length
          ? html`
              <div class="chip-row mt-4" data-slot="subs">
                <span class="fs-xs text-soft">زیرشاخه‌ها:</span>
                ${subcategories.map((sub) =>
                  raw(
                    html`<a
                      class="chip"
                      href="${to("/catalog", {
                        category: category.id,
                        sub: sub.id,
                      })}"
                      >${sub.title}</a
                    >`,
                  ),
                )}
              </div>
            `
          : ""}

        <div class="mt-6" data-slot="grid"></div>
      </div>
    `.toString();

    qs('[data-slot="grid"]', node).append(
      products.length
        ? grid.node
        : emptyState({
            iconName: "package",
            title: "این دسته هنوز محصولی ندارد",
            text: "به‌زودی محصولات این دسته‌بندی اضافه می‌شوند. تا آن زمان می‌توانید فروشگاه را ببینید.",
            action: {
              label: "مشاهده فروشگاه",
              variant: "btn--primary",
              href: "/catalog",
            },
          }).node,
    );

    return {
      node,
      title: category.title,
      cleanup: () => disposers.forEach((dispose) => dispose()),
    };
  }

  /* =========================================================================
     Index: /categories
     ========================================================================= */
  const groups = catalogService.groupsWithCounts();
  const brands = catalogService.allBrands().filter((brand) => brand.featured);
  const popular = catalogService.popular(4);

  const popularGrid = productGrid(popular);
  disposers.push(...popularGrid.disposers);

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([{ label: "خانه", href: "/" }, { label: "دسته‌بندی‌ها" }]),
      )}
      ${raw(
        pageIntro({
          title: "دسته‌بندی محصولات",
          text: "همه محصولات دارومیکس در گروه‌های اصلی دارو، مکمل، مراقبت شخصی و تجهیزات پزشکی دسته‌بندی شده‌اند.",
        }),
      )}

      <div data-slot="groups"></div>

      <section class="section">
        ${raw(
          sectionHead({
            title: "برندهای منتخب",
            subtitle: "برای مشاهده محصولات هر برند روی آن بزنید.",
            iconName: "verified",
            actionHref: "/catalog",
            actionLabel: "همه برندها",
          }),
        )}
        <div class="auto-grid auto-grid--tight" data-slot="brands"></div>
      </section>

      <section class="section">
        ${raw(
          sectionHead({
            title: "پرفروش‌ترین‌ها",
            subtitle: "انتخاب بیشترین تعداد مشتریان دارومیکس.",
            iconName: "trendingUp",
            actionHref: "/catalog?sort=popular",
            actionLabel: "مشاهده بیشتر",
          }),
        )}
        <div data-slot="popular"></div>
      </section>
    </div>
  `.toString();

  /* --- Groups, each with its categories --- */
  const groupsSlot = qs('[data-slot="groups"]', node);

  groups.forEach((group) => {
    const section = el("section", { class: "section" });
    section.innerHTML = html`
      ${raw(
        sectionHead({
          title: group.title,
          subtitle: group.description,
          iconName: group.icon,
        }),
      )}
      <div class="auto-grid auto-grid--tight" data-slot="grid"></div>
    `.toString();

    const gridSlot = qs('[data-slot="grid"]', section);
    group.categories.forEach((entry) =>
      gridSlot.append(
        categoryTile({
          ...entry,
          productCount: catalogService.categoryCounts()[entry.id] || 0,
        }),
      ),
    );

    groupsSlot.append(section);
  });

  /* --- Brands --- */
  const brandsSlot = qs('[data-slot="brands"]', node);
  brands.forEach((brand) => {
    const tile = el("a", {
      class: "brand-tile glass radius-lg",
      href: to("/catalog", { brand: brand.id }),
    });
    tile.innerHTML = html`
      ${raw(brandArt(brand))}
      <span>${brand.name}</span>
      <span class="fs-xs text-soft">${brand.country}</span>
    `.toString();
    brandsSlot.append(tile);
  });

  /* --- Popular --- */
  qs('[data-slot="popular"]', node).append(popularGrid.node);

  /* --- Give the group links an accessible "see all" affordance --- */
  const groupLinks = el("div", { class: "row mt-4" });
  groupLinks.innerHTML = html`
    <a class="btn btn--glass btn--sm" href="${to("/catalog")}">
      ${raw(icon("grid", { size: 16 }))} مشاهده همه محصولات
    </a>
    <button class="btn btn--ghost btn--sm" type="button" data-price-range>
      بازه قیمت:
      ${formatPrice(catalogService.priceBounds().min, { withUnit: false })} تا
      ${formatPrice(catalogService.priceBounds().max, { withUnit: false })}
      تومان
    </button>
  `.toString();
  groupsSlot.append(groupLinks);

  disposers.push(
    delegate(node, "click", "[data-price-range]", (event) => {
      event.preventDefault();
      navigate("/catalog");
    }),
  );

  return {
    node,
    title: "دسته‌بندی‌ها",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

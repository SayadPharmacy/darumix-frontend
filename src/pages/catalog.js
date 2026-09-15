/**
 * DARUMIX — catalog page.
 *
 * Filter state lives in the URL, so a filtered view is shareable, survives a
 * reload and works with the back button. Every control writes to the URL and
 * re-reads from it — there is no second source of truth to keep in sync.
 */

import { html, raw, el, qs, qsa, delegate, on, debounce } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to, navigate, parseLocation, updateQuery } from "../core/router.js";
import { toPersianDigits, formatPrice } from "../core/format.js";
import {
  productCard,
  productRow,
  breadcrumbs,
  emptyState,
  productSkeletonGrid,
  pagination,
  sectionHead,
} from "../ui/components/common.js";
import { drawer } from "../ui/components/shell.js";
import { toast } from "../ui/components/overlays.js";
import * as catalogService from "../services/catalog.js";
import * as account from "../services/account.js";
import * as cart from "../services/cart.js";

export default async function catalogPage({ query = {} }) {
  const node = el("div");
  const disposers = [];

  const allProducts = catalogService.allProducts();
  const filters = catalogService.parseFilters(query);
  const bounds = catalogService.priceBounds();
  const facets = catalogService.facetCounts();

  /* -------------------------------------------------------------------------
     Shared add / wishlist / compare handlers
     ------------------------------------------------------------------------- */

  const cardActions = (product) => ({
    onWishlist: (item, button) => {
      const added = account.toggleWishlist(item.id);
      button.classList.toggle("is-active", added);
      button.setAttribute("aria-pressed", String(added));
    },
    onCompare: (item, button) => {
      const result = account.toggleCompare(item.id);
      if (!result.ok) {
        toast.warn("مقایسه محدود است", result.reason);
        return;
      }
      button.classList.toggle("is-active", result.added);
    },
  });

  const handleAdd = async (product) => {
    const result = cart.add(product.id, 1);
    if (!result.ok && result.reason === "out-of-stock") {
      toast.error("این محصول موجود نیست", product.name);
    }
    return result;
  };

  /* -------------------------------------------------------------------------
     Static shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(breadcrumbs([{ label: "خانه", href: "/" }, { label: "فروشگاه" }]))}

      <header class="page-intro">
        <h1 class="page-intro__title">فروشگاه دارومیکس</h1>
        <p class="page-intro__text">
          ${toPersianDigits(allProducts.length)} محصول سلامت در دسته‌بندی‌های
          دارو، مکمل، مراقبت پوست، مادر و کودک و تجهیزات پزشکی. با فیلترها
          دقیقاً همان چیزی را پیدا کنید که لازم دارید.
        </p>
      </header>

      <div class="catalog-layout">
        <aside
          class="catalog-aside"
          data-slot="sidebar"
          aria-label="فیلترها"
        ></aside>

        <div>
          <div class="catalog-toolbar glass radius-lg">
            <div class="catalog-toolbar__count" data-slot="count"></div>

            <div class="catalog-toolbar__end">
              <button
                class="btn btn--glass btn--sm hide-desktop"
                type="button"
                data-open-filters
              >
                ${raw(icon("filter", { size: 16 }))} فیلترها
                <span class="badge badge--brand" data-slot="filter-count" hidden
                  >۰</span
                >
              </button>

              <label class="visually-hidden" for="catalog-sort"
                >ترتیب نمایش</label
              >
              <select
                class="select"
                id="catalog-sort"
                data-sort
                style="min-width:150px"
              >
                ${catalogService.SORT_OPTIONS.map((option) =>
                  raw(
                    html`<option
                      value="${option.id}"
                      ${option.id === filters.sort ? "selected" : ""}
                    >
                      ${option.label}
                    </option>`,
                  ),
                )}
              </select>

              <div
                class="btn-group hide-mobile"
                role="group"
                aria-label="حالت نمایش"
              >
                <button
                  class="btn-group__item ${filters.view === "grid"
                    ? "is-active"
                    : ""}"
                  type="button"
                  data-view="grid"
                  aria-label="نمایش شبکه‌ای"
                >
                  ${raw(icon("grid", { size: 16 }))}
                </button>
                <button
                  class="btn-group__item ${filters.view === "list"
                    ? "is-active"
                    : ""}"
                  type="button"
                  data-view="list"
                  aria-label="نمایش فهرستی"
                >
                  ${raw(icon("menu", { size: 16 }))}
                </button>
              </div>
            </div>
          </div>

          <div class="active-filters" data-slot="active-filters"></div>
          <div data-slot="results"></div>
          <div data-slot="pagination"></div>
        </div>
      </div>
    </div>
  `.toString();

  const sidebarSlot = qs('[data-slot="sidebar"]', node);
  const resultsSlot = qs('[data-slot="results"]', node);
  const paginationSlot = qs('[data-slot="pagination"]', node);
  const countSlot = qs('[data-slot="count"]', node);
  const activeFiltersSlot = qs('[data-slot="active-filters"]', node);
  const filterCountSlot = qs('[data-slot="filter-count"]', node);

  /* -------------------------------------------------------------------------
     Filter controls — built once, shared between sidebar and mobile drawer
     ------------------------------------------------------------------------- */

  function buildFilterPanel() {
    const wrapper = el("div", { class: "stack" });

    /* --- Search --- */
    const searchGroup = el("div", { class: "filter-group glass radius-lg" });
    searchGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("search", { size: 17 }))} جستجو
        </h3>
      </div>
      <div class="input-icon">
        ${raw(icon("search", { size: 17 }))}
        <input
          class="input"
          type="search"
          placeholder="نام محصول یا برند…"
          value="${filters.q}"
          data-filter="q"
          aria-label="جستجو در محصولات"
        />
      </div>
    `.toString();
    wrapper.append(searchGroup);

    /* --- Categories --- */
    const categoryGroup = el("div", { class: "filter-group glass radius-lg" });
    categoryGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("layers", { size: 17 }))} دسته‌بندی
        </h3>
        ${filters.categories.length
          ? raw(
              html`<button
                class="filter-group__reset"
                type="button"
                data-reset="category"
              >
                پاک کردن
              </button>`,
            )
          : ""}
      </div>
      <div class="filter-list">
        ${catalogService
          .categoriesWithCounts()
          .filter((category) => category.productCount > 0)
          .map((category) => {
            const checked = filters.categories.includes(category.id);
            const subcats = category.subcategories || [];

            return raw(html`
              <div>
                <label class="check">
                  <input
                    type="checkbox"
                    data-filter="category"
                    value="${category.id}"
                    ${checked ? "checked" : ""}
                  />
                  <span class="check__box"
                    >${raw(icon("check", { size: 13 }))}</span
                  >
                  <span class="check__text">
                    ${category.title}
                    <span class="check__meta"
                      >${toPersianDigits(category.productCount)} محصول</span
                    >
                  </span>
                </label>

                ${checked && subcats.length
                  ? html`
                      <div
                        class="stack stack--sm"
                        style="padding-inline-start:32px;margin-top:10px"
                      >
                        ${subcats.map((sub) =>
                          raw(html`
                            <label class="check">
                              <input
                                type="checkbox"
                                data-filter="sub"
                                value="${sub.id}"
                                ${filters.subcategories.includes(sub.id)
                                  ? "checked"
                                  : ""}
                              />
                              <span class="check__box"
                                >${raw(icon("check", { size: 12 }))}</span
                              >
                              <span class="check__text fs-sm"
                                >${sub.title}</span
                              >
                            </label>
                          `),
                        )}
                      </div>
                    `
                  : ""}
              </div>
            `);
          })}
      </div>
    `.toString();
    wrapper.append(categoryGroup);

    /* --- Price --- */
    const priceGroup = el("div", { class: "filter-group glass radius-lg" });
    priceGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("currency", { size: 17 }))} محدوده قیمت
        </h3>
      </div>

      <div class="stack stack--sm">
        <input
          class="range"
          type="range"
          min="${bounds.min}"
          max="${bounds.max}"
          step="10000"
          value="${filters.maxPrice}"
          data-filter="max"
          aria-label="حداکثر قیمت"
        />
        <div class="price-inputs">
          <label class="visually-hidden" for="price-min">از قیمت</label>
          <input
            class="input"
            id="price-min"
            type="number"
            inputmode="numeric"
            min="${bounds.min}"
            max="${bounds.max}"
            value="${filters.minPrice}"
            data-filter="min"
          />

          <span class="text-soft">—</span>

          <label class="visually-hidden" for="price-max">تا قیمت</label>
          <input
            class="input"
            id="price-max"
            type="number"
            inputmode="numeric"
            min="${bounds.min}"
            max="${bounds.max}"
            value="${filters.maxPrice}"
            data-filter="max-number"
          />
        </div>
        <p class="fs-xs text-soft mb-0">
          بازه قیمت: ${formatPrice(bounds.min)} تا ${formatPrice(bounds.max)}
        </p>
      </div>
    `.toString();
    wrapper.append(priceGroup);

    /* --- Brands --- */
    const brandGroup = el("div", { class: "filter-group glass radius-lg" });
    const brandsWithProducts = catalogService
      .allBrands()
      .filter((brand) => (facets.byBrand.get(brand.id) || 0) > 0);

    brandGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("verified", { size: 17 }))} برند
        </h3>
        ${filters.brands.length
          ? raw(
              html`<button
                class="filter-group__reset"
                type="button"
                data-reset="brand"
              >
                پاک کردن
              </button>`,
            )
          : ""}
      </div>
      <div class="filter-list">
        ${brandsWithProducts.map((brand) =>
          raw(html`
            <label class="check">
              <input
                type="checkbox"
                data-filter="brand"
                value="${brand.id}"
                ${filters.brands.includes(brand.id) ? "checked" : ""}
              />
              <span class="check__box"
                >${raw(icon("check", { size: 13 }))}</span
              >
              <span class="check__text">
                ${brand.name}
                <span class="check__meta"
                  >${toPersianDigits(facets.byBrand.get(brand.id) || 0)}
                  محصول</span
                >
              </span>
            </label>
          `),
        )}
      </div>
    `.toString();
    wrapper.append(brandGroup);

    /* --- Rating --- */
    const ratingGroup = el("div", { class: "filter-group glass radius-lg" });
    ratingGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("star", { size: 17 }))} امتیاز
        </h3>
      </div>
      <div class="stack stack--sm">
        ${[0, 3, 4, 4.5].map((value) =>
          raw(html`
            <label class="check check--radio">
              <input
                type="radio"
                name="minRating"
                data-filter="rating"
                value="${value}"
                ${filters.minRating === value ? "checked" : ""}
              />
              <span class="check__box"></span>
              <span class="check__text"
                >${value === 0
                  ? "همه امتیازها"
                  : `${toPersianDigits(value)} ستاره و بالاتر`}</span
              >
            </label>
          `),
        )}
      </div>
    `.toString();
    wrapper.append(ratingGroup);

    /* --- Toggles --- */
    const toggleGroup = el("div", { class: "filter-group glass radius-lg" });
    toggleGroup.innerHTML = html`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${raw(icon("sliders", { size: 17 }))} فیلترهای سریع
        </h3>
      </div>
      <div class="stack">
        <label class="switch">
          <input
            type="checkbox"
            data-filter="stock"
            ${filters.inStockOnly ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>فقط کالای موجود</span>
        </label>
        <label class="switch">
          <input
            type="checkbox"
            data-filter="sale"
            ${filters.onSaleOnly ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>فقط کالاهای تخفیف‌دار</span>
        </label>
      </div>
    `.toString();
    wrapper.append(toggleGroup);

    /* --- Reset all --- */
    const resetAll = el("button", {
      class: "btn btn--glass btn--block",
      type: "button",
      "data-reset-all": "",
    });
    resetAll.innerHTML = html`${raw(icon("rotate", { size: 16 }))} حذف همه
    فیلترها`.toString();
    wrapper.append(resetAll);

    return wrapper;
  }

  /* -------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------- */

  function renderActiveFilters(current) {
    const chips = [];

    if (current.q) {
      chips.push({ label: `جستجو: ${current.q}`, clear: { q: null } });
    }

    current.categories.forEach((id) => {
      const category = catalogService.getCategoryById(id);
      if (category)
        chips.push({
          label: category.title,
          clear: {
            category: current.categories
              .filter((item) => item !== id)
              .join(","),
          },
        });
    });

    current.subcategories.forEach((id) => {
      const list = catalogService.subcategoriesOf(current.categories[0] || "");
      const sub = list.find((item) => item.id === id);
      if (sub)
        chips.push({
          label: sub.title,
          clear: {
            sub: current.subcategories.filter((item) => item !== id).join(","),
          },
        });
    });

    current.brands.forEach((id) => {
      const brand = catalogService.getBrandById(id);
      if (brand)
        chips.push({
          label: brand.name,
          clear: {
            brand: current.brands.filter((item) => item !== id).join(","),
          },
        });
    });

    if (current.inStockOnly)
      chips.push({ label: "فقط موجود", clear: { stock: null } });
    if (current.onSaleOnly)
      chips.push({ label: "فقط تخفیف‌دار", clear: { sale: null } });
    if (current.minRating > 0)
      chips.push({
        label: `امتیاز ${toPersianDigits(current.minRating)}+`,
        clear: { rating: null },
      });

    if (current.minPrice > bounds.min || current.maxPrice < bounds.max) {
      chips.push({
        label: `قیمت ${formatPrice(current.minPrice, { withUnit: false })} تا ${formatPrice(current.maxPrice, { withUnit: false })}`,
        clear: { min: null, max: null },
      });
    }

    if (!chips.length) {
      activeFiltersSlot.innerHTML = "";
      return;
    }

    activeFiltersSlot.innerHTML = html`
      <span class="fs-xs text-soft">فیلترهای فعال:</span>
      ${chips.map((chip) =>
        raw(html`
          <button
            class="chip is-active"
            type="button"
            data-clear="${JSON.stringify(chip.clear).replace(/"/g, "&quot;")}"
          >
            ${chip.label}
            <span class="chip__remove"
              >${raw(icon("close", { size: 11 }))}</span
            >
          </button>
        `),
      )}
      <button
        class="btn btn--ghost btn--xs text-danger"
        type="button"
        data-reset-all
      >
        حذف همه
      </button>
    `.toString();
  }

  function renderResults(current) {
    const result = catalogService.list(current);

    // Keep the URL honest when an out-of-range page was requested.
    if (result.total > 0 && current.page > result.pages) {
      navigate("/catalog", { ...query, page: result.pages }, { replace: true });
    }

    countSlot.innerHTML = html`
      ${result.total > 0
        ? html`نمایش
            <strong
              >${toPersianDigits(
                (result.page - 1) * result.perPage + 1,
              )}</strong
            >
            تا
            <strong
              >${toPersianDigits(
                Math.min(result.page * result.perPage, result.total),
              )}</strong
            >
            از <strong>${toPersianDigits(result.total)}</strong> محصول`
        : "محصولی مطابق فیلترها یافت نشد"}
    `.toString();

    if (result.total === 0) {
      resultsSlot.innerHTML = "";
      const empty = emptyState({
        iconName: "search",
        title: "محصولی با این مشخصات پیدا نشد",
        text: catalogService.hasActiveFilters(current)
          ? "فیلترها را تغییر دهید یا همه آن‌ها را حذف کنید تا نتایج بیشتری ببینید."
          : "به نظر می‌رسد این بخش هنوز محصولی ندارد.",
        action: catalogService.hasActiveFilters(current)
          ? {
              label: "حذف همه فیلترها",
              variant: "btn--primary",
              onClick: () => navigate("/catalog", {}),
            }
          : { label: "بازگشت به خانه", variant: "btn--primary", href: "/" },
      });
      resultsSlot.append(empty.node);
      paginationSlot.innerHTML = "";
      return;
    }

    if (current.view === "list") {
      const list = el("div", { class: "stack" });
      result.items.forEach((product) => {
        const row = productRow(product, {
          metaContent: html`
            <div class="row row--sm mt-2">
              ${raw(icon("checkCircle", { size: 14 }))}
              <span class="fs-xs text-soft"
                >${product.categoryTitle}${product.subcategoryTitle
                  ? ` · ${product.subcategoryTitle}`
                  : ""}</span
              >
            </div>
          `,
          endContent: html`
            <div class="stack stack--sm" style="justify-items:end">
              ${raw(
                html`<span class="price">
                  <span class="price__now"
                    >${formatPrice(product.price, { withUnit: false })}</span
                  >
                  <span class="price__unit">تومان</span>
                  ${product.discount
                    ? html`<span class="price__off"
                        >${toPersianDigits(product.discount)}٪</span
                      >`
                    : ""}
                </span>`,
              )}
              <div class="row row--sm">
                <button
                  class="btn btn--glass btn--sm"
                  type="button"
                  data-row-wishlist="${product.id}"
                >
                  ${raw(icon("heart", { size: 15 }))} علاقه‌مندی
                </button>
                <button
                  class="btn btn--primary btn--sm"
                  type="button"
                  data-row-add="${product.id}"
                  ${product.stock <= 0 ? "disabled" : ""}
                >
                  ${raw(icon("cart", { size: 15 }))}
                  ${product.stock <= 0 ? "ناموجود" : "افزودن"}
                </button>
              </div>
            </div>
          `,
        });
        list.append(row.node);
      });
      resultsSlot.innerHTML = "";
      resultsSlot.append(list);
    } else {
      const grid = el("div", { class: "product-grid" });
      result.items.forEach((product) => {
        grid.append(
          productCard(product, {
            onAdd: handleAdd,
            actions: cardActions(product),
          }).node,
        );
      });
      resultsSlot.innerHTML = "";
      resultsSlot.append(grid);
    }

    /* --- Pagination --- */
    paginationSlot.innerHTML = "";
    if (result.pages > 1) {
      const pager = pagination({
        page: result.page,
        pages: result.pages,
        onChange: (page) => {
          updateQuery({ page: String(page) }, { resetPage: false });
          scrollToResults();
        },
      });
      paginationSlot.append(pager.node);
      disposers.push(pager.cleanup);
    }
  }

  function scrollToResults() {
    const target = qs(".catalog-toolbar", node);
    if (target) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  /** Update one query parameter and let the router re-render this page. */
  function applyQuery(patch, options = {}) {
    updateQuery(patch, options);
  }

  function toggleListValue(key, value, checked) {
    const current = filters[key];
    const next = checked
      ? [...current, value]
      : current.filter((item) => item !== value);
    applyQuery({ [key]: next.join(",") });
  }

  /* -------------------------------------------------------------------------
     Mount sidebar + mobile filter drawer
     ------------------------------------------------------------------------- */

  // The sidebar is the only filter panel that is actually on screen: the mobile
  // drawer is display:none until it opens, and the sidebar markup portalled into
  // it is what `open()` reveals. Building a second panel here only duplicated the
  // whole (expensive) taxonomy markup into a hidden subtree that was immediately
  // thrown away on the next navigation.
  sidebarSlot.append(buildFilterPanel());

  const filtersDrawer = drawer({ title: "فیلترها", side: "start" });
  filtersDrawer.body.append(sidebarSlot);

  disposers.push(
    filtersDrawer.cleanup,
    // Put the panel back where the layout expects it, or the desktop sidebar
    // would disappear for good after the first drawer close on a small screen.
    () => sidebarSlot.parentNode !== node && restoreSidebar()
  );

  function restoreSidebar() {
    const aside = node.querySelector(".catalog-aside");
    if (aside && sidebarSlot.parentNode !== aside) aside.append(sidebarSlot);
  }

  /* -------------------------------------------------------------------------
     Initial render
     ------------------------------------------------------------------------- */

  renderActiveFilters(filters);
  renderResults(filters);

  const activeFilterCount = () => {
    const current = catalogService.parseFilters(parseLocation().query);
    return (
      current.categories.length +
      current.subcategories.length +
      current.brands.length +
      (current.inStockOnly ? 1 : 0) +
      (current.onSaleOnly ? 1 : 0) +
      (current.minRating ? 1 : 0)
    );
  };

  const initialCount = activeFilterCount();
  if (initialCount > 0) {
    filterCountSlot.hidden = false;
    filterCountSlot.textContent = toPersianDigits(initialCount);
  }

  /* -------------------------------------------------------------------------
     Event wiring — one delegate handles both the sidebar and the drawer
     ------------------------------------------------------------------------- */

  const root = node;

  disposers.push(
    delegate(root, "change", "[data-filter]", (event, input) => {
      const kind = input.dataset.filter;

      switch (kind) {
        case "category":
          toggleListValue("categories", input.value, input.checked);
          // Changing the category invalidates any subcategory selection.
          applyQuery({ sub: null }, { replace: false });
          break;

        case "sub":
          toggleListValue("subcategories", input.value, input.checked);
          break;

        case "brand":
          toggleListValue("brands", input.value, input.checked);
          break;

        case "rating":
          applyQuery({ rating: input.value === "0" ? null : input.value });
          break;

        case "stock":
          applyQuery({ stock: input.checked ? "1" : null });
          break;

        case "sale":
          applyQuery({ sale: input.checked ? "1" : null });
          break;

        case "max": {
          const value = Math.max(filters.minPrice, Number(input.value));
          applyQuery({ max: String(value) });
          break;
        }

        default:
          break;
      }
    }),
  );

  /* Text inputs: debounce so typing doesn't fire a navigation per keystroke. */
  const onTextInput = debounce((input) => {
    const kind = input.dataset.filter;

    if (kind === "q") {
      const value = input.value.trim();
      if (value.length >= 2) account.rememberSearch(value);
      applyQuery({ q: value || null });
    } else if (kind === "min") {
      applyQuery({ min: input.value });
    } else if (kind === "max-number") {
      applyQuery({ max: input.value });
    }
  }, 420);

  disposers.push(
    on(root, "input", (event) => {
      const input = event.target.closest("[data-filter]");
      if (!input) return;

      const kind = input.dataset.filter;
      if (["q", "min", "max-number"].includes(kind)) onTextInput(input);
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-clear]", (event, button) => {
      event.preventDefault();
      try {
        applyQuery(JSON.parse(button.dataset.clear.replace(/&quot;/g, '"')));
      } catch {
        /* malformed payload — ignore rather than crash the page */
      }
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-reset]", (event, button) => {
      event.preventDefault();
      const kind = button.dataset.reset;
      const patch =
        kind === "category"
          ? { category: null, sub: null }
          : kind === "brand"
            ? { brand: null }
            : { [kind]: null };
      applyQuery(patch);
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-reset-all]", (event) => {
      event.preventDefault();
      navigate("/catalog", filters.view === "grid" ? {} : { view: "list" });
    }),
  );

  disposers.push(
    delegate(root, "change", "[data-sort]", (event, select) => {
      applyQuery({ sort: select.value });
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-view]", (event, button) => {
      event.preventDefault();
      applyQuery({ view: button.dataset.view });
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-open-filters]", (event) => {
      event.preventDefault();
      restoreSidebar();
      filtersDrawer.open();
    }),
  );

  /* List-view row actions */
  disposers.push(
    delegate(root, "click", "[data-row-add]", (event, button) => {
      event.preventDefault();
      const product = catalogService.getProductById(button.dataset.rowAdd);
      if (product) handleAdd(product);
    }),
  );

  disposers.push(
    delegate(root, "click", "[data-row-wishlist]", (event, button) => {
      event.preventDefault();
      const added = account.toggleWishlist(button.dataset.rowWishlist);
      toast.success(
        added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
      );
    }),
  );

  /* -------------------------------------------------------------------------
     Hook into the hash router: same route, different query
     ------------------------------------------------------------------------- */

  return {
    node,
    title: filters.q ? `جستجو: ${filters.q}` : "فروشگاه",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

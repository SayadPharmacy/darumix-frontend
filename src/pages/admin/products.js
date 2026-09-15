/**
 * DARUMIX — admin product management.
 *
 * Searchable, filterable, paginated table with inline price/stock editing, a
 * full add/edit modal, bulk actions and delete. Edits are written to the
 * catalog overlay through the admin service and the table re-renders from the
 * service so the UI can never drift from the store.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { productArt, shapeKeys, toneKeys } from "../../ui/product-art.js";
import { to, updateQuery } from "../../core/router.js";
import { toPersianDigits, formatPrice } from "../../core/format.js";
import { modal, toast, confirmDialog } from "../../ui/components/overlays.js";
import * as admin from "../../services/admin.js";
import * as catalogService from "../../services/catalog.js";
import { adminLayout, kpiTile } from "./_layout.js";
import { adminToolbar, adminPager, tableEmpty } from "./_shared.js";

const STOCK_FILTERS = [
  { id: "all", label: "همه محصولات" },
  { id: "low", label: "موجودی کم" },
  { id: "out", label: "ناموجود" },
  { id: "rx", label: "نسخه‌ای" },
  { id: "featured", label: "ویژه" },
  { id: "sale", label: "تخفیف‌دار" },
];

export default async function adminProductsPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  /** Filter state mirrors the URL so the table view is shareable. */
  const filters = {
    q: query.q || "",
    stock: STOCK_FILTERS.some((entry) => entry.id === query.stock)
      ? query.stock
      : "all",
    page: Math.max(1, Number(query.page) || 1),
  };

  const perPage = 12;

  /* -------------------------------------------------------------------------
     Query the catalog
     ------------------------------------------------------------------------- */

  function select() {
    const needle = filters.q.trim().toLowerCase();

    let items = catalogService.allProducts();

    if (needle) {
      items = items.filter((product) =>
        [product.name, product.brandName, product.categoryTitle, product.id]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }

    if (filters.stock === "low")
      items = items.filter((product) => product.lowStock);
    else if (filters.stock === "out")
      items = items.filter((product) => product.stock <= 0);
    else if (filters.stock === "rx")
      items = items.filter((product) => product.rx);
    else if (filters.stock === "featured")
      items = items.filter((product) => product.featured);
    else if (filters.stock === "sale")
      items = items.filter((product) => product.discount > 0);

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(filters.page, pages);
    const start = (page - 1) * perPage;

    return {
      items: items.slice(start, start + perPage),
      total,
      pages,
      page,
    };
  }

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const inventory = catalogService.inventoryStats();

  const stats = [
    kpiTile({
      label: "کل محصولات",
      value: toPersianDigits(inventory.total),
      iconName: "bag",
      tone: "brand",
      hint: "در کاتالوگ فعال",
    }),
    kpiTile({
      label: "ارزش انبار",
      value: formatPrice(inventory.inventoryValue, { withUnit: false }),
      iconName: "database",
      tone: "mint",
      hint: "تومان",
    }),
    kpiTile({
      label: "موجودی کم",
      value: toPersianDigits(inventory.lowStock.length),
      iconName: "alert",
      tone: "gold",
      hint: "نیازمند سفارش مجدد",
    }),
    kpiTile({
      label: "ناموجود",
      value: toPersianDigits(inventory.outOfStock.length),
      iconName: "x",
      tone: "blue",
      hint: "در انتظار تأمین",
    }),
  ];

  /* -------------------------------------------------------------------------
     Toolbar
     ------------------------------------------------------------------------- */

  const addButton = el("button", {
    class: "btn btn--primary btn--sm",
    type: "button",
    "data-add-product": "",
  });
  addButton.innerHTML = html`${raw(icon("plus", { size: 15 }))} محصول جدید`.toString();

  const toolbar = adminToolbar({
    placeholder: "جستجو با نام، برند، دسته یا کد کالا…",
    value: filters.q,
    onSearch: (term) => {
      filters.q = term;
      filters.page = 1;
      updateQuery({ q: term || null });
    },
    select: {
      value: filters.stock,
      options: STOCK_FILTERS.map((entry) => ({
        id: entry.id,
        label: entry.label,
        count:
          entry.id === "all"
            ? catalogService.allProducts().length
            : entry.id === "low"
              ? inventory.lowStock.length
              : entry.id === "out"
                ? inventory.outOfStock.length
                : undefined,
      })),
      onChange: (value) => {
        filters.stock = value;
        filters.page = 1;
        updateQuery({ stock: value === "all" ? null : value });
      },
    },
    extra: addButton,
  });

  disposers.push(toolbar.cleanup);

  /* -------------------------------------------------------------------------
     Table
     ------------------------------------------------------------------------- */

  const tableHost = el("div");

  function renderTable() {
    const result = select();
    filters.page = result.page;

    if (!result.items.length) {
      tableHost.innerHTML = "";
      tableHost.append(
        tableEmpty(
          "محصولی با این مشخصات پیدا نشد",
          "فیلترها را تغییر دهید یا عبارت جستجو را کوتاه‌تر کنید.",
        ),
      );
      return;
    }

    tableHost.innerHTML = html`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col" style="width:38px">
                <label class="check check--bare">
                  <input
                    type="checkbox"
                    data-select-all
                    aria-label="انتخاب همه"
                  />
                  <span class="check__box"
                    >${raw(icon("check", { size: 12 }))}</span
                  >
                </label>
              </th>
              <th scope="col">محصول</th>
              <th scope="col">دسته / برند</th>
              <th scope="col">قیمت (تومان)</th>
              <th scope="col">موجودی</th>
              <th scope="col">امتیاز</th>
              <th scope="col">وضعیت</th>
              <th scope="col" style="width:120px"></th>
            </tr>
          </thead>
          <tbody>
            ${result.items.map((product) =>
              raw(html`
                <tr data-row="${product.id}">
                  <td>
                    <label class="check check--bare">
                      <input
                        type="checkbox"
                        data-row-select
                        value="${product.id}"
                        aria-label="انتخاب ${product.name}"
                      />
                      <span class="check__box"
                        >${raw(icon("check", { size: 12 }))}</span
                      >
                    </label>
                  </td>

                  <td>
                    <div class="row row--sm">
                      <span class="table-thumb"
                        >${raw(productArt(product))}</span
                      >
                      <div>
                        <a
                          class="fw-semibold fs-sm"
                          href="${to(`/product/${product.slug}`)}"
                          >${product.name}</a
                        >
                        <span class="fs-xs text-soft d-block"
                          >${product.id}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="fs-sm">${product.categoryTitle}</div>
                    <span class="fs-xs text-soft">${product.brandName}</span>
                  </td>

                  <td>
                    <input
                      class="input input--inline"
                      type="number"
                      inputmode="numeric"
                      value="${product.price}"
                      data-edit-price="${product.id}"
                      aria-label="قیمت ${product.name}"
                    />
                    ${product.discount
                      ? html`<span class="fs-xs text-success d-block mt-1"
                          >${toPersianDigits(product.discount)}٪ تخفیف</span
                        >`
                      : ""}
                  </td>

                  <td>
                    <input
                      class="input input--inline input--narrow"
                      type="number"
                      inputmode="numeric"
                      value="${product.stock}"
                      data-edit-stock="${product.id}"
                      aria-label="موجودی ${product.name}"
                    />
                    <span
                      class="fs-xs d-block mt-1 ${product.stock <= 0
                        ? "text-danger"
                        : product.lowStock
                          ? "text-warn"
                          : "text-success"}"
                    >
                      ${product.stock <= 0
                        ? "ناموجود"
                        : product.lowStock
                          ? "کم"
                          : "سالم"}
                    </span>
                  </td>

                  <td>
                    <div class="row row--sm fs-sm">
                      ${raw(icon("star", { size: 13, filled: true }))}
                      <span>${toPersianDigits(product.rating.toFixed(1))}</span>
                    </div>
                    <span class="fs-xs text-soft"
                      >${toPersianDigits(product.reviewCount)} نظر</span
                    >
                  </td>

                  <td>
                    <div class="stack stack--xs">
                      ${product.rx
                        ? html`<span class="badge badge--info">نسخه‌ای</span>`
                        : ""}
                      ${product.featured
                        ? html`<span class="badge badge--gold">ویژه</span>`
                        : ""}
                      ${product.stock <= 0
                        ? html`<span class="badge badge--danger">ناموجود</span>`
                        : ""}
                      ${!product.rx && !product.featured && product.stock > 0
                        ? html`<span class="badge badge--neutral">عادی</span>`
                        : ""}
                    </div>
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-edit="${product.id}"
                        data-tip="ویرایش"
                        aria-label="ویرایش ${product.name}"
                      >
                        ${raw(icon("edit", { size: 16 }))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-delete="${product.id}"
                        data-tip="حذف"
                        aria-label="حذف ${product.name}"
                      >
                        ${raw(icon("trash", { size: 16 }))}
                      </button>
                    </div>
                  </td>
                </tr>
              `),
            )}
          </tbody>
        </table>
      </div>

      <div class="admin-table-foot">
        <div class="row row--sm">
          <button
            class="btn btn--glass btn--sm"
            type="button"
            data-bulk-actions
            disabled
          >
            ${raw(icon("sliders", { size: 15 }))} عملیات گروهی
          </button>
          <span class="fs-xs text-soft" data-slot="selection"></span>
        </div>
        <div data-slot="pager"></div>
      </div>
    `.toString();

    /* Pager */
    if (result.pages > 1) {
      const pager = adminPager({
        page: result.page,
        pages: result.pages,
        onChange: (page) =>
          updateQuery({ page: String(page) }, { resetPage: false }),
      });
      qs('[data-slot="pager"]', tableHost).append(pager.node);
      disposers.push(pager.cleanup);
    }

    toolbar.setSummary(
      `نمایش ${toPersianDigits(result.items.length)} از ${toPersianDigits(result.total)} محصول`,
    );
  }

  /* -------------------------------------------------------------------------
     Product form modal
     ------------------------------------------------------------------------- */

  function openProductModal(existing) {
    const isEdit = Boolean(existing);
    const categories = catalogService.allCategories();
    const brands = catalogService.allBrands();

    const dialog = modal({
      title: isEdit ? "ویرایش محصول" : "افزودن محصول جدید",
      subtitle: isEdit
        ? existing.name
        : "اطلاعات محصول را کامل کنید تا در کاتالوگ ثبت شود.",
      size: "lg",
      body: html`
        <form class="form-grid form-grid--2" data-product-form novalidate>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="pr-name"
              >نام محصول <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="pr-name"
              name="name"
              value="${existing?.name || ""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="pr-brand">برند</label>
            <select class="select" id="pr-brand" name="brandId">
              ${brands.map((brand) =>
                raw(html`
                  <option
                    value="${brand.id}"
                    ${existing?.brandId === brand.id ? "selected" : ""}
                  >
                    ${brand.name}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="pr-category">دسته‌بندی</label>
            <select class="select" id="pr-category" name="categoryId">
              ${categories.map((category) =>
                raw(html`
                  <option
                    value="${category.id}"
                    ${existing?.categoryId === category.id ? "selected" : ""}
                  >
                    ${category.title}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="pr-price"
              >قیمت (تومان) <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="pr-price"
              name="price"
              type="number"
              inputmode="numeric"
              value="${existing?.price || ""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="pr-compare"
              >قیمت پیش از تخفیف</label
            >
            <input
              class="input"
              id="pr-compare"
              name="compareAt"
              type="number"
              inputmode="numeric"
              value="${existing?.compareAt || ""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="pr-stock">موجودی</label>
            <input
              class="input"
              id="pr-stock"
              name="stock"
              type="number"
              inputmode="numeric"
              value="${existing?.stock ?? ""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="pr-rating">امتیاز (۰ تا ۵)</label>
            <input
              class="input"
              id="pr-rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value="${existing?.rating ?? 4.5}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="pr-shape">شکل تصویر</label>
            <select class="select" id="pr-shape" name="shape">
              ${shapeKeys.map((shape) =>
                raw(html`
                  <option
                    value="${shape}"
                    ${existing?.shape === shape ? "selected" : ""}
                  >
                    ${shape}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="pr-tone">رنگ تصویر</label>
            <select class="select" id="pr-tone" name="tone">
              ${toneKeys.map((tone) =>
                raw(html`
                  <option
                    value="${tone}"
                    ${existing?.tone === tone ? "selected" : ""}
                  >
                    ${tone}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="pr-short">توضیح کوتاه</label>
            <input
              class="input"
              id="pr-short"
              name="shortDescription"
              value="${existing?.shortDescription || ""}"
            />
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="pr-desc">توضیحات کامل</label>
            <textarea class="textarea" id="pr-desc" name="description" rows="4">
${existing?.description || ""}</textarea
            >
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="pr-tags"
              >برچسب‌ها (با کاما جدا کنید)</label
            >
            <input
              class="input"
              id="pr-tags"
              name="tags"
              value="${(existing?.tags || []).join(", ")}"
            />
          </div>

          <div class="row row--sm" style="grid-column:1/-1">
            <label class="switch">
              <input
                type="checkbox"
                name="rx"
                ${existing?.rx ? "checked" : ""}
              />
              <span class="switch__track"></span>
              <span>نیازمند نسخه</span>
            </label>

            <label class="switch">
              <input
                type="checkbox"
                name="featured"
                ${existing?.featured ? "checked" : ""}
              />
              <span class="switch__track"></span>
              <span>محصول ویژه</span>
            </label>
          </div>

          <span
            class="field__error"
            data-form-error
            hidden
            style="grid-column:1/-1"
          ></span>
        </form>
      `,
      footer:
        `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
        `<button class="btn btn--primary" type="button" data-save-product>${isEdit ? "ذخیره تغییرات" : "افزودن محصول"}</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-product]")) return;

      const form = qs("[data-product-form]", dialog.node);
      const errorSlot = qs("[data-form-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";
      const checked = (name) => Boolean(qs(`[name="${name}"]`, form)?.checked);

      if (!value("name")) {
        errorSlot.hidden = false;
        errorSlot.textContent = "نام محصول الزامی است.";
        return;
      }

      if (!Number(value("price"))) {
        errorSlot.hidden = false;
        errorSlot.textContent = "قیمت باید یک عدد بزرگ‌تر از صفر باشد.";
        return;
      }

      errorSlot.hidden = true;

      const payload = {
        id: existing?.id,
        name: value("name"),
        brandId: value("brandId"),
        categoryId: value("categoryId"),
        price: Number(value("price")) || 0,
        compareAt: Number(value("compareAt")) || null,
        stock: Number(value("stock")) || 0,
        rating: Math.min(5, Math.max(0, Number(value("rating")) || 4.5)),
        shape: value("shape"),
        tone: value("tone"),
        shortDescription: value("shortDescription"),
        description: value("description"),
        tags: value("tags")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        rx: checked("rx"),
        featured: checked("featured"),
      };

      admin.saveProduct(payload);
      dialog.close();

      toast.success(
        isEdit ? "محصول به‌روزرسانی شد" : "محصول جدید اضافه شد",
        payload.name,
      );
      renderTable();
    });
  }

  /* -------------------------------------------------------------------------
     Bulk actions modal
  ------------------------------------------------------------------------- */

  function openBulkModal(ids) {
    const dialog = modal({
      title: `عملیات گروهی روی ${toPersianDigits(ids.length)} محصول`,
      size: "md",
      body: html`
        <div class="stack">
          <p class="fs-sm text-muted mb-0">
            این تغییر روی همه محصولات انتخاب‌شده اعمال می‌شود.
          </p>

          <div class="form-grid form-grid--2">
            <div class="field">
              <label class="field__label" for="bl-price"
                >قیمت جدید (خالی = بدون تغییر)</label
              >
              <input
                class="input"
                id="bl-price"
                type="number"
                inputmode="numeric"
                data-bulk-price
              />
            </div>
            <div class="field">
              <label class="field__label" for="bl-stock"
                >موجودی جدید (خالی = بدون تغییر)</label
              >
              <input
                class="input"
                id="bl-stock"
                type="number"
                inputmode="numeric"
                data-bulk-stock
              />
            </div>
          </div>

          <div class="row row--sm">
            <button
              class="btn btn--glass btn--sm"
              type="button"
              data-bulk-feature
            >
              ${raw(icon("crown", { size: 15 }))} افزودن به ویژه‌ها
            </button>
            <button
              class="btn btn--glass btn--sm"
              type="button"
              data-bulk-unfeature
            >
              حذف از ویژه‌ها
            </button>
          </div>

          <div class="alert alert--warn">
            ${raw(icon("alert", { size: 18 }))}
            <span
              >این عملیات روی داده‌های محلی اعمال می‌شود و قابل بازگشت
              نیست.</span
            >
          </div>
        </div>
      `,
      footer:
        `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
        `<button class="btn btn--primary" type="button" data-apply-bulk>اعمال تغییرات</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      const featureButton = event.target.closest("[data-bulk-feature]");
      const unfeatureButton = event.target.closest("[data-bulk-unfeature]");
      const applyButton = event.target.closest("[data-apply-bulk]");

      if (featureButton) {
        admin.bulkUpdate(ids, { featured: true });
        toast.success(
          "محصولات ویژه شدند",
          `${toPersianDigits(ids.length)} محصول`,
        );
        return;
      }

      if (unfeatureButton) {
        admin.bulkUpdate(ids, { featured: false });
        toast.info("از فهرست ویژه‌ها حذف شد");
        return;
      }

      if (!applyButton) return;

      const price = qs("[data-bulk-price]", dialog.node)?.value.trim();
      const stock = qs("[data-bulk-stock]", dialog.node)?.value.trim();

      const patch = {};
      if (price) patch.price = Number(price);
      if (stock) patch.stock = Number(stock);

      if (!Object.keys(patch).length) {
        toast.warn("تغییری وارد نشده است", "قیمت یا موجودی جدید را وارد کنید.");
        return;
      }

      admin.bulkUpdate(ids, patch);
      dialog.close();
      toast.success(
        "تغییرات اعمال شد",
        `${toPersianDigits(ids.length)} محصول به‌روزرسانی شد.`,
      );
      renderTable();
    });
  }

  /* -------------------------------------------------------------------------
     Mount
     ------------------------------------------------------------------------- */

  content.append(toolbar.node, tableHost);
  renderTable();

  const layout = adminLayout({
    title: "مدیریت محصولات",
    subtitle:
      "جستجو، ویرایش قیمت و موجودی، افزودن محصول جدید و مدیریت گروهی کاتالوگ.",
    iconName: "bag",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-add-product]", (event) => {
      event.preventDefault();
      openProductModal(null);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-edit]", (event, button) => {
      event.preventDefault();
      const product = catalogService.getProductById(button.dataset.edit);
      if (product) openProductModal(product);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-delete]", async (event, button) => {
      event.preventDefault();

      const product = catalogService.getProductById(button.dataset.delete);
      const ok = await confirmDialog({
        title: "حذف محصول",
        message: `«${product?.name || "این محصول"}» از کاتالوگ حذف شود؟ این کار روی داده‌های محلی اثر می‌گذارد.`,
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      admin.deleteProduct(button.dataset.delete);
      toast.info("محصول حذف شد", product?.name);
      renderTable();
    }),
  );

  /* --- Inline edits: commit on blur so typing isn't interrupted --- */
  disposers.push(
    delegate(content, "change", "[data-edit-price]", (event, input) => {
      const id = input.dataset.editPrice;
      const value = Number(input.value);

      if (!Number.isFinite(value) || value < 0) {
        toast.error("قیمت نامعتبر", "قیمت باید یک عدد مثبت باشد.");
        input.value = catalogService.getProductById(id)?.price ?? "";
        return;
      }

      admin.updateProductField(id, "price", value);
      toast.success(
        "قیمت به‌روزرسانی شد",
        catalogService.getProductById(id)?.name,
      );
    }),
  );

  disposers.push(
    delegate(content, "change", "[data-edit-stock]", (event, input) => {
      const id = input.dataset.editStock;
      const value = Number(input.value);

      if (!Number.isFinite(value) || value < 0) {
        toast.error("موجودی نامعتبر", "موجودی باید یک عدد مثبت باشد.");
        input.value = catalogService.getProductById(id)?.stock ?? "";
        return;
      }

      admin.updateProductField(id, "stock", value);
      toast.success(
        "موجودی به‌روزرسانی شد",
        catalogService.getProductById(id)?.name,
      );
      renderTable();
    }),
  );

  /* --- Row selection --- */
  function selectedIds() {
    return [...content.querySelectorAll("[data-row-select]:checked")].map(
      (input) => input.value,
    );
  }

  function syncSelection() {
    const ids = selectedIds();
    const bulkButton = qs("[data-bulk-actions]", content);
    const label = qs('[data-slot="selection"]', content);

    if (bulkButton) bulkButton.disabled = ids.length === 0;
    if (label)
      label.textContent = ids.length
        ? `${toPersianDigits(ids.length)} انتخاب شده`
        : "";
  }

  disposers.push(
    delegate(content, "change", "[data-row-select]", () => syncSelection()),
  );

  disposers.push(
    delegate(content, "change", "[data-select-all]", (event, input) => {
      content
        .querySelectorAll("[data-row-select]")
        .forEach((box) => (box.checked = input.checked));
      syncSelection();
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-bulk-actions]", (event) => {
      event.preventDefault();
      const ids = selectedIds();
      if (!ids.length) {
        toast.warn("محصولی انتخاب نشده است");
        return;
      }
      openBulkModal(ids);
    }),
  );

  return {
    node: layout.node,
    title: "مدیریت محصولات",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

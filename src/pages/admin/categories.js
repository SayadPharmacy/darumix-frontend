/**
 * DARUMIX — admin category & brand management.
 *
 * Two tabs on one route: category taxonomy (with subcategories) and brands.
 * Both write through the admin service into the catalog overlay.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { brandArt } from "../../ui/product-art.js";
import { to, updateQuery } from "../../core/router.js";
import { toPersianDigits } from "../../core/format.js";
import { tabs } from "../../ui/components/common.js";
import { modal, toast, confirmDialog } from "../../ui/components/overlays.js";
import * as admin from "../../services/admin.js";
import * as catalogService from "../../services/catalog.js";
import { adminLayout, kpiTile } from "./_layout.js";
import { adminToolbar, tableEmpty } from "./_shared.js";

const CATEGORY_ICONS = [
  "pill",
  "heart",
  "leaf",
  "sun",
  "baby",
  "tooth",
  "mask",
  "bone",
  "stethoscope",
  "thermometer",
  "activity",
  "shield",
  "droplet",
  "sparkle",
];

export default async function adminCategoriesPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  const activeTab = query.tab === "brands" ? "brands" : "categories";
  const search = query.q || "";

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const categories = catalogService.categoriesWithCounts();
  const brands = catalogService.allBrands();
  const counts = catalogService.categoryCounts();

  const stats = [
    kpiTile({
      label: "دسته‌بندی‌ها",
      value: toPersianDigits(categories.length),
      iconName: "layers",
      tone: "brand",
      hint: "سطح اول",
    }),
    kpiTile({
      label: "زیرشاخه‌ها",
      value: toPersianDigits(
        categories.reduce((total, category) => total + (category.subcategories || []).length, 0),
      ),
      iconName: "sliders",
      tone: "mint",
      hint: "در همه دسته‌ها",
    }),
    kpiTile({
      label: "برندها",
      value: toPersianDigits(brands.length),
      iconName: "verified",
      tone: "blue",
      hint: "داخلی و بین‌المللی",
    }),
    kpiTile({
      label: "دسته بدون محصول",
      value: toPersianDigits(categories.filter((category) => !counts[category.id]).length),
      iconName: "alert",
      tone: "gold",
      hint: "نیازمند محصول",
    }),
  ];

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  const tabBar = tabs({
    items: [
      { id: "categories", label: "دسته‌بندی‌ها", icon: "layers", count: categories.length },
      { id: "brands", label: "برندها", icon: "verified", count: brands.length },
    ],
    active: activeTab,
    variant: "pill-tabs",
    onChange: (id) => updateQuery({ tab: id === "categories" ? null : id }),
  });

  const toolbar = adminToolbar({
    placeholder: activeTab === "brands" ? "جستجوی برند…" : "جستجوی دسته‌بندی…",
    value: search,
    onSearch: (term) => updateQuery({ q: term || null }),
    extra: (() => {
      const button = el("button", {
        class: "btn btn--primary btn--sm",
        type: "button",
        "data-add": activeTab,
      });
      button.innerHTML = html`${raw(icon("plus", { size: 15 }))} ${
        activeTab === "brands" ? "برند جدید" : "دسته جدید"
      }`.toString();
      return button;
    })(),
  });

  disposers.push(tabBar.cleanup, toolbar.cleanup);

  const body = el("div", { class: "stack stack--lg" });

  content.append(tabBar.node, toolbar.node, body);

  /* =========================================================================
     Categories
     ========================================================================= */

  function renderCategories() {
    const needle = search.trim().toLowerCase();

    const visible = categories.filter((category) =>
      needle
        ? [category.title, category.description, ...(category.subcategories || []).map((sub) => sub.title)]
            .join(" ")
            .toLowerCase()
            .includes(needle)
        : true,
    );

    if (!visible.length) {
      body.innerHTML = "";
      body.append(tableEmpty("دسته‌بندی‌ای پیدا نشد", "عبارت جستجو را تغییر دهید."));
      return;
    }

    body.innerHTML = html`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">دسته‌بندی</th>
              <th scope="col">گروه</th>
              <th scope="col">زیرشاخه‌ها</th>
              <th scope="col">تعداد محصول</th>
              <th scope="col" style="width:110px"></th>
            </tr>
          </thead>
          <tbody>
            ${visible.map(
              (category) => raw(html`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="category-card__icon category-card__icon--sm"
                        >${raw(icon(category.icon, { size: 20 }))}</span
                      >
                      <div>
                        <a class="fw-semibold fs-sm" href="${to(`/category/${category.id}`)}"
                          >${category.title}</a
                        >
                        <span class="fs-xs text-soft d-block clamp-1"
                          >${category.description || "بدون توضیح"}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td><span class="badge badge--neutral">${category.group || "—"}</span></td>

                  <td>
                    <div class="chip-row">
                      ${(category.subcategories || []).length
                        ? (category.subcategories || [])
                            .slice(0, 4)
                            .map(
                              (sub) => raw(html`<span class="chip chip--static fs-xs">${sub.title}</span>`),
                            )
                        : html`<span class="fs-xs text-soft">بدون زیرشاخه</span>`}
                      ${(category.subcategories || []).length > 4
                        ? html`<span class="fs-xs text-soft"
                            >+${toPersianDigits((category.subcategories || []).length - 4)}</span
                          >`
                        : ""}
                    </div>
                  </td>

                  <td>
                    <span class="fw-bold">${toPersianDigits(counts[category.id] || 0)}</span>
                    ${counts[category.id]
                      ? ""
                      : html`<span class="badge badge--warn">خالی</span>`}
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-edit-category="${category.id}"
                        data-tip="ویرایش"
                        aria-label="ویرایش ${category.title}"
                      >
                        ${raw(icon("edit", { size: 16 }))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-delete-category="${category.id}"
                        data-tip="حذف"
                        aria-label="حذف ${category.title}"
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
    `.toString();
  }

  function openCategoryModal(existing) {
    const isEdit = Boolean(existing);

    const dialog = modal({
      title: isEdit ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی",
      size: "md",
      body: html`
        <form class="form-grid form-grid--2" data-category-form novalidate>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-title"
              >عنوان <span class="field__required">*</span></label
            >
            <input class="input" id="cg-title" name="title" value="${existing?.title || ""}" />
          </div>

          <div class="field">
            <label class="field__label" for="cg-group">گروه</label>
            <select class="select" id="cg-group" name="group">
              ${["medicine", "supplement", "personal", "equipment", "mother-child", "wellness"].map(
                (group) => raw(html`
                  <option value="${group}" ${existing?.group === group ? "selected" : ""}>
                    ${group}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="cg-icon">آیکن</label>
            <select class="select" id="cg-icon" name="icon">
              ${CATEGORY_ICONS.map(
                (iconName) => raw(html`
                  <option value="${iconName}" ${existing?.icon === iconName ? "selected" : ""}>
                    ${iconName}
                  </option>
                `),
              )}
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-desc">توضیح</label>
            <textarea class="textarea" id="cg-desc" name="description" rows="2">${existing?.description || ""}</textarea>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-subs">زیرشاخه‌ها (هر خط یک مورد، «عنوان | شناسه»)</label>
            <textarea class="textarea" id="cg-subs" name="subcategories" rows="5" placeholder="قرص و کپسول | tablets&#10;شربت | syrup">${(existing?.subcategories || [])
              .map((sub) => `${sub.title} | ${sub.id}`)
              .join("\n")}</textarea>
          </div>

          <span class="field__error" data-form-error hidden style="grid-column:1/-1"></span>
        </form>
      `,
      footer:
        `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
        `<button class="btn btn--primary" type="button" data-save-category>${isEdit ? "ذخیره" : "افزودن"}</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-category]")) return;

      const form = qs("[data-category-form]", dialog.node);
      const errorSlot = qs("[data-form-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      if (!value("title")) {
        errorSlot.hidden = false;
        errorSlot.textContent = "عنوان دسته‌بندی الزامی است.";
        return;
      }

      // Parse "عنوان | شناسه" lines into subcategory records.
      const subcategories = value("subcategories")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [title, id] = line.split("|").map((part) => part.trim());
          return {
            id: id || `sub-${Date.now()}-${index}`,
            title: title || line,
          };
        });

      admin.saveCategory({
        id: existing?.id,
        title: value("title"),
        group: value("group"),
        icon: value("icon"),
        description: value("description"),
        subcategories,
      });

      dialog.close();
      toast.success(isEdit ? "دسته‌بندی به‌روزرسانی شد" : "دسته‌بندی اضافه شد", value("title"));
      window.location.reload();
    });
  }

  /* =========================================================================
     Brands
     ========================================================================= */

  function renderBrands() {
    const needle = search.trim().toLowerCase();

    const visible = brands.filter((brand) =>
      needle
        ? [brand.name, brand.nameEn, brand.country].join(" ").toLowerCase().includes(needle)
        : true,
    );

    if (!visible.length) {
      body.innerHTML = "";
      body.append(tableEmpty("برندی پیدا نشد", "عبارت جستجو را تغییر دهید."));
      return;
    }

    body.innerHTML = html`
      <div class="auto-grid auto-grid--wide" data-slot="brand-grid"></div>
    `.toString();

    const grid = qs('[data-slot="brand-grid"]', body);

    visible.forEach((brand) => {
      const productCount = catalogService
        .allProducts()
        .filter((product) => product.brandId === brand.id).length;

      const card = el("article", { class: "brand-admin glass radius-xl" });
      card.innerHTML = html`
        <div class="row">
          <span class="brand-admin__logo">${raw(brandArt(brand))}</span>
          <div class="grow">
            <div class="row row--sm">
              <h3 class="fs-base mb-0">${brand.name}</h3>
              ${brand.featured
                ? html`<span class="badge badge--gold">ویژه</span>`
                : ""}
            </div>
            <span class="fs-xs text-soft">${brand.nameEn} · ${brand.country}</span>
          </div>
        </div>

        <div class="row row--between mt-4">
          <span class="fs-sm text-soft">تعداد محصول</span>
          <span class="fw-bold">${toPersianDigits(productCount)}</span>
        </div>

        <div class="row row--sm mt-4">
          <a class="btn btn--glass btn--sm grow" href="${to("/catalog", { brand: brand.id })}">
            ${raw(icon("eye", { size: 15 }))} محصولات
          </a>
          <button class="btn btn--glass btn--sm" type="button" data-edit-brand="${brand.id}">
            ${raw(icon("edit", { size: 15 }))}
          </button>
          <button
            class="btn btn--ghost btn--sm text-danger"
            type="button"
            data-delete-brand="${brand.id}"
          >
            ${raw(icon("trash", { size: 15 }))}
          </button>
        </div>
      `.toString();

      grid.append(card);
    });
  }

  function openBrandModal(existing) {
    const isEdit = Boolean(existing);

    const dialog = modal({
      title: isEdit ? "ویرایش برند" : "افزودن برند",
      size: "md",
      body: html`
        <form class="form-grid form-grid--2" data-brand-form novalidate>
          <div class="field">
            <label class="field__label" for="bd-name"
              >نام فارسی <span class="field__required">*</span></label
            >
            <input class="input" id="bd-name" name="name" value="${existing?.name || ""}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-nameen">نام انگلیسی</label>
            <input class="input" id="bd-nameen" name="nameEn" value="${existing?.nameEn || ""}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-country">کشور</label>
            <input class="input" id="bd-country" name="country" value="${existing?.country || "ایران"}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-tone">رنگ برند</label>
            <select class="select" id="bd-tone" name="tone">
              ${["emerald", "mint", "teal", "blue", "gold"].map(
                (tone) => raw(html`
                  <option value="${tone}" ${existing?.tone === tone ? "selected" : ""}>
                    ${tone}
                  </option>
                `),
              )}
            </select>
          </div>

          <label class="switch" style="grid-column:1/-1">
            <input type="checkbox" name="featured" ${existing?.featured ? "checked" : ""} />
            <span class="switch__track"></span>
            <span>نمایش در برندهای منتخب</span>
          </label>

          <span class="field__error" data-form-error hidden style="grid-column:1/-1"></span>
        </form>
      `,
      footer:
        `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
        `<button class="btn btn--primary" type="button" data-save-brand>${isEdit ? "ذخیره" : "افزودن"}</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-brand]")) return;

      const form = qs("[data-brand-form]", dialog.node);
      const errorSlot = qs("[data-form-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      if (!value("name")) {
        errorSlot.hidden = false;
        errorSlot.textContent = "نام برند الزامی است.";
        return;
      }

      admin.saveBrand({
        id: existing?.id,
        name: value("name"),
        nameEn: value("nameEn") || value("name"),
        country: value("country"),
        tone: value("tone"),
        featured: Boolean(qs('[name="featured"]', form)?.checked),
      });

      dialog.close();
      toast.success(isEdit ? "برند به‌روزرسانی شد" : "برند اضافه شد", value("name"));
      window.location.reload();
    });
  }

  /* -------------------------------------------------------------------------
     Render the active tab
     ------------------------------------------------------------------------- */

  if (activeTab === "brands") renderBrands();
  else renderCategories();

  /* -------------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------------- */

  const layout = adminLayout({
    title: "دسته‌بندی و برند",
    subtitle: "ساختار کاتالوگ، زیرشاخه‌ها و برندهای همکار را مدیریت کنید.",
    iconName: "layers",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-add]", (event, button) => {
      event.preventDefault();
      if (button.dataset.add === "brands") openBrandModal(null);
      else openCategoryModal(null);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-edit-category]", (event, button) => {
      event.preventDefault();
      const category = catalogService.getCategoryById(button.dataset.editCategory);
      if (category) openCategoryModal(category);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-delete-category]", async (event, button) => {
      event.preventDefault();

      const category = catalogService.getCategoryById(button.dataset.deleteCategory);
      const productCount = counts[category?.id] || 0;

      const ok = await confirmDialog({
        title: "حذف دسته‌بندی",
        message: productCount
          ? `«${category?.title}» دارای ${toPersianDigits(productCount)} محصول است. با حذف دسته، محصولات آن بدون دسته‌بندی می‌شوند. ادامه می‌دهید؟`
          : `«${category?.title}» حذف شود؟`,
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      admin.deleteCategory(button.dataset.deleteCategory);
      toast.info("دسته‌بندی حذف شد", category?.title);
      window.location.reload();
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-edit-brand]", (event, button) => {
      event.preventDefault();
      const brand = catalogService.getBrandById(button.dataset.editBrand);
      if (brand) openBrandModal(brand);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-delete-brand]", async (event, button) => {
      event.preventDefault();

      const brand = catalogService.getBrandById(button.dataset.deleteBrand);
      const ok = await confirmDialog({
        title: "حذف برند",
        message: `برند «${brand?.name}» حذف شود؟`,
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      admin.deleteBrand(button.dataset.deleteBrand);
      toast.info("برند حذف شد", brand?.name);
      window.location.reload();
    }),
  );

  return {
    node: layout.node,
    title: "دسته‌بندی و برند",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

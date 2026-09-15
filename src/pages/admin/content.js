/**
 * DARUMIX — admin content management (health magazine).
 *
 * Article list with tag filtering, engagement stats, a create/edit modal and
 * delete. Writes go through the blog service into the catalog overlay.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { articleArt, shapeKeys, toneKeys } from "../../ui/product-art.js";
import { to, updateQuery } from "../../core/router.js";
import {
  toPersianDigits,
  formatDate,
  formatRelativeTime,
} from "../../core/format.js";
import { modal, toast, confirmDialog } from "../../ui/components/overlays.js";
import * as blog from "../../services/blog.js";
import { adminLayout, kpiTile } from "./_layout.js";
import { adminToolbar, tableEmpty } from "./_shared.js";

export default async function adminContentPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  const filters = {
    q: query.q || "",
    tag: query.tag || "all",
  };

  const tags = blog.tags();
  const stats = blog.contentStats();

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const headerStats = [
    kpiTile({
      label: "کل مقالات",
      value: toPersianDigits(stats.total),
      iconName: "bookmark",
      tone: "brand",
    }),
    kpiTile({
      label: "مقالات ویژه",
      value: toPersianDigits(stats.featured),
      iconName: "crown",
      tone: "gold",
      hint: "نمایش در صفحه اصلی",
    }),
    kpiTile({
      label: "پیش‌نویس‌ها",
      value: toPersianDigits(stats.drafts),
      iconName: "edit",
      tone: "blue",
      hint: "منتشر نشده",
    }),
    kpiTile({
      label: "زمان مطالعه کل",
      value: `${toPersianDigits(stats.totalReadingMinutes)} دقیقه`,
      iconName: "clock",
      tone: "mint",
      hint: "مجموع همه مقالات",
    }),
  ];

  /* -------------------------------------------------------------------------
     Toolbar + tag chips
     ------------------------------------------------------------------------- */

  const addButton = el("button", {
    class: "btn btn--primary btn--sm",
    type: "button",
    "data-new-article": "",
  });
  addButton.innerHTML = html`${raw(icon("plus", { size: 15 }))} مقاله جدید`.toString();

  const toolbar = adminToolbar({
    placeholder: "جستجو در عنوان، خلاصه یا نویسنده…",
    value: filters.q,
    onSearch: (term) => {
      filters.q = term;
      updateQuery({ q: term || null });
    },
    extra: addButton,
  });

  disposers.push(toolbar.cleanup);

  const tagBar = el("div", { class: "admin-status-bar" });
  tagBar.innerHTML = html`
    <button
      class="chip${filters.tag === "all" ? " is-active" : ""}"
      type="button"
      data-tag="all"
    >
      همه موضوع‌ها
      <span class="chip__count"
        >${toPersianDigits(blog.allArticles().length)}</span
      >
    </button>
    ${tags
      .filter((tag) => tag.id !== "all")
      .map((tag) => {
        const count = blog
          .allArticles()
          .filter((article) => article.tag === tag.id).length;
        if (!count) return "";

        return raw(html`
          <button
            class="chip${tag.id === filters.tag ? " is-active" : ""}"
            type="button"
            data-tag="${tag.id}"
          >
            ${tag.title}
            <span class="chip__count">${toPersianDigits(count)}</span>
          </button>
        `);
      })}
  `.toString();

  const tableHost = el("div");

  /* -------------------------------------------------------------------------
     Table
     ------------------------------------------------------------------------- */

  function visibleArticles() {
    const needle = filters.q.trim().toLowerCase();

    return blog.allArticles().filter((article) => {
      if (filters.tag !== "all" && article.tag !== filters.tag) return false;
      if (!needle) return true;

      return [article.title, article.excerpt, article.author]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }

  function renderTable() {
    const articles = visibleArticles();

    if (!articles.length) {
      tableHost.innerHTML = "";
      tableHost.append(
        tableEmpty(
          "مقاله‌ای با این مشخصات پیدا نشد",
          "موضوع یا عبارت جستجو را تغییر دهید.",
        ),
      );
      toolbar.setSummary("");
      return;
    }

    tableHost.innerHTML = html`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">مقاله</th>
              <th scope="col">موضوع</th>
              <th scope="col">نویسنده</th>
              <th scope="col">تاریخ</th>
              <th scope="col">بازدید</th>
              <th scope="col">تعامل</th>
              <th scope="col">وضعیت</th>
              <th scope="col" style="width:110px"></th>
            </tr>
          </thead>
          <tbody>
            ${articles.map((article) => {
              const tag = tags.find((entry) => entry.id === article.tag);
              const articleStats = blog.articleStats(article);

              return raw(html`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="table-thumb table-thumb--wide"
                        >${raw(articleArt(article))}</span
                      >
                      <div style="max-width:320px">
                        <a
                          class="fw-semibold fs-sm clamp-1"
                          href="${to(`/magazine/${article.slug}`)}"
                          >${article.title}</a
                        >
                        <span class="fs-xs text-soft clamp-1 d-block"
                          >${article.excerpt}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class="badge badge--neutral"
                      >${tag?.title || article.tag}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${article.author}</div>
                    <span class="fs-xs text-soft"
                      >${article.authorRole || ""}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${formatDate(article.date)}</div>
                    <span class="fs-xs text-soft"
                      >${formatRelativeTime(article.date)}</span
                    >
                  </td>

                  <td class="fw-bold">
                    ${toPersianDigits(articleStats.views)}
                  </td>

                  <td>
                    <div class="row row--sm fs-xs text-soft">
                      <span
                        >${raw(icon("heart", { size: 12 }))}
                        ${toPersianDigits(articleStats.likes)}</span
                      >
                      <span
                        >${raw(icon("message", { size: 12 }))}
                        ${toPersianDigits(articleStats.comments)}</span
                      >
                    </div>
                  </td>

                  <td>
                    <div class="stack stack--xs">
                      ${article.draft
                        ? html`<span class="badge badge--warn">پیش‌نویس</span>`
                        : html`<span class="badge badge--mint">منتشرشده</span>`}
                      ${article.featured
                        ? html`<span class="badge badge--gold">ویژه</span>`
                        : ""}
                    </div>
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-edit-article="${article.id}"
                        data-tip="ویرایش"
                        aria-label="ویرایش ${article.title}"
                      >
                        ${raw(icon("edit", { size: 16 }))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-delete-article="${article.id}"
                        data-tip="حذف"
                        aria-label="حذف ${article.title}"
                      >
                        ${raw(icon("trash", { size: 16 }))}
                      </button>
                    </div>
                  </td>
                </tr>
              `);
            })}
          </tbody>
        </table>
      </div>
    `.toString();

    toolbar.setSummary(
      `${toPersianDigits(articles.length)} مقاله نمایش داده می‌شود`,
    );
  }

  /* -------------------------------------------------------------------------
     Article modal
     ------------------------------------------------------------------------- */

  function openArticleModal(existing) {
    const isEdit = Boolean(existing);

    const dialog = modal({
      title: isEdit ? "ویرایش مقاله" : "مقاله جدید",
      size: "lg",
      body: html`
        <form class="form-grid form-grid--2" data-article-form novalidate>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="ar-title"
              >عنوان <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="ar-title"
              name="title"
              value="${existing?.title || ""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-slug">نشانی (slug)</label>
            <input
              class="input"
              id="ar-slug"
              name="slug"
              value="${existing?.slug || ""}"
              placeholder="vitamin-d-guide"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-tag">موضوع</label>
            <select class="select" id="ar-tag" name="tag">
              ${tags
                .filter((tag) => tag.id !== "all")
                .map((tag) =>
                  raw(html`
                    <option
                      value="${tag.id}"
                      ${existing?.tag === tag.id ? "selected" : ""}
                    >
                      ${tag.title}
                    </option>
                  `),
                )}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="ar-author">نویسنده</label>
            <input
              class="input"
              id="ar-author"
              name="author"
              value="${existing?.author || "تیم محتوای دارومیکس"}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-role">سمت نویسنده</label>
            <input
              class="input"
              id="ar-role"
              name="authorRole"
              value="${existing?.authorRole || "کارشناس سلامت"}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-minutes"
              >زمان مطالعه (دقیقه)</label
            >
            <input
              class="input"
              id="ar-minutes"
              name="readingMinutes"
              type="number"
              inputmode="numeric"
              value="${existing?.readingMinutes || 5}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-shape">شکل تصویر</label>
            <select class="select" id="ar-shape" name="shape">
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
            <label class="field__label" for="ar-tone">رنگ تصویر</label>
            <select class="select" id="ar-tone" name="tone">
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
            <label class="field__label" for="ar-excerpt"
              >خلاصه <span class="field__required">*</span></label
            >
            <textarea class="textarea" id="ar-excerpt" name="excerpt" rows="2">
${existing?.excerpt || ""}</textarea
            >
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="ar-body"
              >متن مقاله
              <span class="field__hint"
                >هر پاراگراف را با یک خط خالی جدا کنید</span
              ></label
            >
            <textarea class="textarea" id="ar-body" name="body" rows="7">
${(existing?.body || []).join("\n\n")}</textarea
            >
          </div>

          <div class="row row--sm" style="grid-column:1/-1">
            <label class="switch">
              <input
                type="checkbox"
                name="featured"
                ${existing?.featured ? "checked" : ""}
              />
              <span class="switch__track"></span>
              <span>مقاله ویژه</span>
            </label>

            <label class="switch">
              <input
                type="checkbox"
                name="draft"
                ${existing?.draft ? "checked" : ""}
              />
              <span class="switch__track"></span>
              <span>ذخیره به‌عنوان پیش‌نویس</span>
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
        `<button class="btn btn--primary" type="button" data-save-article>${isEdit ? "ذخیره تغییرات" : "انتشار مقاله"}</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-article]")) return;

      const form = qs("[data-article-form]", dialog.node);
      const errorSlot = qs("[data-form-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      if (!value("title") || !value("excerpt")) {
        errorSlot.hidden = false;
        errorSlot.textContent = "عنوان و خلاصه مقاله الزامی است.";
        return;
      }

      errorSlot.hidden = true;

      const payload = {
        title: value("title"),
        slug:
          value("slug") ||
          value("title")
            .replace(/\s+/g, "-")
            .replace(/[^\w\u0600-\u06FF-]/g, "")
            .toLowerCase(),
        tag: value("tag"),
        author: value("author"),
        authorRole: value("authorRole"),
        readingMinutes: Number(value("readingMinutes")) || 5,
        shape: value("shape"),
        tone: value("tone"),
        excerpt: value("excerpt"),
        body: value("body")
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
        featured: Boolean(qs('[name="featured"]', form)?.checked),
        draft: Boolean(qs('[name="draft"]', form)?.checked),
      };

      if (isEdit) blog.updateArticle(existing.id, payload);
      else blog.createArticle(payload);

      dialog.close();
      toast.success(
        isEdit ? "مقاله به‌روزرسانی شد" : "مقاله ایجاد شد",
        payload.title,
      );
      renderTable();
    });
  }

  /* -------------------------------------------------------------------------
     Mount
     ------------------------------------------------------------------------- */

  content.append(toolbar.node, tagBar, tableHost);
  renderTable();

  const layout = adminLayout({
    title: "مدیریت محتوا",
    subtitle:
      "مدیریت مقالات مجله سلامت؛ ایجاد، ویرایش، انتشار و بررسی تعامل مخاطبان.",
    iconName: "bookmark",
    stats: headerStats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-new-article]", (event) => {
      event.preventDefault();
      openArticleModal(null);
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-tag]", (event, button) => {
      event.preventDefault();
      const tag = button.dataset.tag;

      tagBar
        .querySelectorAll("[data-tag]")
        .forEach((chip) => chip.classList.toggle("is-active", chip === button));

      updateQuery({ tag: tag === "all" ? null : tag });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-edit-article]", (event, button) => {
      event.preventDefault();
      const article = blog.getArticleById(button.dataset.editArticle);
      if (article) openArticleModal(article);
    }),
  );

  disposers.push(
    delegate(
      content,
      "click",
      "[data-delete-article]",
      async (event, button) => {
        event.preventDefault();

        const article = blog.getArticleById(button.dataset.deleteArticle);
        const ok = await confirmDialog({
          title: "حذف مقاله",
          message: `مقاله «${article?.title}» حذف شود؟ این کار روی داده‌های محلی اثر می‌گذارد.`,
          confirmLabel: "حذف کن",
          danger: true,
        });

        if (!ok) return;

        blog.deleteArticle(button.dataset.deleteArticle);
        toast.info("مقاله حذف شد", article?.title);
        renderTable();
      },
    ),
  );

  return {
    node: layout.node,
    title: "مدیریت محتوا",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

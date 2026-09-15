/**
 * DARUMIX — health magazine index.
 *
 * Tag filtering and paging live in the URL, so a filtered list is shareable —
 * the same pattern the catalog uses.
 */

import { html, raw, el, qs, delegate, on, debounce } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { articleArt } from "../ui/product-art.js";
import { to, updateQuery } from "../core/router.js";
import { toPersianDigits, formatDate } from "../core/format.js";
import {
  breadcrumbs,
  emptyState,
  pageIntro,
  pagination,
} from "../ui/components/common.js";
import * as blog from "../services/blog.js";

/** One article card — the magazine's only repeated unit. */
function articleCard(article) {
  const tag = blog.tags().find((entry) => entry.id === article.tag);
  const stats = blog.articleStats(article);

  const node = el("article", { class: "article-card glass radius-xl" });
  node.innerHTML = html`
    <a
      class="article-card__media"
      href="${to(`/magazine/${article.slug}`)}"
      aria-label="${article.title}"
    >
      ${raw(articleArt(article))}
      ${tag
        ? html`<span class="badge badge--glass article-card__tag"
            >${tag.title}</span
          >`
        : ""}
      ${article.featured
        ? html`<span class="badge badge--gold article-card__feat"
            >${raw(icon("crown", { size: 12 }))} ویژه</span
          >`
        : ""}
    </a>

    <div class="article-card__body">
      <h2 class="article-card__title clamp-2">
        <a href="${to(`/magazine/${article.slug}`)}">${article.title}</a>
      </h2>
      <p class="article-card__excerpt clamp-3">${article.excerpt}</p>

      <div class="article-card__foot">
        <span>${article.author}</span>
        <span>${blog.readingLabel(article)}</span>
      </div>

      <div class="article-card__stats">
        <span
          >${raw(icon("eye", { size: 14 }))}
          ${toPersianDigits(stats.views)}</span
        >
        <span
          >${raw(icon("heart", { size: 14 }))}
          ${toPersianDigits(stats.likes)}</span
        >
        <span>${formatDate(article.date)}</span>
      </div>
    </div>
  `.toString();

  return { node };
}

export default async function magazinePage({ query = {} }) {
  const node = el("div");
  const disposers = [];

  const tags = blog.tags();
  const activeTag = query.tag || "all";
  const search = query.q || "";
  const result = blog.list({
    tag: activeTag,
    q: search,
    page: Number(query.page) || 1,
    perPage: 6,
  });

  const popular = blog.allArticles().slice(0, 4);
  const featured = blog.featured(1)[0];

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([{ label: "خانه", href: "/" }, { label: "مجله سلامت" }]),
      )}
      ${raw(
        pageIntro({
          title: "مجله سلامت دارومیکس",
          text: "مقالات کاربردی درباره پیشگیری، تغذیه، دارو و سبک زندگی سالم — نوشته‌شده و بازبینی‌شده توسط کارشناسان سلامت.",
        }),
      )}

      <!-- ===================== Toolbar ===================== -->
      <div class="magazine-toolbar glass radius-lg">
        <form class="input-icon grow" data-mag-search role="search">
          ${raw(icon("search", { size: 17 }))}
          <label class="visually-hidden" for="mag-q">جستجو در مقالات</label>
          <input
            class="input"
            id="mag-q"
            type="search"
            name="q"
            placeholder="جستجو در مقالات…"
            value="${search}"
            autocomplete="off"
          />
        </form>

        <span class="fs-sm text-soft"
          >${toPersianDigits(result.total)} مقاله</span
        >
      </div>

      <!-- ===================== Tag filter ===================== -->
      <div class="chip-row mt-4" data-slot="tags">
        <a
          class="chip${activeTag === "all" ? " is-active" : ""}"
          href="${to("/magazine")}"
          >همه موضوع‌ها</a
        >
        ${tags
          .filter((tag) => tag.id !== "all")
          .map((tag) =>
            raw(html`
              <a
                class="chip${activeTag === tag.id ? " is-active" : ""}"
                href="${to("/magazine", { tag: tag.id })}"
                >${tag.title}</a
              >
            `),
          )}
      </div>

      <!-- ===================== Featured ===================== -->
      ${featured && result.page === 1 && !search
        ? html`
            <section class="section section--tight">
              <article class="article-feature glass-2 radius-xl">
                <a
                  class="article-feature__media"
                  href="${to(`/magazine/${featured.slug}`)}"
                  aria-label="${featured.title}"
                >
                  ${raw(articleArt(featured))}
                </a>
                <div class="article-feature__body">
                  <span class="badge badge--gold"
                    >${raw(icon("crown", { size: 13 }))} مقاله ویژه</span
                  >
                  <h2 class="article-feature__title">
                    <a href="${to(`/magazine/${featured.slug}`)}"
                      >${featured.title}</a
                    >
                  </h2>
                  <p class="text-muted">${featured.excerpt}</p>
                  <div class="row row--sm fs-xs text-soft">
                    <span>${featured.author}</span>
                    <span>•</span>
                    <span>${blog.readingLabel(featured)}</span>
                    <span>•</span>
                    <span>${formatDate(featured.date)}</span>
                  </div>
                  <a
                    class="btn btn--primary mt-6"
                    href="${to(`/magazine/${featured.slug}`)}"
                  >
                    خواندن مقاله ${raw(icon("arrowLeft", { size: 16 }))}
                  </a>
                </div>
              </article>
            </section>
          `
        : ""}

      <!-- ===================== Grid ===================== -->
      <section class="section section--tight">
        <div data-slot="grid"></div>
        <div data-slot="pagination"></div>
      </section>

      <!-- ===================== Popular ===================== -->
      ${popular.length
        ? html`
            <section class="section">
              <div class="glass-2 radius-xl p-6">
                <h2 class="mb-4">
                  ${raw(icon("trendingUp", { size: 20 }))} پربازدیدترین مقالات
                </h2>
                <div class="stack" data-slot="popular"></div>
              </div>
            </section>
          `
        : ""}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Grid
     ------------------------------------------------------------------------- */

  const gridSlot = qs('[data-slot="grid"]', node);

  if (!result.items.length) {
    gridSlot.append(
      emptyState({
        iconName: "bookmark",
        title: "مقاله‌ای با این مشخصات پیدا نشد",
        text: search
          ? `برای عبارت «${search}» نتیجه‌ای نداشتیم. عبارت دیگری را امتحان کنید.`
          : "در این موضوع هنوز مقاله‌ای منتشر نشده است.",
        action: {
          label: "همه مقالات",
          variant: "btn--primary",
          href: "/magazine",
        },
      }).node,
    );
  } else {
    const grid = el("div", { class: "auto-grid auto-grid--wide" });
    result.items.forEach((article) => grid.append(articleCard(article).node));
    gridSlot.append(grid);
  }

  /* -------------------------------------------------------------------------
     Pagination
     ------------------------------------------------------------------------- */

  const paginationSlot = qs('[data-slot="pagination"]', node);

  if (result.pages > 1) {
    const pager = pagination({
      page: result.page,
      pages: result.pages,
      onChange: (page) => {
        updateQuery({ page: String(page) }, { resetPage: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
    paginationSlot.append(pager.node);
    disposers.push(pager.cleanup);
  }

  /* -------------------------------------------------------------------------
     Popular list
     ------------------------------------------------------------------------- */

  const popularSlot = qs('[data-slot="popular"]', node);

  if (popularSlot) {
    popular.forEach((article, index) => {
      const entry = el("a", {
        class: "rank-row",
        href: to(`/magazine/${article.slug}`),
      });
      entry.innerHTML = html`
        <span class="rank-row__num">${toPersianDigits(index + 1)}</span>
        <span class="grow">
          <span class="rank-row__title clamp-1">${article.title}</span>
          <span class="fs-xs text-soft"
            >${blog.readingLabel(article)} ·
            ${toPersianDigits(blog.articleStats(article).views)} بازدید</span
          >
        </span>
        ${raw(icon("chevronLeft", { size: 16 }))}
      `.toString();
      popularSlot.append(entry);
    });
  }

  /* -------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------- */

  const runSearch = debounce((term) => {
    updateQuery({ q: term || null });
  }, 420);

  disposers.push(
    on(qs("[data-mag-search] input", node), "input", (event) => {
      runSearch(event.target.value.trim());
    }),
  );

  disposers.push(
    delegate(node, "submit", "[data-mag-search]", (event) => {
      event.preventDefault();
    }),
  );

  return {
    node,
    title: search ? `جستجو: ${search}` : "مجله سلامت",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

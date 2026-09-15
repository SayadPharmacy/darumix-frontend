/**
 * DARUMIX — magazine article detail.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { articleArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import { toPersianDigits, formatDate } from "../core/format.js";
import {
  breadcrumbs,
  emptyState,
  sectionHead,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import { copyText } from "../core/dom.js";
import * as blog from "../services/blog.js";
import * as catalogService from "../services/catalog.js";

export default async function articlePage({ params = {} }) {
  const node = el("div");
  const disposers = [];

  const article = blog.getArticle(params.slug);

  /* -------------------------------------------------------------------------
     Not found
     ------------------------------------------------------------------------- */
  if (!article) {
    node.innerHTML = html`
      <div class="shell">
        ${raw(
          breadcrumbs([
            { label: "خانه", href: "/" },
            { label: "مجله سلامت", href: "/magazine" },
            { label: "مقاله یافت نشد" },
          ]),
        )}
        <div data-slot="missing" class="mt-8"></div>
      </div>
    `.toString();

    qs('[data-slot="missing"]', node).append(
      emptyState({
        iconName: "bookmark",
        title: "این مقاله پیدا نشد",
        text: "مکن است این مقاله حذف شده یا نشانی آن تغییر کرده باشد.",
        action: {
          label: "بازگشت به مجله",
          variant: "btn--primary",
          href: "/magazine",
        },
      }).node,
    );

    return { node, title: "مقاله یافت نشد", cleanup: () => {} };
  }

  const tag = blog.tags().find((entry) => entry.id === article.tag);
  const related = blog.related(article, 3);
  const stats = blog.articleStats(article);
  const body = article.body || [];

  /* Related products — a soft cross-sell driven by the article's own tag. */
  const suggestedProducts = catalogService
    .allProducts()
    .filter(
      (product) => product.tags?.includes(article.tag) || product.featured,
    )
    .slice(0, 4);

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "مجله سلامت", href: "/magazine" },
          { label: article.title },
        ]),
      )}

      <article class="article">
        <header class="article__header">
          ${tag
            ? html`<a
                class="badge badge--brand"
                href="${to("/magazine", { tag: tag.id })}"
                >${tag.title}</a
              >`
            : ""}

          <h1 class="article__title">${article.title}</h1>
          <p class="article__lead">${article.excerpt}</p>

          <div class="article__meta">
            <span class="article__author">
              <span class="article__avatar"
                >${raw(icon("user", { size: 18 }))}</span
              >
              <span>
                <span class="fw-semibold">${article.author}</span>
                <span class="fs-xs text-soft"
                  >${article.authorRole || "کارشناس سلامت"}</span
                >
              </span>
            </span>

            <span class="article__meta-item"
              >${raw(icon("calendar", { size: 15 }))}
              ${formatDate(article.date)}</span
            >
            <span class="article__meta-item"
              >${raw(icon("clock", { size: 15 }))}
              ${blog.readingLabel(article)}</span
            >
            <span class="article__meta-item"
              >${raw(icon("eye", { size: 15 }))} ${toPersianDigits(stats.views)}
              بازدید</span
            >
          </div>
        </header>

        <div class="article__cover glass radius-xl">
          ${raw(articleArt(article))}
        </div>

        <div class="article-layout">
          <!-- ===================== Body ===================== -->
          <div class="article__body prose" data-slot="body"></div>

          <!-- ===================== Aside ===================== -->
          <aside class="article__aside">
            <div class="glass radius-xl p-6">
              <h3 class="mb-4">خلاصه مقاله</h3>
              <div class="stack stack--sm fs-sm">
                <div class="summary-row">
                  <span>موضوع</span>
                  <span>${tag?.title || "سلامت"}</span>
                </div>
                <div class="summary-row">
                  <span>زمان مطالعه</span>
                  <span>${toPersianDigits(article.readingMinutes)} دقیقه</span>
                </div>
                <div class="summary-row">
                  <span>نویسنده</span>
                  <span>${article.author}</span>
                </div>
              </div>

              <div class="row row--sm mt-4">
                <button
                  class="btn btn--glass btn--sm grow"
                  type="button"
                  data-copy-link
                >
                  ${raw(icon("copy", { size: 15 }))} کپی لینک
                </button>
                <button
                  class="btn btn--glass btn--sm grow"
                  type="button"
                  data-bookmark
                >
                  ${raw(icon("bookmark", { size: 15 }))} ذخیره
                </button>
              </div>
            </div>

            <div class="glass radius-xl p-6">
              <h3 class="mb-4">مقالات مرتبط</h3>
              <div class="stack stack--sm" data-slot="related"></div>
            </div>
          </aside>
        </div>
      </article>

      <!-- ===================== Suggested products ===================== -->
      ${suggestedProducts.length
        ? html`
            <section class="section">
              <div class="shell">
                ${raw(
                  sectionHead({
                    title: "محصولات مرتبط با این مقاله",
                    subtitle:
                      "اگر پس از خواندن این مقاله به خرید فکر می‌کنید، این‌ها را ببینید.",
                    iconName: "bag",
                    actionHref: "/catalog",
                    actionLabel: "فروشگاه",
                  }),
                )}
                <div class="auto-grid" data-slot="products"></div>
              </div>
            </section>
          `
        : ""}

      <!-- ===================== Medical disclaimer ===================== -->
      <section class="section section--tight">
        <div class="alert alert--info">
          ${raw(icon("info", { size: 18 }))}
          <span
            >این مطلب جنبه آموزشی دارد و جایگزین تشخیص یا توصیه پزشک نیست. پیش
            از تغییر رژیم دارویی خود با پزشک یا داروساز مشورت کنید.</span
          >
        </div>
      </section>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Body paragraphs
     ------------------------------------------------------------------------- */

  const bodySlot = qs('[data-slot="body"]', node);

  if (body.length) {
    bodySlot.innerHTML = body
      .map((paragraph) => {
        // A leading "## " in the fixture marks a section heading.
        if (typeof paragraph === "string" && paragraph.startsWith("## ")) {
          return html`<h2>${paragraph.slice(3)}</h2>`.toString();
        }

        return html`<p>${paragraph}</p>`.toString();
      })
      .join("");
  } else {
    bodySlot.innerHTML = html`<p class="text-muted">
      متن این مقاله در دسترس نیست.
    </p>`.toString();
  }

  /* -------------------------------------------------------------------------
     Related articles
     ------------------------------------------------------------------------- */

  const relatedSlot = qs('[data-slot="related"]', node);

  related.forEach((entry) => {
    const link = el("a", {
      class: "mini-article",
      href: to(`/magazine/${entry.slug}`),
    });
    link.innerHTML = html`
      <span class="mini-article__media">${raw(articleArt(entry))}</span>
      <span class="grow">
        <span class="mini-article__title clamp-2">${entry.title}</span>
        <span class="fs-xs text-soft">${blog.readingLabel(entry)}</span>
      </span>
    `.toString();
    relatedSlot.append(link);
  });

  /* -------------------------------------------------------------------------
     Suggested products
     ------------------------------------------------------------------------- */

  const productsSlot = qs('[data-slot="products"]', node);

  if (productsSlot) {
    // Imports are kept local so a reader who never scrolls this far pays nothing.
    const { productCard } = await import("../ui/components/common.js");
    const cart = await import("../services/cart.js");
    const account = await import("../services/account.js");

    suggestedProducts.forEach((product) => {
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

      productsSlot.append(card.node);
      disposers.push(card.cleanup);
    });
  }

  /* -------------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-copy-link]", async (event) => {
      event.preventDefault();
      const url = `${window.location.origin}${window.location.pathname}${to(`/magazine/${article.slug}`)}`;
      const ok = await copyText(url);
      toast[ok ? "success" : "error"](
        ok ? "لینک کپی شد" : "کپی نشد",
        ok
          ? "می‌توانید لینک مقاله را برای دیگران بفرستید."
          : "مرورگر اجازه کپی نداد.",
      );
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-bookmark]", (event, button) => {
      event.preventDefault();
      button.classList.toggle("is-active");
      toast.success(
        button.classList.contains("is-active")
          ? "مقاله ذخیره شد"
          : "از ذخیره‌ها حذف شد",
        article.title,
      );
    }),
  );

  return {
    node,
    title: article.title,
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

/**
 * DARUMIX — magazine (blog) service.
 */

import {
  articles,
  articleBySlug,
  articleTags,
  relatedArticles,
} from "../data/articles.js";
import { slices, commit } from "../core/store.js";
import { seeds } from "../data/seeds.js";

/* ---------------------------------------------------------------------------
   Admin overrides (content management)
   --------------------------------------------------------------------------- */

function overrides() {
  return slices.catalogOverrides.get() || {};
}

function removedIds() {
  return new Set(overrides().deleted?.articles || []);
}

function addedArticles() {
  return overrides().added?.articles || [];
}

function patchOf(id) {
  return overrides().articles?.[id] || null;
}

/** Every article including admin edits, newest first. */
export function allArticles() {
  const removed = removedIds();

  return [...addedArticles(), ...articles]
    .filter((article) => !removed.has(article.id))
    .map((article) => {
      const patch = patchOf(article.id);
      return patch ? { ...article, ...patch } : article;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getArticle(slug) {
  if (!slug) return null;

  const base = articleBySlug.get(slug);
  if (base && !removedIds().has(base.id)) {
    const patch = patchOf(base.id);
    return patch ? { ...base, ...patch } : base;
  }

  return allArticles().find((article) => article.slug === slug) || null;
}

export function getArticleById(id) {
  return allArticles().find((article) => article.id === id) || null;
}

export function tags() {
  return articleTags;
}

export function featured(limit = 3) {
  return allArticles()
    .filter((article) => article.featured)
    .slice(0, limit);
}

export function latest(limit = 6) {
  return allArticles().slice(0, limit);
}

/**
 * Filter and paginate articles.
 * @param {{tag?: string, q?: string, page?: number, perPage?: number}} [options]
 */
export function list(options = {}) {
  const { tag = "all", q = "", page = 1, perPage = 6 } = options;
  const needle = String(q).trim().toLowerCase();

  let matched = allArticles();

  if (tag && tag !== "all") {
    matched = matched.filter((article) => article.tag === tag);
  }

  if (needle) {
    matched = matched.filter((article) =>
      [article.title, article.excerpt, article.author]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;

  return {
    items: matched.slice(start, start + perPage),
    total,
    page: safePage,
    pages,
    perPage,
  };
}

export function related(article, limit = 3) {
  return relatedArticles(article, limit);
}

/** Estimated reading time label. */
export function readingLabel(article) {
  return `${article?.readingMinutes || 5} دقیقه مطالعه`;
}

/* ---------------------------------------------------------------------------
   Admin mutations
   --------------------------------------------------------------------------- */

function writeOverrides(next) {
  slices.catalogOverrides.set(next);
  commit("catalogOverrides");
}

export function createArticle(payload) {
  const current = overrides();
  const next = {
    ...current,
    added: {
      ...(current.added || {}),
      articles: [
        {
          id: `a-${Date.now()}`,
          slug: payload.slug || `article-${Date.now()}`,
          title: payload.title || "مقاله بدون عنوان",
          excerpt: payload.excerpt || "",
          body: payload.body ? String(payload.body).split(/\n{2,}/) : [],
          tag: payload.tag || "prevention",
          author: payload.author || "تیم محتوای دارومیکس",
          authorRole: payload.authorRole || "کارشناس سلامت",
          date: new Date().toISOString(),
          readingMinutes: Number(payload.readingMinutes) || 5,
          shape: payload.shape || "leaf",
          tone: payload.tone || "emerald",
          featured: Boolean(payload.featured),
          draft: Boolean(payload.draft),
        },
        ...(current.added?.articles || []),
      ],
    },
  };

  writeOverrides(next);
  return next.added.articles[0];
}

export function updateArticle(id, patch) {
  const current = overrides();

  // Admin-added articles are edited in place; seeded ones become an overlay.
  const addedList = current.added?.articles || [];
  const isAdded = addedList.some((article) => article.id === id);

  const next = isAdded
    ? {
        ...current,
        added: {
          ...(current.added || {}),
          articles: addedList.map((article) =>
            article.id === id ? { ...article, ...patch } : article,
          ),
        },
      }
    : {
        ...current,
        articles: {
          ...(current.articles || {}),
          [id]: { ...(current.articles?.[id] || {}), ...patch },
        },
      };

  writeOverrides(next);
  return getArticleById(id);
}

export function deleteArticle(id) {
  const current = overrides();

  const next = {
    ...current,
    added: {
      ...(current.added || {}),
      articles: (current.added?.articles || []).filter(
        (article) => article.id !== id,
      ),
    },
    deleted: {
      ...(current.deleted || {}),
      articles: [...new Set([...(current.deleted?.articles || []), id])],
    },
  };

  writeOverrides(next);
}

/** Content KPIs for the admin dashboard. */
export function contentStats() {
  const list = allArticles();
  return {
    total: list.length,
    featured: list.filter((article) => article.featured).length,
    drafts: list.filter((article) => article.draft).length,
    totalReadingMinutes: list.reduce(
      (total, article) => total + (article.readingMinutes || 0),
      0,
    ),
    lastPublished: list[0]?.date || null,
    byTag: articleTags
      .filter((tag) => tag.id !== "all")
      .map((tag) => ({
        ...tag,
        count: list.filter((article) => article.tag === tag.id).length,
      })),
  };
}

/** Fake view/engagement statistics per article (deterministic). */
export function articleStats(article) {
  if (!article) return { views: 0, likes: 0, comments: 0, shares: 0 };

  return {
    views: seeds.int(`${article.id}::views`, 900, 24000),
    likes: seeds.int(`${article.id}::likes`, 40, 1400),
    comments: seeds.int(`${article.id}::comments`, 2, 120),
    shares: seeds.int(`${article.id}::shares`, 5, 320),
  };
}

export default {
  allArticles,
  getArticle,
  getArticleById,
  tags,
  featured,
  latest,
  list,
  related,
  readingLabel,
  createArticle,
  updateArticle,
  deleteArticle,
  contentStats,
  articleStats,
};

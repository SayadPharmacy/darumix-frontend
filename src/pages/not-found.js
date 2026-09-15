/**
 * DARUMIX — 404 page.
 *
 * Registered implicitly by the router: any path that matches no route lands
 * here (see core/router.js → `render`).
 */

import { html, raw, el, qs } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import { emptyState } from "../ui/components/common.js";

export default async function notFoundPage({ params = {} } = {}) {
  const node = el("div");
  const path = window.location.hash || to(params.rest || "/");

  node.innerHTML = html`
    <div class="shell shell--narrow">
      <div class="not-found">
        <span class="not-found__code">۴۰۴</span>
        <h1 class="not-found__title">این صفحه پیدا نشد</h1>
        <p class="text-muted">
          نشانی‌ای که باز کردید در دارومیکس وجود ندارد یا جابه‌جا شده است.
        </p>

        <div class="order-code mt-6" style="max-width:100%;overflow:hidden">
          <span class="fs-xs text-soft">نشانی درخواستی</span>
          <code class="fs-sm">${path}</code>
        </div>

        <div class="row mt-8" style="justify-content:center">
          <a class="btn btn--primary" href="${to("/")}">
            ${raw(icon("home", { size: 18 }))} بازگشت به خانه
          </a>
          <a class="btn btn--glass" href="${to("/catalog")}">
            ${raw(icon("bag", { size: 18 }))} مشاهده فروشگاه
          </a>
          <button class="btn btn--ghost" type="button" data-open-search>
            ${raw(icon("search", { size: 18 }))} جستجو
          </button>
        </div>

        <div class="mt-10" data-slot="suggestions"></div>
      </div>
    </div>
  `.toString();

  // A few real links are far more useful than a dead end.
  qs('[data-slot="suggestions"]', node).append(
    emptyState({
      iconName: "compass",
      title: "شاید یکی از این‌ها را می‌خواستید",
      text: "پرفروش‌ترین دسته‌بندی‌ها و خدمات دارومیکس:",
      action: {
        label: "دسته‌بندی‌ها",
        variant: "btn--glass",
        href: "/categories",
      },
    }).node,
  );

  const quickLinks = el("div", { class: "chip-row mt-4" });
  quickLinks.style.justifyContent = "center";
  quickLinks.innerHTML = html`
    <a class="chip" href="${to("/catalog?sort=popular")}">پرفروش‌ترین‌ها</a>
    <a class="chip" href="${to("/catalog?sale=1")}">تخفیف‌دارها</a>
    <a class="chip" href="${to("/prescription")}">ثبت نسخه</a>
    <a class="chip" href="${to("/consultation")}">مشاوره داروساز</a>
    <a class="chip" href="${to("/faq")}">سوالات متداول</a>
    <a class="chip" href="${to("/contact")}">تماس با ما</a>
  `.toString();

  qs('[data-slot="suggestions"]', node).append(quickLinks);

  return {
    node,
    title: "صفحه یافت نشد",
    cleanup: () => {},
  };
}

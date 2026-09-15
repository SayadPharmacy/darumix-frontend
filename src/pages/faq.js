/**
 * DARUMIX — FAQ page.
 *
 * Answers live in one array so they can be filtered by category and reused as
 * structured data for SEO without duplicating the copy.
 */

import { html, raw, el, qs, delegate, on, debounce } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import { toPersianDigits } from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  emptyState,
  accordion,
} from "../ui/components/common.js";

/** Grouped Q&A. `category` drives the filter chips. */
const FAQ_GROUPS = [
  {
    id: "orders",
    title: "سفارش و ارسال",
    icon: "truck",
    items: [
      {
        q: "سفارش من چه زمانی ارسال می‌شود؟",
        a: "سفارش‌های ثبت‌شده تا ساعت ۱۴ در همان روز ارسال می‌شوند. برای سایر سفارش‌ها، ارسال در اولین روز کاری بعد انجام می‌گیرد. زمان تقریبی تحویل در صفحه تسویه حساب نمایش داده می‌شود.",
      },
      {
        q: "هزینه ارسال چقدر است؟",
        a: "هزینه ارسال بر اساس روش انتخابی محاسبه می‌شود؛ ارسال پستی ۳۵٬۰۰۰ تومان و ارسال سریع با پیک ۴۹٬۰۰۰ تومان است. برای سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان ارسال رایگان است.",
      },
      {
        q: "چطور سفارش خود را پیگیری کنم؟",
        a: "از بخش «سفارش‌های من» در حساب کاربری، وضعیت هر سفارش و مراحل آماده‌سازی و ارسال آن قابل مشاهده است. در صورت ارسال، کد رهگیری پستی نیز نمایش داده می‌شود.",
      },
      {
        q: "امکان تحویل حضوری وجود دارد؟",
        a: "بله. در مرحله انتخاب روش ارسال، گزینه «تحویل حضوری از داروخانه» را انتخاب کنید تا سفارش آماده و در شعبه منتظر شما باشد.",
      },
    ],
  },
  {
    id: "prescription",
    title: "نسخه و دارو",
    icon: "prescription",
    items: [
      {
        q: "چطور نسخه الکترونیکی ثبت کنم؟",
        a: "در صفحه «ثبت نسخه الکترونیکی»، تصویر یا فایل PDF نسخه را بارگذاری کنید و اطلاعات تکمیلی را پر کنید. داروساز نسخه را بررسی می‌کند و نتیجه را به شما اطلاع می‌دهد.",
      },
      {
        q: "داروی نیازمند نسخه را می‌توانم بدون نسخه بخرم؟",
        a: "خیر. داروهای دارای نشان «نیازمند نسخه» تنها پس از بررسی و تأیید نسخه معتبر توسط داروساز قابل تهیه هستند.",
      },
      {
        q: "برای مشاوره دارویی باید هزینه پرداخت کنم؟",
        a: "مشاوره داروساز در دارومیکس رایگان است. می‌توانید از صفحه «مشاوره داروساز» زمان دلخواه خود را رزرو کنید.",
      },
    ],
  },
  {
    id: "account",
    title: "حساب کاربری",
    icon: "user",
    items: [
      {
        q: "آیا برای خرید باید ثبت‌نام کنم؟",
        a: "در این نسخه نمایشی، یک حساب محلی به‌صورت خودکار در مرورگر شما ساخته می‌شود و می‌توانید بلافاصله خرید کنید. هیچ ثبت‌نام یا ورود واقعی انجام نمی‌شود.",
      },
      {
        q: "اطلاعات من کجا ذخیره می‌شود؟",
        a: "همه داده‌ها فقط در حافظه محلی مرورگر خود شما (localStorage) ذخیره می‌شوند. هیچ اطلاعاتی به سروری ارسال نمی‌گردد و با پاک کردن داده‌های مرورگر حذف می‌شود.",
      },
      {
        q: "چطور سفارش‌های قبلی را ببینم؟",
        a: "از حساب کاربری → «سفارش‌های من» می‌توانید فهرست سفارش‌ها را ببینید و جزئیات هر سفارش، اقلام و وضعیت آن را مشاهده کنید.",
      },
    ],
  },
  {
    id: "returns",
    title: "مرجوعی و تضمین",
    icon: "rotate",
    items: [
      {
        q: "شرایط بازگشت کالا چیست؟",
        a: "کالاهای غیر دارویی تا ۷ روز پس از تحویل، در صورت باز نشدن بسته‌بندی، قابل بازگشت هستند. داروها به دلیل ملاحظات بهداشتی و قانونی قابل بازگشت نیستند، مگر در صورت مغایرت یا ایراد کالا.",
      },
      {
        q: "اگر کالای اشتباهی دریافت کنم چه کنم؟",
        a: "از بخش تماس با ما موضوع را اطلاع دهید. پس از بررسی، کالای صحیح برای شما ارسال و هزینه‌ها بدون دریافت از شما اصلاح می‌شود.",
      },
      {
        q: "اصالت کالا چگونه تضمین می‌شود؟",
        a: "همه محصولات دارومیکس از تأمین‌کنندگان رسمی و دارای مجوز تهیه می‌شوند و با تاریخ انقضای معتبر و شرایط نگهداری استاندارد عرضه می‌گردند.",
      },
    ],
  },
];

export default async function faqPage({ query = {} } = {}) {
  const node = el("div");
  const disposers = [];

  const categories = FAQ_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    icon: group.icon,
    count: group.items.length,
  }));

  const activeCategory = query.category || "all";
  const search = query.q || "";

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([{ label: "خانه", href: "/" }, { label: "سوالات متداول" }]),
      )}
      ${raw(
        pageIntro({
          title: "سوالات متداول",
          text: "پاسخ پرتکرارترین پرسش‌های مشتریان دارومیکس درباره سفارش، نسخه، حساب کاربری و مرجوعی کالا.",
        }),
      )}

      <!-- ===================== Help banner ===================== -->
      <div class="promo-band glass--brand mb-8">
        <div>
          <h2 class="promo-band__title">پاسخ سوال خود را پیدا نکردید؟</h2>
          <p class="promo-band__text">
            کارشناسان پشتیبانی دارومیکس هر روز از ۸ صبح تا ۱۰ شب پاسخگوی شما
            هستند. همچنین می‌توانید وقت مشاوره داروساز بگیرید.
          </p>
          <div class="row mt-6">
            <a class="btn btn--glass btn--lg" href="${to("/contact")}">
              ${raw(icon("phone", { size: 18 }))} تماس با پشتیبانی
            </a>
            <a
              class="btn btn--ghost btn--lg"
              href="${to("/consultation")}"
              style="color:#f4fffb"
            >
              ${raw(icon("stethoscope", { size: 18 }))} مشاوره داروساز
            </a>
          </div>
        </div>
        <div class="promo__art">
          <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="42"
              stroke="currentColor"
              stroke-width="4"
              opacity="0.4"
            />
            <path
              d="M46 58c0-8 25-8 25 0s-25 8-25 0"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              d="M60 82v10"
              stroke="currentColor"
              stroke-width="5"
              stroke-linecap="round"
            />
            <circle cx="60" cy="42" r="5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <!-- ===================== Search + chips ===================== -->
      <div class="glass radius-lg p-6">
        <form class="input-icon" data-faq-search role="search">
          ${raw(icon("search", { size: 17 }))}
          <label class="visually-hidden" for="faq-q">جستجو در سوالات</label>
          <input
            class="input"
            id="faq-q"
            type="search"
            name="q"
            placeholder="سوال خود را بنویسید… مثلاً: هزینه ارسال"
            value="${search}"
            autocomplete="off"
          />
        </form>

        <div class="chip-row mt-4">
          <a
            class="chip${activeCategory === "all" ? " is-active" : ""}"
            href="${to("/faq")}"
            >همه موضوع‌ها</a
          >
          ${categories.map((entry) =>
            raw(html`
              <a
                class="chip${activeCategory === entry.id ? " is-active" : ""}"
                href="${to("/faq", { category: entry.id })}"
                >${entry.title}
                <span class="chip__count"
                  >${toPersianDigits(entry.count)}</span
                ></a
              >
            `),
          )}
        </div>
      </div>

      <!-- ===================== Questions ===================== -->
      <div class="section" data-slot="groups"></div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Filter
     ------------------------------------------------------------------------- */

  const needle = search.trim().toLowerCase();

  const visibleGroups = FAQ_GROUPS.filter(
    (group) => activeCategory === "all" || group.id === activeCategory,
  )
    .map((group) => ({
      ...group,
      items: needle
        ? group.items.filter((item) =>
            `${item.q} ${item.a}`.toLowerCase().includes(needle),
          )
        : group.items,
    }))
    .filter((group) => group.items.length);

  const groupsSlot = qs('[data-slot="groups"]', node);

  if (!visibleGroups.length) {
    const empty = emptyState({
      iconName: "help",
      title: "پاسخی برای این پرسش پیدا نشد",
      text: "می‌توانید عبارت دیگری را جستجو کنید یا با پشتیبانی دارومیکس تماس بگیرید.",
      action: {
        label: "تماس با ما",
        variant: "btn--primary",
        href: "/contact",
      },
    });
    groupsSlot.append(empty.node);
  } else {
    visibleGroups.forEach((group) => {
      const section = el("section", { class: "section section--tight" });
      section.innerHTML = html`
        <div class="section-head">
          <div class="section-head__text">
            <h2 class="section-head__title">
              ${raw(icon(group.icon, { size: 22 }))} ${group.title}
            </h2>
            <p class="section-head__sub">
              ${toPersianDigits(group.items.length)} پرسش در این بخش
            </p>
          </div>
        </div>
        <div data-slot="acc"></div>
      `.toString();

      const acc = accordion({
        items: group.items.map((item, index) => ({
          id: `${group.id}-${index}`,
          title: item.q,
          content: `<p>${item.a}</p>`,
          open: index === 0 && !needle,
        })),
        multiple: true,
      });

      qs('[data-slot="acc"]', section).append(acc.node);
      disposers.push(acc.cleanup);
      groupsSlot.append(section);
    });
  }

  /* -------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------- */

  const runSearch = debounce((term) => {
    // Filtering is client-side, so re-render through the router's query to keep
    // the URL (and the back button) honest without a full reload.
    const next = new URLSearchParams();
    if (term) next.set("q", term);
    if (activeCategory !== "all") next.set("category", activeCategory);

    const searchPart = next.toString();
    window.location.hash = `#/faq${searchPart ? `?${searchPart}` : ""}`;
  }, 400);

  disposers.push(
    on(qs("[data-faq-search] input", node), "input", (event) => {
      runSearch(event.target.value.trim());
    }),
  );

  disposers.push(
    delegate(node, "submit", "[data-faq-search]", (event) => {
      event.preventDefault();
    }),
  );

  return {
    node,
    title: "سوالات متداول",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

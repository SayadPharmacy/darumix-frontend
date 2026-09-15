/**
 * DARUMIX — about page.
 */

import { html, raw, el, qs } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { brandArt } from "../ui/product-art.js";
import { to } from "../core/router.js";
import { toPersianDigits } from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  sectionHead,
  statTile,
} from "../ui/components/common.js";
import * as catalogService from "../services/catalog.js";
import * as blog from "../services/blog.js";

const VALUES = [
  {
    icon: "shieldCheck",
    title: "اصالت بدون استثنا",
    text: "همه محصولات از تأمین‌کنندگان رسمی و دارای مجوز تهیه می‌شوند. تاریخ انقضا و شرایط نگهداری هر کالا پیش از ارسال کنترل می‌شود.",
  },
  {
    icon: "stethoscope",
    title: "داروساز در دسترس",
    text: "تیم داروسازان ما در تمام ساعات کاری پاسخگوی پرسش‌های دارویی شماست؛ از تداخل دارویی تا روش درست مصرف.",
  },
  {
    icon: "truck",
    title: "دسترسی سریع",
    text: "ارسال همان‌روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴، ارسال رایگان بالای آستانه تعیین‌شده و امکان تحویل حضوری از شعبه.",
  },
  {
    icon: "users",
    title: "شفافیت با مشتری",
    text: "قیمت‌ها و شرایط ارسال و بازگشت کالا روشن و بدون هزینه پنهان است. هر تغییری در سفارش، به شما اطلاع داده می‌شود.",
  },
];

const MILESTONES = [
  {
    year: "۱۳۹",
    title: "شروع دارومیکس",
    text: "با یک داروخانه و یک تیم کوچک داروسازی.",
  },
  {
    year: "۱۴۰",
    title: "راه‌اندازی فروش آنلاین",
    text: "ارسال به سراسر کشور و افزودن پرداخت آنلاین.",
  },
  {
    year: "۱۴۰۱",
    title: "خدمات نسخه الکترونیکی",
    text: "ثبت آنلاین نسخه و بررسی داروساز.",
  },
  {
    year: "۱۴۰۲",
    title: "مشاوره دارویی رایگان",
    text: "رزرو آنلاین زمان مشاوره با داروساز متخصص.",
  },
  {
    year: "۱۴۰۳",
    title: "شعبه‌های بیشتر",
    text: "گسترش شعبه‌های حضوری و تحویل سریع شهری.",
  },
];

export default async function aboutPage() {
  const node = el("div");

  const inventory = catalogService.inventoryStats();
  const brands = catalogService.allBrands();
  const contentStats = blog.contentStats();

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "درباره دارومیکس" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "درباره دارومیکس",
          text: "دارومیکس یک داروخانه آنلاین است که خرید دارو، مکمل و محصولات سلامت را ساده، سریع و مطمئن می‌کند. تیم داروسازان ما در تمام مراحل خرید و مصرف در کنار شماست.",
        }),
      )}

      <!-- ===================== Hero band ===================== -->
      <div class="promo-band glass--brand mb-8">
        <div>
          <h2 class="promo-band__title">سلامت شما، مسئولیت ما</h2>
          <p class="promo-band__text">
            از یک داروخانه محلی شروع کردیم و امروز با ده‌ها برند معتبر و هزاران
            محصول سلامت، در خدمت مشتریان سراسر کشور هستیم. باور ما این است که
            دسترسی به دارو و مشاوره درست، نباید سخت باشد.
          </p>
          <div class="row mt-6">
            <a class="btn btn--glass btn--lg" href="${to("/catalog")}">
              ${raw(icon("bag", { size: 18 }))} مشاهده محصولات
            </a>
            <a
              class="btn btn--ghost btn--lg"
              href="${to("/contact")}"
              style="color:#f4fffb"
            >
              ${raw(icon("phone", { size: 18 }))} تماس با ما
            </a>
          </div>
        </div>
        <div class="promo__art">
          <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <path
              d="M60 96S22 72 22 47a21 21 0 0 1 38-12 21 21 0 0 1 38 12C98 72 60 96 60 96Z"
              stroke="currentColor"
              stroke-width="4.5"
              stroke-linejoin="round"
            />
            <path
              d="M42 58h10l5-11 7 22 5-11h9"
              stroke="currentColor"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- ===================== Stats ===================== -->
      <div class="auto-grid auto-grid--wide mb-8" data-slot="stats"></div>

      <!-- ===================== Values ===================== -->
      <section class="section">
        ${raw(
          sectionHead({
            title: "ارزش‌های ما",
            subtitle: "چهار اصلی که تصمیم‌های روزمره دارومیکس را شکل می‌دهد.",
            iconName: "award",
          }),
        )}
        <div class="auto-grid auto-grid--wide" data-slot="values"></div>
      </section>

      <!-- ===================== Story timeline ===================== -->
      <section class="section">
        ${raw(
          sectionHead({
            title: "مسیر دارومیکس",
            subtitle: "از یک داروخانه محلی تا خدمات سلامت آنلاین.",
            iconName: "history",
          }),
        )}
        <ol class="timeline" data-slot="timeline"></ol>
      </section>

      <!-- ===================== Guarantees ===================== -->
      <section class="section">
        ${raw(
          sectionHead({
            title: "تعهدات ما به شما",
            subtitle: "چیزهایی که می‌توانید همیشه روی آن‌ها حساب کنید.",
            iconName: "shieldCheck",
          }),
        )}
        <div class="glass-2 radius-xl p-6" data-slot="guarantees"></div>
      </section>

      <!-- ===================== Brands ===================== -->
      <section class="section">
        ${raw(
          sectionHead({
            title: "برندهایی که با آن‌ها کار می‌کنیم",
            subtitle:
              "همکاری با برندهای شناخته‌شده داخلی و بین‌المللی حوزه سلامت.",
            iconName: "verified",
            actionHref: "/catalog",
            actionLabel: "محصولات",
          }),
        )}
        <div class="auto-grid auto-grid--tight" data-slot="brands"></div>
      </section>

      <!-- ===================== Demo notice ===================== -->
      <section class="section section--tight">
        <div class="alert alert--info">
          ${raw(icon("info", { size: 18 }))}
          <span
            >این یک پروژه نمایشی است. تمام محصولات، برندها، قیمت‌ها و آمار این
            صفحه داده‌های ساختگی هستند و هیچ ادعای تجاری یا پزشکی واقعی
            ندارند.</span
          >
        </div>
      </section>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Stats
     ------------------------------------------------------------------------- */

  const statsSlot = qs('[data-slot="stats"]', node);

  [
    statTile({
      label: "محصول فعال",
      value: toPersianDigits(inventory.total),
      iconName: "bag",
      tone: "brand",
      hint: "در دسته‌بندی‌های مختلف سلامت",
    }),
    statTile({
      label: "برند همکار",
      value: toPersianDigits(brands.length),
      iconName: "verified",
      tone: "mint",
      hint: "داخلی و بین‌المللی",
    }),
    statTile({
      label: "مقاله سلامت",
      value: toPersianDigits(contentStats.total),
      iconName: "bookmark",
      tone: "gold",
      hint: "بازبینی‌شده توسط کارشناسان",
    }),
    statTile({
      label: "رضایت مشتریان",
      value: `${toPersianDigits("۹۸")}٪`,
      iconName: "star",
      tone: "blue",
      hint: "بر اساس بازخورد نمایشی",
    }),
  ].forEach((tile) => statsSlot.append(tile));

  /* -------------------------------------------------------------------------
     Values
     ------------------------------------------------------------------------- */

  const valuesSlot = qs('[data-slot="values"]', node);

  VALUES.forEach((value) => {
    const card = el("div", { class: "feature glass radius-lg" });
    card.innerHTML = html`
      <span class="feature__icon">${raw(icon(value.icon, { size: 22 }))}</span>
      <div>
        <h3 class="feature__title">${value.title}</h3>
        <p class="feature__text">${value.text}</p>
      </div>
    `.toString();
    valuesSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Timeline
     ------------------------------------------------------------------------- */

  const timelineSlot = qs('[data-slot="timeline"]', node);

  MILESTONES.forEach((milestone, index) => {
    const item = el("li", {
      class: `timeline__item${index === MILESTONES.length - 1 ? " is-last" : ""}`,
    });
    item.innerHTML = html`
      <span class="timeline__dot" aria-hidden="true"></span>
      <span class="timeline__year">${milestone.year}</span>
      <div class="timeline__body">
        <h3 class="timeline__title">${milestone.title}</h3>
        <p class="timeline__text">${milestone.text}</p>
      </div>
    `.toString();
    timelineSlot.append(item);
  });

  /* -------------------------------------------------------------------------
     Guarantees
     ------------------------------------------------------------------------- */

  const guaranteesSlot = qs('[data-slot="guarantees"]', node);
  const guarantees = [
    "ارسال همان‌روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴",
    "ارسال رایگان بالای آستانه تعیین‌شده در سراسر کشور",
    "تضمین اصالت و تاریخ انقضای معتبر برای همه کالاها",
    "مشاوره رایگان داروساز پیش از خرید دارو",
    "امکان تحویل حضوری از شعبه‌های دارومیکس",
    "بازگشت کالای غیر دارویی تا ۷ روز در صورت باز نشدن بسته‌بندی",
  ];

  guaranteesSlot.innerHTML = html`
    <div class="auto-grid auto-grid--wide">
      ${guarantees.map((entry) =>
        raw(html`
          <div class="row row--sm">
            <span class="text-success"
              >${raw(icon("checkCircle", { size: 19 }))}</span
            >
            <span class="fs-sm">${entry}</span>
          </div>
        `),
      )}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Brands
     ------------------------------------------------------------------------- */

  const brandsSlot = qs('[data-slot="brands"]', node);

  brands.slice(0, 12).forEach((brand) => {
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

  return {
    node,
    title: "درباره دارومیکس",
    cleanup: () => {},
  };
}

/**
 * DARUMIX — homepage.
 */

import { html, raw, el, qs, delegate } from '../core/dom.js';
import { icon } from '../ui/icons.js';
import { productArt, brandArt, articleArt } from '../ui/product-art.js';
import { to, navigate } from '../core/router.js';
import { toPersianDigits } from '../core/format.js';
import { productCard, sectionHead, ratingStars, priceBlock } from '../ui/components/common.js';
import { toast } from '../ui/components/overlays.js';
import * as catalogService from '../services/catalog.js';
import * as account from '../services/account.js';
import * as blogService from '../services/blog.js';
import * as cart from '../services/cart.js';
import { appEvents, EVENTS } from '../core/event-bus.js';

/* ---------------------------------------------------------------------------
   Content blocks
   --------------------------------------------------------------------------- */

const PROMISES = [
  {
    icon: 'truck',
    title: 'ارسال سریع و رایگان',
    text: 'ارسال همان‌روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴ و ارسال رایگان بالای ۱٫۵ میلیون تومان.'
  },
  {
    icon: 'verified',
    title: 'تضمین اصالت کالا',
    text: 'تمام محصولات دارای اصالت، تاریخ انقضای معتبر و شرایط نگهداری استاندارد هستند.'
  },
  {
    icon: 'stethoscope',
    title: 'مشاوره رایگان داروساز',
    text: 'پیش از خرید، با داروساز متخصص گفت‌وگو کنید و درباره مصرف و تداخل دارویی بپرسید.'
  },
  {
    icon: 'prescription',
    title: 'ثبت نسخه الکترونیکی',
    text: 'عکس نسخه را بارگذاری کنید تا داروهای آن پس از بررسی، برای شما آماده شود.'
  }
];

/* ---------------------------------------------------------------------------
   Small render helpers
   --------------------------------------------------------------------------- */

/** Horizontal rail of product cards — scrolls on mobile, grids on desktop. */
function productRail(items, onAdd) {
  const node = el('div', { class: 'product-grid' });

  items.forEach((product) => {
    const card = productCard(product, {
      onAdd,
      actions: {
        onWishlist: (item, button) => {
          const added = account.toggleWishlist(item.id);
          button.classList.toggle('is-active', added);
          button.setAttribute('aria-pressed', String(added));
        },
        onCompare: (item, button) => {
          const result = account.toggleCompare(item.id);
          if (!result.ok) {
            toast.warn('مقایسه محدود است', result.reason);
            return;
          }
          button.classList.toggle('is-active', result.added);
        }
      }
    });
    node.append(card.node);
  });

  return node;
}

/** Category tile. */
function categoryTile(category, count) {
  const node = el('a', { class: 'category-card glass radius-xl', href: to(`/category/${category.id}`) });

  node.innerHTML = html`
    <span class="category-card__icon">${raw(icon(category.icon, { size: 30 }))}</span>
    <h3 class="category-card__name">${category.title}</h3>
    <span class="category-card__count">${toPersianDigits(count)} محصول</span>
    <span class="category-card__subs">
      ${(category.subcategories || [])
        .slice(0, 3)
        .map((sub) => raw(html`<span class="category-card__sub">${sub.title}</span>`))}
    </span>
  `.toString();

  return node;
}

/* ---------------------------------------------------------------------------
   Page
   --------------------------------------------------------------------------- */

export default async function homePage() {
  const node = el('div');
  const disposers = [];

  const allProducts = catalogService.allProducts();
  const featured = catalogService.featured(8);
  const discounted = catalogService.discounted(8);
  const popular = catalogService.popular(8);
  const newest = catalogService.newest(8);
  const topCategories = catalogService.categoriesWithCounts().slice(0, 8);
  const brands = catalogService.allBrands().filter((brand) => brand.featured).slice(0, 12);
  const articles = blogService.featured(3);

  /** Shared add handler: name + price are passed so the toast is specific. */
  const handleAdd = async (product) => {
    const result = cart.add(product.id, 1);
    if (!result.ok && result.reason === 'out-of-stock') {
      toast.error('این محصول موجود نیست', product.name);
    }
    return result;
  };

  node.innerHTML = html`
    <!-- ============================ Hero ============================ -->
    <section class="hero">
      <div class="shell">
        <div class="hero__grid">
          <div>
            <span class="hero__eyebrow">
              ${raw(icon('sparkle', { size: 15 }))}
              ${toPersianDigits(allProducts.length)} محصول سلامت در یک داروخانه
            </span>

            <h1 class="hero__title">
              سلامت شما، با
              <em>دارومیکس</em>
              ساده‌تر و مطمئن‌تر
            </h1>

            <p class="hero__text">
              دارو، مکمل، لوازم بهداشتی و تجهیزات پزشکی را با مشاوره رایگان داروساز،
              تضمین اصالت کالا و ارسال سریع تهیه کنید.
            </p>

            <form class="hero-search" data-search-form role="search">
              ${raw(icon('search', { size: 20 }))}
              <label class="visually-hidden" for="hero-search-input">جستجوی محصولات</label>
              <input id="hero-search-input" type="search" name="q" placeholder="نام دارو، مکمل یا برند مورد نظر…" autocomplete="off" />
              <button class="btn btn--primary" type="submit">
                ${raw(icon('search', { size: 16 }))}
                <span>جستجو</span>
              </button>
            </form>

            <div class="hero__cta">
              <a class="btn btn--primary btn--lg" href="${to('/catalog')}">
                ${raw(icon('bag', { size: 18 }))}
                شروع خرید
              </a>
              <a class="btn btn--glass btn--lg" href="${to('/prescription')}">
                ${raw(icon('prescription', { size: 18 }))}
                ثبت نسخه الکترونیکی
              </a>
            </div>

            <div class="hero__stats">
              <div>
                <div class="hero__stat-value">${toPersianDigits('۲۴')}</div>
                <div class="hero__stat-label">ساعت پاسخگویی داروساز</div>
              </div>
              <div>
                <div class="hero__stat-value">${toPersianDigits(allProducts.length)}+</div>
                <div class="hero__stat-label">تنوع محصول سلامت</div>
              </div>
              <div>
                <div class="hero__stat-value">${toPersianDigits('۹۸')}٪</div>
                <div class="hero__stat-label">رضایت مشتریان</div>
              </div>
            </div>
          </div>

          <div class="hero__visual">
            <div class="hero__halo" aria-hidden="true"></div>

            <div class="hero__panel glass-3">
              <div class="row row--between mb-4">
                <div>
                  <div class="fs-xs text-soft">پرفروش‌ترین این هفته</div>
                  <div class="fw-bold text-strong">${featured[0]?.name || 'ویتامین D3'}</div>
                </div>
                <span class="badge badge--gold">${raw(icon('crown', { size: 13 }))} ویژه</span>
              </div>

              <div style="aspect-ratio:1;display:grid;place-items:center">
                ${raw(productArt(featured[0] || { shape: 'softgel', tone: 'gold' }, { className: 'product-art--breathe' }))}
              </div>

              <div class="row row--between mt-4">
                ${raw(ratingStars(featured[0]?.rating || 4.8, { count: featured[0]?.reviewCount }))}
                ${raw(priceBlock(featured[0] || { price: 142000 }))}
              </div>
            </div>

            <span class="hero__chip glass hero__chip--tl">
              ${raw(icon('truck', { size: 15 }))} ارسال امروز
            </span>
            <span class="hero__chip glass hero__chip--br">
              ${raw(icon('stethoscope', { size: 15 }))} مشاوره رایگان
            </span>
            <span class="hero__chip glass hero__chip--tr">
              ${raw(icon('verified', { size: 15 }))} اصالت کالا
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= Promises ========================= -->
    <section class="section section--tight">
      <div class="shell">
        <div class="auto-grid auto-grid--wide" data-slot="promises"></div>
      </div>
    </section>

    <!-- ======================== Categories ======================== -->
    <section class="section">
      <div class="shell">
        ${raw(sectionHead({
          title: 'خرید بر اساس دسته‌بندی',
          subtitle: 'از داروهای بدون نسخه تا تجهیزات پزشکی خانگی؛ مسیر مورد نیاز خود را انتخاب کنید.',
          iconName: 'layers',
          actionHref: '/categories',
          actionLabel: 'همه دسته‌بندی‌ها'
        }))}
        <div class="auto-grid auto-grid--tight" data-slot="categories"></div>
      </div>
    </section>

    <!-- ========================= Discounts ======================== -->
    ${discounted.length
      ? raw(html`
          <section class="section">
            <div class="shell">
              ${raw(sectionHead({
                title: 'پیشنهادهای ویژه امروز',
                subtitle: 'محصولات منتخب با بیشترین تخفیف؛ تا پایان موجودی.',
                iconName: 'percent',
                actionHref: '/catalog',
                actionLabel: 'مشاهده تخفیف‌ها'
              }))}
              <div data-slot="discounted"></div>
            </div>
          </section>
        `)
      : ''}

    <!-- ======================== Promo band ======================== -->
    <section class="section section--tight">
      <div class="shell">
        <div class="promo-band glass--brand">
          <div>
            <h2 class="promo-band__title">نسخه‌تان را همین حالا ثبت کنید</h2>
            <p class="promo-band__text">
              عکس نسخه را بارگذاری کنید؛ داروساز دارومیکس آن را بررسی می‌کند،
              داروها آماده می‌شوند و با پیک برای شما ارسال می‌شوند.
            </p>
            <div class="row mt-6">
              <a class="btn btn--glass btn--lg" href="${to('/prescription')}">
                ${raw(icon('upload', { size: 18 }))}
                بارگذاری نسخه
              </a>
              <a class="btn btn--ghost btn--lg" href="${to('/consultation')}" style="color:#f4fffb">
                ${raw(icon('stethoscope', { size: 18 }))}
                مشاوره با داروساز
              </a>
            </div>
          </div>
          <div class="promo__art">
            <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <path d="M30 24h52a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8Z"
                stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
              <path d="M42 40h34M42 54h34M42 68h20" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.75"/>
              <circle cx="88" cy="88" r="20" fill="currentColor" opacity="0.22"/>
              <path d="M88 80v16M80 88h16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================== Popular ========================= -->
    <section class="section">
      <div class="shell">
        ${raw(sectionHead({
          title: 'محبوب‌ترین محصولات',
          subtitle: 'انتخاب بیشترین تعداد مشتریان دارومیکس در ماه گذشته.',
          iconName: 'trendingUp',
          actionHref: '/catalog?sort=popular',
          actionLabel: 'مشاهده بیشتر'
        }))}
        <div data-slot="popular"></div>
      </div>
    </section>

    <!-- =========================== Brands ========================= -->
    <section class="section section--tight">
      <div class="shell">
        ${raw(sectionHead({
          title: 'برندهای معتبر',
          subtitle: 'همکاری با برندهای شناخته‌شده داخلی و بین‌المللی حوزه سلامت.',
          iconName: 'verified',
          actionHref: '/catalog',
          actionLabel: 'جستجو بر اساس برند'
        }))}
        <div class="auto-grid auto-grid--tight" data-slot="brands"></div>
      </div>
    </section>

    <!-- =========================== Newest ========================= -->
    <section class="section">
      <div class="shell">
        ${raw(sectionHead({
          title: 'تازه‌های دارومیکس',
          subtitle: 'جدیدترین محصولاتی که به قفسه‌های داروخانه اضافه شده‌اند.',
          iconName: 'spark',
          actionHref: '/catalog?sort=newest',
          actionLabel: 'مشاهده همه'
        }))}
        <div data-slot="newest"></div>
      </div>
    </section>

    <!-- ========================== Magazine ======================== -->
    <section class="section">
      <div class="shell">
        ${raw(sectionHead({
          title: 'مجله سلامت دارومیکس',
          subtitle: 'مقالات کاربردی درباره پیشگیری، تغذیه و سبک زندگی سالم — با بازبینی کارشناسان.',
          iconName: 'bookmark',
          actionHref: '/magazine',
          actionLabel: 'همه مقالات'
        }))}
        <div class="auto-grid auto-grid--wide" data-slot="articles"></div>
      </div>
    </section>

    <!-- ========================= Newsletter ======================= -->
    <section class="section">
      <div class="shell">
        <div class="newsletter glass-2">
          <div>
            <h2 class="mb-2">از تخفیف‌ها و توصیه‌های سلامت باخبر شوید</h2>
            <p class="text-muted mb-0">
              هر هفته یک ایمیل کوتاه با پیشنهادهای ویژه و نکات کاربردی سلامت؛ بدون تبلیغ اضافه.
            </p>
          </div>
          <div>
            <form class="newsletter__form" data-newsletter-form novalidate>
              <label class="visually-hidden" for="newsletter-email">ایمیل شما</label>
              <input class="input" id="newsletter-email" type="email" name="email" placeholder="ایمیل خود را وارد کنید" required />
              <button class="btn btn--primary" type="submit">
                ${raw(icon('send', { size: 16 }))}
                عضویت
              </button>
            </form>
            <p class="fs-xs text-soft mt-2 mb-0" data-newsletter-hint>
              در این نسخه نمایشی، ایمیل شما ارسال نمی‌شود و فقط روی همین مرورگر ذخیره می‌گردد.
            </p>
          </div>
        </div>
      </div>
    </section>
  `.toString();

  /* -------------------------------------------------------------------------
     Populate the dynamic slots
     ------------------------------------------------------------------------- */

  const promisesSlot = qs('[data-slot="promises"]', node);
  PROMISES.forEach((promise) => {
    const tile = el('div', { class: 'feature glass radius-lg' });
    tile.innerHTML = html`
      <span class="feature__icon">${raw(icon(promise.icon, { size: 22 }))}</span>
      <div>
        <h3 class="feature__title">${promise.title}</h3>
        <p class="feature__text">${promise.text}</p>
      </div>
    `.toString();
    promisesSlot.append(tile);
  });

  const categoriesSlot = qs('[data-slot="categories"]', node);
  topCategories.forEach((category) => categoriesSlot.append(categoryTile(category, category.productCount)));

  if (discounted.length) {
    qs('[data-slot="discounted"]', node).append(productRail(discounted, handleAdd));
  }

  qs('[data-slot="popular"]', node).append(productRail(popular, handleAdd));
  qs('[data-slot="newest"]', node).append(productRail(newest, handleAdd));

  const brandsSlot = qs('[data-slot="brands"]', node);
  brands.forEach((brand) => {
    const tile = el('a', { class: 'brand-tile glass radius-lg', href: to('/catalog', { brand: brand.id }) });
    tile.innerHTML = html`
      ${raw(brandArt(brand))}
      <span>${brand.name}</span>
      <span class="fs-xs text-soft">${brand.country}</span>
    `.toString();
    brandsSlot.append(tile);
  });

  const articlesSlot = qs('[data-slot="articles"]', node);
  articles.forEach((article) => {
    const card = el('article', { class: 'article-card glass radius-xl' });
    card.innerHTML = html`
      <a class="article-card__media" href="${to(`/magazine/${article.slug}`)}" aria-label="${article.title}">
        ${raw(articleArt(article))}
        <span class="badge badge--glass article-card__tag">
          ${(blogService.tags().find((tag) => tag.id === article.tag) || {}).title || 'سلامت'}
        </span>
      </a>
      <div class="article-card__body">
        <h3 class="article-card__title clamp-2">
          <a href="${to(`/magazine/${article.slug}`)}">${article.title}</a>
        </h3>
        <p class="article-card__excerpt clamp-3">${article.excerpt}</p>
        <div class="article-card__foot">
          <span>${article.author}</span>
          <span>${toPersianDigits(article.readingMinutes)} دقیقه مطالعه</span>
        </div>
      </div>
    `.toString();
    articlesSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  // Hero search form
  disposers.push(
    delegate(node, 'submit', '[data-search-form]', (event, form) => {
      event.preventDefault();
      const input = qs('input[name="q"]', form);
      const term = input?.value.trim() || '';

      if (term) account.rememberSearch(term);
      navigate('/catalog', term ? { q: term } : {});
    })
  );

  // Newsletter signup (local only)
  disposers.push(
    delegate(node, 'submit', '[data-newsletter-form]', (event, form) => {
      event.preventDefault();

      const input = qs('input[name="email"]', form);
      const email = input?.value.trim() || '';
      const hint = qs('[data-newsletter-hint]', node);

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        toast.error('ایمیل نامعتبر', 'لطفاً یک آدرس ایمیل صحیح وارد کنید.');
        input?.focus();
        return;
      }

      account.updateProfile({ newsletter: true, email });
      form.reset();

      if (hint) {
        hint.textContent = 'عضویت شما ثبت شد. می‌توانید این را در بخش تنظیمات حساب تغییر دهید.';
        hint.classList.add('text-success');
      }

      toast.success('عضویت شما ثبت شد', 'از این پس پیشنهادهای ویژه را دریافت می‌کنید.');
    })
  );

  return {
    node,
    title: 'داروخانه آنلاین و خدمات سلامت',
    cleanup: () => disposers.forEach((dispose) => dispose())
  };
}

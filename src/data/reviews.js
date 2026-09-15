/**
 * DARUMIX — customer reviews.
 *
 * Seeded reviews give every product a believable rating distribution; a
 * deterministic generator fills in the remainder so no product page is ever
 * empty without bloating the bundle with hundreds of literal objects.
 */

import { seeds } from "./seeds.js";

const REVIEW_TEMPLATES = [
  {
    rating: 5,
    text: "کیفیت محصول کاملاً مطابق توضیحات سایت بود و بسته‌بندی هم بسیار مرتب و محافظت‌شده ارسال شد. بدون شک دوباره از دارومیکس خرید می‌کنم.",
    pros: ["بسته‌بندی عالی", "ارسال سریع"],
    cons: [],
  },
  {
    rating: 5,
    text: "قیمت نسبت به داروخانه‌های محلی واقعاً بهتر بود و تاریخ انقضای محصول هم طولانی است. روند خرید آنلاین و پیگیری سفارش هم بسیار ساده بود.",
    pros: ["قیمت مناسب", "تاریخ انقضای مناسب"],
    cons: [],
  },
  {
    rating: 4,
    text: "محصول خوبی است و اثر آن را دیدم، اما بسته‌بندی کمی بزرگ‌تر از حد انتظار بود. در مجموع از خرید راضی هستم.",
    pros: ["اثربخشی خوب"],
    cons: ["بسته‌بندی حجیم"],
  },
  {
    rating: 5,
    text: "قبل از خرید با داروساز دارومیکس مشاوره گرفتم و توضیحات کامل و صبورانه‌ای درباره نحوه مصرف دادند. همین پشتیبانی باعث شد اعتماد کنم.",
    pros: ["مشاوره تخصصی", "پاسخ‌گویی سریع"],
    cons: [],
  },
  {
    rating: 4,
    text: "ارسال بی‌نقص و به‌موقع بود. فقط ای کاش امکان انتخاب بازه زمانی دقیق‌تر برای تحویل وجود داشت.",
    pros: ["ارسال به‌موقع"],
    cons: ["بازه زمانی تحویل"],
  },
  {
    rating: 3,
    text: "محصول استاندارد و اورجینال بود، اما قیمت آن در مقایسه با برندهای مشابه کمی بالاتر است. کیفیت اما قابل قبول است.",
    pros: ["اصالت محصول"],
    cons: ["قیمت بالا"],
  },
  {
    rating: 5,
    text: "برای ویتامین و مکمل همیشه از دارومیکس تهیه می‌کنم. اصالت محصول و اطلاعات دقیق روی صفحه محصول مهم‌ترین دلیل انتخابم است.",
    pros: ["اصالت محصول", "اطلاعات کامل"],
    cons: [],
  },
  {
    rating: 4,
    text: "مصرف آن را طبق توصیه داروساز شروع کردم و پس از دو هفته تفاوت را احساس کردم. راهنمای مصرف روی بسته بسیار کاربردی بود.",
    pros: ["راهنمای مصرف واضح"],
    cons: [],
  },
  {
    rating: 5,
    text: "سفارش را ساعت ده شب ثبت کردم و فردای همان روز به دستم رسید. هماهنگی پیک و پیگیری سفارش بسیار حرفه‌ای بود.",
    pros: ["ارسال سریع", "پیگیری حرفه‌ای"],
    cons: [],
  },
  {
    rating: 4,
    text: "کیفیت محصول مطلوب بود و با پوست حساس من سازگار بود. تنها نکته این که قیمت آن در دوره‌های تخفیف متغیر است.",
    pros: ["سازگار با پوست حساس"],
    cons: ["نوسان قیمت"],
  },
];

/**
 * Seeded reviews for a specific product.
 * Deterministic: the same product always shows the same reviews, so ratings
 * stay consistent between visits and across pages.
 */
export function seedReviewsForProduct(product, count = 4) {
  if (!product) return [];

  const reviews = [];
  const usedIndices = new Set();

  for (let i = 0; i < count; i += 1) {
    const seed = `${product.slug}::review::${i}`;
    let templateIndex = Math.floor(seeds.at(seed, i) * REVIEW_TEMPLATES.length);

    // Avoid repeating the same template twice in one list.
    let guard = 0;
    while (usedIndices.has(templateIndex) && guard < REVIEW_TEMPLATES.length) {
      templateIndex = (templateIndex + 1) % REVIEW_TEMPLATES.length;
      guard += 1;
    }
    usedIndices.add(templateIndex);

    const template = REVIEW_TEMPLATES[templateIndex];
    const author = seeds.pick(`${seed}::author`, seeds.customerNames, i);

    reviews.push({
      id: `${product.id}-r${i + 1}`,
      productId: product.id,
      author,
      rating: template.rating,
      text: template.text,
      pros: template.pros,
      cons: template.cons,
      date: seeds.dateWithinDays(`${seed}::date`, i * 9 + 3),
      verified: seeds.bool(`${seed}::verified`, 0.78, i),
      helpful: seeds.int(`${seed}::helpful`, 2, 42, i),
    });
  }

  return reviews;
}

/** Rating distribution (5→1 stars) derived from the product's rating. */
export function ratingBreakdown(product) {
  if (!product) return [0, 0, 0, 0, 0];

  const total = product.reviewCount || 1;
  const avg = product.rating || 0;

  // Weight the distribution toward the product's own average.
  const weights = [5, 4, 3, 2, 1].map((star) =>
    Math.max(0, 1 - Math.abs(star - avg) / 2.2),
  );
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;

  const counts = weights.map((weight) => Math.round((weight / sum) * total));
  const drift = total - counts.reduce((acc, value) => acc + value, 0);
  counts[0] += drift;

  return counts.map((value) => Math.max(0, value));
}

/** Every seeded review across the catalog, ordered newest first. */
export function allSeedReviews(products) {
  return products
    .flatMap((product) => seedReviewsForProduct(product, 3))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * DARUMIX — seed records.
 *
 * The admin dashboard, order history and account pages all need believable
 * volume. Rather than storing hundreds of literal objects, records are
 * generated deterministically from `seeds`, so the demo has 120 orders and 80
 * customers that stay identical on every reload — while costing a few KB.
 */

import { products } from "./products.js";
import { seeds, provinces, streets } from "./seeds.js";
import { ORDER_STATUSES, PRESCRIPTION_STATUSES } from "./statuses.js";

/* ---------------------------------------------------------------------------
   Customers
   --------------------------------------------------------------------------- */

const SEGMENTS = ["new", "regular", "vip", "inactive"];

export const seedCustomers = Array.from({ length: 80 }, (_, index) => {
  const id = `c-${String(index + 1).padStart(3, "0")}`;
  const name = seeds.customerNames[index % seeds.customerNames.length];
  const province = seeds.pick(`${id}::province`, provinces, index);
  const city = seeds.pick(`${id}::city`, province.cities, index);
  const ordersPlaced = seeds.int(`${id}::orders`, 0, 26, index);
  const segment =
    ordersPlaced === 0
      ? "new"
      : ordersPlaced > 18
        ? "vip"
        : seeds.bool(`${id}::inactive`, 0.22, index)
          ? "inactive"
          : "regular";

  return {
    id,
    name,
    phone: `0912${String(seeds.int(`${id}::phone`, 1000000, 9999, index)).slice(0, 7)}`,
    email: `user${index + 1}@darumix-demo.ir`,
    city,
    province: province.name,
    joinDate: seeds.dateWithinDays(`${id}::join`, 900),
    ordersCount: ordersPlaced,
    totalSpent:
      ordersPlaced * seeds.int(`${id}::spent`, 380000, 2400000, index),
    segment,
    prescriptionsCount: seeds.int(`${id}::rx`, 0, 5, index),
    lastActive: seeds.dateWithinDays(`${id}::active`, 90),
  };
});

export const SEGMENT_LABELS = {
  new: "کاربر جدید",
  regular: "مشتری فعال",
  vip: "مشتری ویژه",
  inactive: "غیرفعال",
};

/* ---------------------------------------------------------------------------
   Orders
   --------------------------------------------------------------------------- */

/** Order statuses weighted toward the middle of the pipeline. */
const ORDER_STATUS_WEIGHTS = [
  "pending",
  "pending",
  "confirmed",
  "confirmed",
  "confirmed",
  "processing",
  "processing",
  "processing",
  "processing",
  "shipped",
  "shipped",
  "shipped",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "cancelled",
  "returned",
];

export const seedOrders = Array.from({ length: 120 }, (_, index) => {
  const id = `DRX-${String(1400000 + index * 37).padStart(7, "0")}`;
  const customer = seedCustomers[index % seedCustomers.length];
  const status = ORDER_STATUS_WEIGHTS[index % ORDER_STATUS_WEIGHTS.length];
  const placedAt = seeds.dateWithinDays(`${id}::placed`, 120);

  // 1–5 line items per order, deterministic per order id.
  const lineCount = seeds.int(`${id}::lines`, 1, 5, index);
  const items = Array.from({ length: lineCount }, (_, lineIndex) => {
    const product = products[(index * 7 + lineIndex * 13) % products.length];
    const quantity = seeds.int(`${id}::qty`, 1, 4, lineIndex);
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  });

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shipping =
    subtotal > 1500000
      ? 0
      : seeds.pick(`${id}::ship`, [0, 35000, 49000], index);
  const discount = seeds.bool(`${id}::hasDiscount`, 0.34, index)
    ? Math.round(
        subtotal * seeds.pick(`${id}::discountRate`, [0.05, 0.1, 0.15], index),
      )
    : 0;

  return {
    id,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    city: customer.city,
    address: `${customer.city}، ${seeds.pick(`${id}::street`, streets, index)}، پلاک ${seeds.int(`${id}::no`, 1, 180, index)}`,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
    status,
    paymentMethod: seeds.pick(`${id}::pay`, ["online", "wallet", "cod"], index),
    shippingMethod: seeds.pick(
      `${id}::shipMethod`,
      ["express", "standard", "pickup"],
      index,
    ),
    placedAt,
    updatedAt: seeds.dateWithinDays(`${id}::updated`, 30),
    hasPrescription: seeds.bool(`${id}::rx`, 0.18, index),
    trackingCode: seeds.bool(`${id}::tracked`, 0.6, index)
      ? `IR${seeds.int(`${id}::track`, 100000, 999, index)}`
      : null,
    note: seeds.bool(`${id}::note`, 0.2, index)
      ? "لطفاً پیش از ارسال، هماهنگی تلفنی انجام شود."
      : "",
  };
});

/** Order status counters for the admin pipeline. */
export function orderStatusCounts(orders = seedOrders) {
  const counts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status.id, 0]),
  );
  orders.forEach((order) => {
    if (counts[order.status] != null) counts[order.status] += 1;
  });
  return counts;
}

/* ---------------------------------------------------------------------------
   Prescriptions
   --------------------------------------------------------------------------- */

const RX_NOTES = [
  "نسخه مربوط به درمان عفونت تنفسی است. داروساز لطفاً تداخل دارویی را بررسی کند.",
  "بیمار سابقه حساسیت به پنی‌سیلین دارد. جایگزین مناسب پیشنهاد شود.",
  "داروها برای بیمار سالمند است؛ دوز متناسب با سن بازبینی شود.",
  "نسخه شامل داروی کنترل قند است. آموزش نحوه نگهداری در یخچال لازم است.",
  "نسخه برای کودک است؛ دوز بر اساس وزن محاسبه شود.",
  "بیمار در دوران بارداری است. ایمنی داروها بررسی شود.",
];

export const seedPrescriptions = Array.from({ length: 42 }, (_, index) => {
  const id = `RX-${String(9200 + index).padStart(5, "0")}`;
  const customer = seedCustomers[(index * 3) % seedCustomers.length];
  const status =
    PRESCRIPTION_STATUSES[index % (PRESCRIPTION_STATUSES.length - 1)].id;
  const fileCount = seeds.int(`${id}::files`, 1, 3, index);

  return {
    id,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    doctorName: `${seeds.pick(`${id}::doctorTitle`, ["دکتر"], index)} ${seeds.pick(`${id}::doctor`, seeds.customerNames, index + 5)}`,
    insuranceProvider: seeds.pick(
      `${id}::insurance`,
      ["تأمین اجتماعی", "بیمه سلامت", "بیمه نیروهای مسلح", "بدون بیمه"],
      index,
    ),
    medicineCount: seeds.int(`${id}::meds`, 1, 5, index),
    files: Array.from({ length: fileCount }, (_, fileIndex) => ({
      id: `${id}-f${fileIndex + 1}`,
      name: `prescription-${index + 1}-${fileIndex + 1}.jpg`,
      size: seeds.int(`${id}::size`, 240000, 2600000, fileIndex),
      type: "image/jpeg",
    })),
    note: RX_NOTES[index % RX_NOTES.length],
    status,
    submittedAt: seeds.dateWithinDays(`${id}::submitted`, 60),
    reviewedAt: seeds.bool(`${id}::reviewed`, 0.7, index)
      ? seeds.dateWithinDays(`${id}::reviewedAt`, 20)
      : null,
    pharmacistName: seeds.bool(`${id}::hasPharmacist`, 0.65, index)
      ? seeds.pick(`${id}::pharmacist`, seeds.customerNames, index + 11)
      : null,
    estimatedTotal: seeds.int(`${id}::total`, 180000, 2400000, index),
    deliveryAddress: `${customer.city}، ${seeds.pick(`${id}::rxStreet`, streets, index)}`,
  };
});

/* ---------------------------------------------------------------------------
   Consultations
   --------------------------------------------------------------------------- */

export const seedConsultations = Array.from({ length: 26 }, (_, index) => {
  const id = `CS-${String(4100 + index).padStart(5, "0")}`;
  const customer = seedCustomers[(index * 7) % seedCustomers.length];
  const status = seeds.pick(
    `${id}::status`,
    ["requested", "scheduled", "completed", "completed", "cancelled"],
    index,
  );

  return {
    id,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    topic: seeds.pick(
      `${id}::topic`,
      [
        "مشاوره مصرف دارو",
        "بررسی تداخل دارویی",
        "مشاوره مکمل ویتامین",
        "کنترل قند و فشار خون",
        "مراقبت از پوست و مو",
        "سلامت کودک و نوزاد",
        "سلامت سالمندان",
      ],
      index,
    ),
    pharmacistName: seeds.pick(`${id}::pharm`, seeds.customerNames, index + 3),
    date: seeds.bool(`${id}::past`, 0.55, index)
      ? seeds.dateWithinDays(`${id}::date`, 30)
      : seeds.dateAhead(`${id}::date`, 14),
    slot: seeds.pick(
      `${id}::slot`,
      ["۰۹:۰۰", "۱۰:۳۰", "۱۵:۰۰", "۱۶:۳۰", "۱۸:۰۰", "۱۹:۳۰"],
      index,
    ),
    mode: seeds.pick(`${id}::mode`, ["phone", "chat", "video"], index),
    status,
    durationMinutes: seeds.pick(`${id}::duration`, [10, 15, 20, 30], index),
    question: seeds.pick(
      `${id}::question`,
      [
        "می‌خواهم بدانم می‌توانم این دو دارو را با هم مصرف کنم؟",
        "برای شروع ویتامین D چه دوزی مناسب است؟",
        "بعد از قطع آنتی‌بیوتیک چه علائمی طبیعی است؟",
        "برای کنترل فشار خون چه تغییرات غذایی لازم است؟",
        "کرم ضدآفتاب مناسب پوست چرب کدام است؟",
        "دوز مصرف دارو برای کودک سه ساله چقدر است؟",
      ],
      index,
    ),
  };
});

/* ---------------------------------------------------------------------------
   Notifications
   --------------------------------------------------------------------------- */

export const seedNotifications = Array.from({ length: 24 }, (_, index) => {
  const id = `n-${String(index + 1).padStart(3, "0")}`;
  const type = seeds.pick(
    `${id}::type`,
    ["order", "prescription", "consultation", "promotion", "system", "review"],
    index,
  );
  const order = seedOrders[(index * 5) % seedOrders.length];

  const CONTENT = {
    order: {
      title: `سفارش ${order.id} به‌روزرسانی شد`,
      text: `وضعیت سفارش شما تغییر کرد. برای مشاهده جزئیات به صفحه سفارش‌ها مراجعه کنید.`,
      href: `#/account/orders`,
    },
    prescription: {
      title: "نسخه شما بررسی شد",
      text: "داروساز دارومیکس نسخه ارسالی را بررسی کرده و نتیجه در پنل شما ثبت شده است.",
      href: "#/account/prescriptions",
    },
    consultation: {
      title: "مشاوره داروساز تأیید شد",
      text: "زمان مشاوره شما تأیید شد. چند دقیقه پیش از نوبت، لینک تماس فعال می‌شود.",
      href: "#/consultation",
    },
    promotion: {
      title: "کد تخفیف اختصاصی شما فعال شد",
      text: "با کد DARUMIX10 در خرید بعدی خود ۱۰ درصد تخفیف بگیرید.",
      href: "#/catalog?sort=discount",
    },
    system: {
      title: "به دارومیکس خوش آمدید",
      text: "حساب شما با موفقیت ساخته شد. امکان ثبت نسخه و مشاوره داروساز اکنون فعال است.",
      href: "#/account",
    },
    review: {
      title: "نظر شما ثبت شد",
      text: "از ثبت نظر برای محصول خود سپاسگزاریم. نظر شما پس از بررسی نمایش داده می‌شود.",
      href: "#/account/reviews",
    },
  };

  return {
    id,
    type,
    ...CONTENT[type],
    createdAt: seeds.dateWithinDays(`${id}::created`, 40),
    read: seeds.bool(`${id}::read`, 0.42, index),
  };
});

/* ---------------------------------------------------------------------------
   Marketing
   --------------------------------------------------------------------------- */

export const seedCampaigns = [
  {
    id: "camp-1",
    title: "کمپین سلامت پوست",
    channel: "email",
    status: "active",
    audience: "خریداران محصولات پوستی",
    sent: 4820,
    opened: 2913,
    clicked: 1244,
    converted: 318,
    budget: 45000000,
    revenue: 186000,
    startDate: seeds.dateWithinDays("camp1-start", 28),
    endDate: seeds.dateAhead("camp1-end", 12),
  },
  {
    id: "camp-2",
    title: "جشنواره مکمل‌های ویتامین",
    channel: "sms",
    status: "active",
    audience: "مشتریان فعال",
    sent: 12600,
    opened: 7180,
    clicked: 2960,
    converted: 742,
    budget: 68000000,
    revenue: 412000,
    startDate: seeds.dateWithinDays("camp2-start", 18),
    endDate: seeds.dateAhead("camp2-end", 9),
  },
  {
    id: "camp-3",
    title: "یادآوری سبد رهاشده",
    channel: "email",
    status: "active",
    audience: "سبد خرید رهاشده",
    sent: 2140,
    opened: 1486,
    clicked: 918,
    converted: 246,
    budget: 12000000,
    revenue: 96000000,
    startDate: seeds.dateWithinDays("camp3-start", 40),
    endDate: seeds.dateAhead("camp3-end", 30),
  },
  {
    id: "camp-4",
    title: "معرفی به دوستان",
    channel: "social",
    status: "paused",
    audience: "مشتریان ویژه",
    sent: 3260,
    opened: 2010,
    clicked: 742,
    converted: 168,
    budget: 24000000,
    revenue: 74000000,
    startDate: seeds.dateWithinDays("camp4-start", 55),
    endDate: seeds.dateAhead("camp4-end", 5),
  },
  {
    id: "camp-5",
    title: "کمپین سلامت سالمندان",
    channel: "email",
    status: "scheduled",
    audience: "خریداران تجهیزات پزشکی",
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    budget: 36000000,
    revenue: 0,
    startDate: seeds.dateAhead("camp5-start", 6),
    endDate: seeds.dateAhead("camp5-end", 26),
  },
  {
    id: "camp-6",
    title: "بازگشت مشتریان غیرفعال",
    channel: "sms",
    status: "completed",
    audience: "مشتریان غیرفعال",
    sent: 8940,
    opened: 4120,
    clicked: 1380,
    converted: 296,
    budget: 32000000,
    revenue: 138000,
    startDate: seeds.dateWithinDays("camp6-start", 80),
    endDate: seeds.dateWithinDays("camp6-end", 48),
  },
];

export const CAMPAIGN_CHANNELS = {
  email: { label: "ایمیل", icon: "mail", tone: "info" },
  sms: { label: "پیامک", icon: "message", tone: "brand" },
  social: { label: "شبکه اجتماعی", icon: "share", tone: "mint" },
  push: { label: "اعلان مرورگر", icon: "bell", tone: "gold" },
};

export const CAMPAIGN_STATUSES = {
  active: { label: "فعال", tone: "mint" },
  paused: { label: "متوقف", tone: "warn" },
  scheduled: { label: "زمان‌بندی شده", tone: "info" },
  completed: { label: "پایان یافته", tone: "neutral" },
};

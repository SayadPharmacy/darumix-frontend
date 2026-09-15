/**
 * DARUMIX — status vocabularies.
 *
 * Single source of truth for order / prescription / consultation / campaign
 * statuses. Both the storefront and the admin dashboard read these, so a label
 * or colour is defined exactly once.
 */

/** Order lifecycle, in pipeline order. */
export const ORDER_STATUSES = [
  { id: "pending", label: "در انتظار تأیید", tone: "warn", icon: "clock" },
  { id: "confirmed", label: "تأیید شده", tone: "info", icon: "check" },
  {
    id: "processing",
    label: "در حال آماده‌سازی",
    tone: "info",
    icon: "package",
  },
  { id: "shipped", label: "ارسال شده", tone: "brand", icon: "truck" },
  { id: "delivered", label: "تحویل شده", tone: "mint", icon: "checkCircle" },
  { id: "cancelled", label: "لغو شده", tone: "danger", icon: "x" },
  { id: "returned", label: "مرجوع شده", tone: "neutral", icon: "rotate" },
];

export const orderStatusById = new Map(
  ORDER_STATUSES.map((status) => [status.id, status]),
);

/** Prescription review pipeline. */
export const PRESCRIPTION_STATUSES = [
  { id: "submitted", label: "ثبت شده", tone: "warn", icon: "upload" },
  { id: "in-review", label: "در حال بررسی داروساز", tone: "info", icon: "eye" },
  { id: "approved", label: "تأیید شده", tone: "brand", icon: "check" },
  { id: "ready", label: "آماده تحویل", tone: "mint", icon: "package" },
  { id: "delivered", label: "تحویل شده", tone: "mint", icon: "checkCircle" },
  { id: "rejected", label: "رد شده", tone: "danger", icon: "x" },
];

export const prescriptionStatusById = new Map(
  PRESCRIPTION_STATUSES.map((status) => [status.id, status]),
);

/** Pharmacist consultation booking states. */
export const CONSULTATION_STATUSES = [
  { id: "requested", label: "در انتظار تأیید", tone: "warn", icon: "clock" },
  { id: "scheduled", label: "زمان‌بندی شده", tone: "info", icon: "calendar" },
  { id: "completed", label: "انجام شده", tone: "mint", icon: "checkCircle" },
  { id: "cancelled", label: "لغو شده", tone: "danger", icon: "x" },
];

export const consultationStatusById = new Map(
  CONSULTATION_STATUSES.map((status) => [status.id, status]),
);

/** User notification categories. */
export const NOTIFICATION_TYPES = {
  order: { label: "سفارش", tone: "brand", icon: "package" },
  prescription: { label: "نسخه", tone: "info", icon: "prescription" },
  consultation: { label: "مشاوره", tone: "mint", icon: "stethoscope" },
  promotion: { label: "تخفیف", tone: "gold", icon: "tag" },
  system: { label: "سیستم", tone: "neutral", icon: "bell" },
  review: { label: "نظر", tone: "brand", icon: "star" },
};

/** Payment methods offered at checkout (UI only — no gateway is wired up). */
export const PAYMENT_METHODS = [
  {
    id: "online",
    label: "پرداخت آنلاین",
    description:
      "انتقال به درگاه بانکی امن؛ در این نسخه نمایشی، پرداخت واقعی انجام نمی‌شود.",
    icon: "creditCard",
  },
  {
    id: "wallet",
    label: "کیف پول دارومیکس",
    description: "استفاده از اعتبار کیف پول حساب کاربری.",
    icon: "wallet",
  },
  {
    id: "cod",
    label: "پرداخت در محل",
    description: "پرداخت نقدی یا کارتخوان هنگام تحویل سفارش.",
    icon: "banknote",
  },
  {
    id: "installment",
    label: "پرداخت اعتباری",
    description: "پرداخت در چند قسط برای سفارش‌های بالای ۵٬۰۰۰٬۰۰۰ تومان.",
    icon: "calendar",
  },
];

/** Shipping methods and their costs. */
export const SHIPPING_METHODS = [
  {
    id: "express",
    label: "ارسال سریع (پیک)",
    description: "تحویل در همان روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴.",
    price: 49000,
    etaDays: 0,
    icon: "truck",
  },
  {
    id: "standard",
    label: "ارسال عادی پستی",
    description: "تحویل ۱ تا ۳ روز کاری در سراسر کشور.",
    price: 35000,
    etaDays: 2,
    icon: "package",
  },
  {
    id: "free",
    label: "ارسال رایگان",
    description: "برای سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان، رایگان است.",
    price: 0,
    etaDays: 3,
    icon: "gift",
  },
  {
    id: "pickup",
    label: "تحویل حضوری از داروخانه",
    description: "دریافت سفارش از نزدیک‌ترین شعبه دارومیکس.",
    price: 0,
    etaDays: 1,
    icon: "store",
  },
];

/** Free-shipping threshold in Toman. */
export const FREE_SHIPPING_THRESHOLD = 1500000;

/** Valid coupon codes for the demo checkout. */
export const COUPONS = [
  {
    code: "DARUMIX10",
    type: "percent",
    value: 10,
    minBasket: 0,
    maxDiscount: 300000,
    label: "۱۰٪ تخفیف",
  },
  {
    code: "WELCOME50",
    type: "fixed",
    value: 50000,
    minBasket: 400000,
    maxDiscount: 50000,
    label: "۵۰٬۰۰۰ تومان تخفیف",
  },
  {
    code: "SALAMAT15",
    type: "percent",
    value: 15,
    minBasket: 1000000,
    maxDiscount: 600000,
    label: "۱۵٪ تخفیف سلامت",
  },
  {
    code: "FREESHIP",
    type: "shipping",
    value: 0,
    minBasket: 300000,
    maxDiscount: 49000,
    label: "ارسال رایگان",
  },
];

export const couponByCode = new Map(
  COUPONS.map((coupon) => [coupon.code, coupon]),
);

/** Consultation topics offered by the pharmacist service. */
export const CONSULTATION_TOPICS = [
  "مشاوره مصرف دارو",
  "بررسی تداخل دارویی",
  "مشاوره مکمل ویتامین",
  "کنترل قند و فشار خون",
  "مراقبت از پوست و مو",
  "سلامت کودک و نوزاد",
  "سلامت سالمندان",
  "رژیم غذایی و کاهش وزن",
];

/** Available consultation time slots. */
export const CONSULTATION_SLOTS = [
  "۰۹:۰۰",
  "۰۹:۳۰",
  "۱۰:۰۰",
  "۱۰:۳۰",
  "۱۱:۰۰",
  "۱۱:۳۰",
  "۱۵:۰۰",
  "۱۵:۳۰",
  "۱۶:۰۰",
  "۱۶:۳۰",
  "۱۷:۰۰",
  "۱۷:۳۰",
  "۱۸:۰۰",
  "۱۸:۳۰",
  "۱۹:۰۰",
  "۱۹:۳۰",
  "۲۰:۰۰",
  "۲۰:۳۰",
];

/* ---------------------------------------------------------------------------
   Display helpers
   --------------------------------------------------------------------------- */

const TONE_CLASS = {
  brand: "badge--brand",
  mint: "badge--mint",
  gold: "badge--gold",
  danger: "badge--danger",
  warn: "badge--warn",
  info: "badge--info",
  neutral: "badge--neutral",
};

/** CSS class for a status tone. */
export function toneClass(tone) {
  return TONE_CLASS[tone] || TONE_CLASS.neutral;
}

/** Look up any status definition by collection + id. */
export function statusOf(collection, id) {
  const map = {
    order: orderStatusById,
    prescription: prescriptionStatusById,
    consultation: consultationStatusById,
  }[collection];

  return map?.get(id) || { id, label: id, tone: "neutral", icon: "clock" };
}

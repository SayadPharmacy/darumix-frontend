/**
 * DARUMIX — Persian formatting helpers.
 *
 * All money is stored as an integer number of Toman (تومان). Formatting is the
 * only place that decides how it looks, so switching to Rial or adding a
 * currency symbol later is a one-line change.
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert ASCII digits in a string to Persian digits. */
export function toPersianDigits(input) {
  if (input == null) return "";
  return String(input).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
}

/** Convert Persian/Arabic digits back to ASCII (for parsing user input). */
export function toLatinDigits(input) {
  if (input == null) return "";
  return String(input)
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** Thousands separators, Latin digits (used inside LTR number spans). */
export function groupNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format an amount as Persian text: ۱۲۵,۰۰۰
 * @param {number} amount
 * @param {{ digits?: 'fa'|'latin', withUnit?: boolean, unit?: string }} [options]
 */
export function formatPrice(amount, options = {}) {
  const { digits = "fa", withUnit = true, unit = "تومان" } = options;
  const grouped = groupNumber(amount);
  const body = digits === "latin" ? grouped : toPersianDigits(grouped);
  return withUnit ? `${body} ${unit}` : body;
}

/** Compact form for cards: ۱۲۵٬۰۰۰ → ۱۲۵ هزار */
export function formatCompactPrice(amount) {
  const num = Number(amount) || 0;
  if (num >= 1000000) {
    return `${toPersianDigits((num / 1000000).toFixed(1).replace(/\.0$/, ""))} میلیون`;
  }
  if (num >= 1000) {
    return `${toPersianDigits(Math.round(num / 1000))} هزار`;
  }
  return toPersianDigits(num);
}

/** Discount percentage, clamped to a sane 0–90 range. */
export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.min(90, Math.round(((compareAt - price) / compareAt) * 100));
}

/* ---------------------------------------------------------------------------
   Dates — Gregorian to Jalali (Solar Hijri) conversion.
   --------------------------------------------------------------------------- */

const JALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALI_WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/** Gregorian → Jalali. Pure integer arithmetic, no Intl dependency. */
export function toJalali(date = new Date()) {
  const g = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
  };

  const gy = g.y - 1600;
  const gm = g.m - 1;
  const gd = g.d - 1;

  let gDayNo =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let i = 0; i < gm; i += 1) gDayNo += monthDays[i];

  // Leap-year correction for February.
  const isGregorianLeap = (g.y % 4 === 0 && g.y % 100 !== 0) || g.y % 400 === 0;
  if (gm > 1 && isGregorianLeap) gDayNo += 1;
  gDayNo += gd;

  let jDayNo = gDayNo - 79;

  const jNp = Math.floor(jDayNo / 12053);
  jDayNo %= 12053;

  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
  jDayNo %= 1461;

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365);
    jDayNo = (jDayNo - 1) % 365;
  }

  let jm = 0;
  let jd = jDayNo + 1;

  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let i = 0; i < 12; i += 1) {
    if (jd <= jalaliMonthDays[i]) {
      jm = i + 1;
      break;
    }
    jd -= jalaliMonthDays[i];
  }

  return { year: jy, month: jm, day: jd };
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
}

/**
 * Persian date string.
 * @param {Date|string|number} value
 * @param {{ withWeekday?: boolean, numeric?: boolean }} [options]
 */
export function formatDate(value, options = {}) {
  const date = toDate(value);
  const { year, month, day } = toJalali(date);
  const { withWeekday = false, numeric = false } = options;

  const body = numeric
    ? `${toPersianDigits(year)}/${toPersianDigits(String(month).padStart(2, "0"))}/${toPersianDigits(String(day).padStart(2, "0"))}`
    : `${toPersianDigits(day)} ${JALI_MONTHS[month - 1]} ${toPersianDigits(year)}`;

  return withWeekday ? `${JALI_WEEKDAYS[date.getDay()]}، ${body}` : body;
}

/** Time of day, 24h, Persian digits. */
export function formatTime(value) {
  const date = toDate(value);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return toPersianDigits(`${hh}:${mm}`);
}

/**
 * Relative time in Persian ("۳ ساعت پیش"). Falls back to an absolute date
 * once the gap is larger than a month.
 */
export function formatRelativeTime(value) {
  const date = toDate(value);
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 0) return formatDate(date);
  if (diffSeconds < 60) return "همین الان";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${toPersianDigits(minutes)} دقیقه پیش`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "دیروز";
  if (days < 7) return `${toPersianDigits(days)} روز پیش`;
  if (days < 30) return `${toPersianDigits(Math.floor(days / 7))} هفته پیش`;

  return formatDate(date);
}

/** Delivery window label used in checkout and order details. */
export function deliveryWindow(daysAhead = 1) {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  return formatDate(target, { withWeekday: true });
}

/* ---------------------------------------------------------------------------
   Text helpers
   --------------------------------------------------------------------------- */

const FA_CHAR_MAP = {
  ي: "ی",
  ك: "ک",
  ة: "ه",
  ۀ: "ه",
  أ: "ا",
  إ: "ا",
  آ: "آ",
  ؤ: "و",
};

/** Normalise Persian text for search matching (ی/ك variants, diacritics). */
export function normalizePersian(text) {
  if (!text) return "";
  return toLatinDigits(String(text))
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[يكةۀأإؤ]/g, (ch) => FA_CHAR_MAP[ch] || ch)
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Human file size for prescription uploads. */
export function formatFileSize(bytes) {
  const units = ["بایت", "کیلوبایت", "مگابایت"];
  let size = Number(bytes) || 0;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  const value = unit === 0 ? size : size.toFixed(1).replace(/\.0$/, "");
  return `${toPersianDigits(value)} ${units[unit]}`;
}

/** Persian plural for countable nouns without a proper plural form. */
export function countLabel(count, singular, plural) {
  const n = Number(count) || 0;
  return n === 1
    ? `${toPersianDigits(n)} ${singular}`
    : `${toPersianDigits(n)} ${plural}`;
}

/** Short order/reference code, e.g. DRX-۲۴۰۵۱۳ */
export function referenceCode(prefix = "DRX") {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${stamp}`;
}

/** Two-letter initials for avatars. */
export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

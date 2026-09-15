/**
 * DARUMIX — deterministic pseudo-random seed helpers.
 *
 * Mock data that changes on every reload looks broken: a product rated 4.7
 * one moment and 3.9 the next destroys trust in the demo. Every generated
 * value here is derived from a string seed, so the same input always produces
 * the same output — a stable "database" without storing thousands of records.
 */

import { seededRandom } from "../core/dom.js";

/* ---------------------------------------------------------------------------
   Core generator
   --------------------------------------------------------------------------- */

/** A float in [0,1) derived from one or more string/number parts. */
function at(seed, ...parts) {
  return seededRandom(`${seed}|${parts.join("|")}`);
}

/** An integer in [min, max] inclusive. */
function int(seed, min, max, ...parts) {
  return min + Math.floor(at(seed, ...parts) * (max - min + 1));
}

/** Pick an element from a list deterministically. */
function pick(seed, list, ...parts) {
  if (!list || list.length === 0) return undefined;
  return list[Math.floor(at(seed, ...parts) * list.length)];
}

/** A date some number of days before now, as an ISO string. */
function dateWithinDays(seed, daysBack = 30) {
  const spread = int(seed, 1, Math.max(1, daysBack), "day");
  const hoursBack = int(seed, 0, 23, "hour");
  const date = new Date();
  date.setDate(date.getDate() - spread);
  date.setHours(Math.max(8, 23 - hoursBack), int(seed, 0, 59, "min"), 0, 0);
  return date.toISOString();
}

/** A date in the future (for campaigns, deliveries, expiry dates). */
function dateAhead(seed, daysAhead = 30) {
  const spread = int(seed, 1, Math.max(1, daysAhead), "ahead");
  const date = new Date();
  date.setDate(date.getDate() + spread);
  date.setHours(
    int(seed, 9, 21, "ahead-hour"),
    int(seed, 0, 59, "ahead-min"),
    0,
    0,
  );
  return date.toISOString();
}

/** A boolean with a configurable probability of being true. */
function bool(seed, probability = 0.5, ...parts) {
  return at(seed, ...parts) < probability;
}

/* ---------------------------------------------------------------------------
   Name pools
   --------------------------------------------------------------------------- */

const firstNames = [
  "زهرا",
  "محمد",
  "فاطمه",
  "علی",
  "مریم",
  "حسین",
  "سارا",
  "رضا",
  "نگار",
  "امیر",
  "الهام",
  "مهدی",
  "شیرین",
  "کاوه",
  "پریسا",
  "سعید",
  "نازنین",
  "بهنام",
  "لیلا",
  "آرش",
  "مینا",
  "فرهاد",
  "رؤیا",
  "بابک",
  "هانیه",
  "کامران",
  "سپیده",
  "نوید",
  "آزاده",
  "پویا",
  "شبنم",
  "مسعود",
];

const lastNames = [
  "احمدی",
  "محمدی",
  "حسینی",
  "رضایی",
  "کریمی",
  "موسوی",
  "صادقی",
  "نوری",
  "قاسمی",
  "بهرامی",
  "رستگار",
  "کاظمی",
  "شفیعی",
  "امینی",
  "زمانی",
  "طاهری",
  "ملکی",
  "جلالی",
  "فرهادی",
  "سلطانی",
  "نیک‌پور",
  "بابایی",
  "هاشمی",
  "یزدانی",
];

/** Full names, generated once so the same person is stable everywhere. */
const customerNames = Array.from({ length: 60 }, (_, index) => {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[int("customer-last", 0, lastNames.length - 1, index)];
  return `${first} ${last}`;
});

const provinces = [
  { name: "تهران", cities: ["تهران", "اسلامشهر", "شهریار", "ورامین"] },
  { name: "اصفهان", cities: ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد"] },
  { name: "فارس", cities: ["شیراز", "مرودشت", "کازرون"] },
  { name: "خراسان رضوی", cities: ["مشهد", "نیشابور", "سبزوار"] },
  { name: "آذربایجان شرقی", cities: ["تبریز", "مراغه", "مرند"] },
  { name: "گیلان", cities: ["رشت", "لاهیجان", "انزلی"] },
  { name: "مازندران", cities: ["ساری", "بابل", "آمل", "نوشهر"] },
  { name: "البرز", cities: ["کرج", "فردیس", "هشتگرد"] },
];

const streets = [
  "خیابان ولیعصر",
  "بلوار کشاورز",
  "خیابان شریعتی",
  "بلوار فردوسی",
  "خیابان امام خمینی",
  "بلوار گلستان",
  "خیابان سعدی",
  "بلوار بهارستان",
  "خیابان مطهری",
  "بلوار نیلوفر",
  "خیابان دانشگاه",
  "بلوار معلم",
];

export const seeds = {
  at,
  int,
  pick,
  bool,
  dateWithinDays,
  dateAhead,
  customerNames,
  firstNames,
  lastNames,
  provinces,
  streets,
};

export { customerNames, provinces, streets };

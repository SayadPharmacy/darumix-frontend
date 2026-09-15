/**
 * DARUMIX — category taxonomy.
 *
 * Two levels: `parent` groups of categories, and leaf categories that carry
 * subcategories. Kept as plain data so a CMS/API can replace it verbatim.
 */

export const categoryGroups = [
  {
    id: "medicine",
    title: "دارو و درمان",
    icon: "pill",
    description: "داروهای بدون نسخه، مسکن، سرماخوردگی و مراقبت‌های روزمره",
  },
  {
    id: "supplement",
    title: "ویتامین و مکمل",
    icon: "flask",
    description: "مکمل‌های غذایی، ویتامین‌ها و تقویت‌کننده سیستم ایمنی",
  },
  {
    id: "beauty",
    title: "زیبایی و پوست",
    icon: "sparkle",
    description: "مراقبت از پوست، مو و محصولات بهداشتی شخصی",
  },
  {
    id: "baby",
    title: "مادر و کودک",
    icon: "baby",
    description: "شیر خشک، پوشک، غذای کودک و مراقبت از نوزاد",
  },
  {
    id: "medical",
    title: "تجهیزات پزشکی",
    icon: "stethoscope",
    description: "فشارسنج، تست قند خون، نبض‌سنج و لوازم جانبی",
  },
  {
    id: "personal",
    title: "بهداشت فردی",
    icon: "droplet",
    description: "دهان و دندان، ضدعفونی و بهداشت روزانه",
  },
  {
    id: "nutrition",
    title: "تغذیه و رژیم",
    icon: "leaf",
    description: "محصولات رژیمی، پروتئین و کنترل وزن",
  },
  {
    id: "eye-ear",
    title: "چشم، گوش و بینی",
    icon: "eye",
    description: "قطره، محلول شستشو و مراقبت از چشم و گوش",
  },
  {
    id: "elderly",
    title: "سلامت سالمندان",
    icon: "heart",
    description: "مراقبت از سالمندان، عصا، واکر و ملزومات حرکت",
  },
  {
    id: "sexual",
    title: "سلامت جنسی",
    icon: "shield",
    description: "محصولات سلامت جنسی و بهداشت زوجین",
  },
  {
    id: "herbal",
    title: "گیاهی و طب سنتی",
    icon: "leaf",
    description: "دمنوش، عرقیات و مکمل‌های گیاهی",
  },
  {
    id: "sport",
    title: "ورزش و تناسب اندام",
    icon: "activity",
    description: "مکمل ورزشی، بازیابی و تغذیه ورزشی",
  },
];

export const categories = [
  {
    id: "otc",
    group: "medicine",
    title: "دارو بدون نسخه",
    icon: "pill",
    description: "داروهای قابل تهیه بدون نسخه پزشک، شامل مسکن و سرماخوردگی",
    subcategories: [
      { id: "painkillers", title: "مسکن و ضدالتهاب" },
      { id: "cold-flu", title: "سرماخوردگی و آنفلوانزا" },
      { id: "digestive", title: "گوارش و معده" },
      { id: "allergy", title: "آلرژی و آنتی‌هیستامین" },
    ],
  },
  {
    id: "vitamins",
    group: "supplement",
    title: "ویتامین و مکمل",
    icon: "flask",
    description: "مکمل‌های ویتامین، مواد معدنی و حمایت از سیستم ایمنی",
    subcategories: [
      { id: "vitamin-d", title: "ویتامین D و کلسیم" },
      { id: "vitamin-c", title: "ویتامین C و آنتی‌اکسیدان" },
      { id: "multivitamin", title: "مولتی‌ویتامین" },
      { id: "omega", title: "امگا ۳ و روغن ماهی" },
      { id: "iron", title: "آهن و فولیک اسید" },
    ],
  },
  {
    id: "skincare",
    group: "beauty",
    title: "مراقبت از پوست",
    icon: "sparkle",
    description: "ضدآفتاب، مرطوب‌کننده، شوینده و مراقبت تخصصی پوست",
    subcategories: [
      { id: "sunscreen", title: "ضدآفتاب" },
      { id: "moisturizer", title: "مرطوب‌کننده و کرم" },
      { id: "cleanser", title: "شوینده و پاک‌کننده" },
      { id: "acne", title: "درمان آکنه" },
    ],
  },
  {
    id: "haircare",
    group: "beauty",
    title: "مراقبت از مو",
    icon: "sparkle",
    description: "شامپو، سرم مو و درمان ریزش",
    subcategories: [
      { id: "shampoo", title: "شامپو و نرم‌کننده" },
      { id: "hair-loss", title: "ضد ریزش مو" },
      { id: "hair-serum", title: "سرم و تقویت‌کننده" },
    ],
  },
  {
    id: "baby-care",
    group: "baby",
    title: "مادر و کودک",
    icon: "baby",
    description: "شیر خشک، پوشک، غذای کمکی و مراقبت از نوزاد",
    subcategories: [
      { id: "formula", title: "شیر خشک و شیر مادر" },
      { id: "diaper", title: "پوشک و دستمال" },
      { id: "baby-food", title: "غذای کمکی کودک" },
      { id: "baby-skin", title: "مراقبت پوست نوزاد" },
    ],
  },
  {
    id: "devices",
    group: "medical",
    title: "تجهیزات پزشکی",
    icon: "stethoscope",
    description: "دستگاه‌های پایش سلامت خانگی و لوازم جانبی",
    subcategories: [
      { id: "bp-monitor", title: "فشارسنج" },
      { id: "glucose", title: "تست قند خون" },
      { id: "thermometer", title: "دماسنج" },
      { id: "oximeter", title: "اکسیژن‌سنج و نبض‌سنج" },
    ],
  },
  {
    id: "oral-care",
    group: "personal",
    title: "بهداشت دهان و دندان",
    icon: "droplet",
    description: "خمیردندان، مسواک، دهانشویه و نخ دندان",
    subcategories: [
      { id: "toothpaste", title: "خمیردندان" },
      { id: "mouthwash", title: "دهانشویه" },
      { id: "toothbrush", title: "مسواک و نخ دندان" },
    ],
  },
  {
    id: "nutrition-food",
    group: "nutrition",
    title: "تغذیه و رژیم",
    icon: "leaf",
    description: "محصولات کمک‌رژیمی، پروتئین و کنترل وزن",
    subcategories: [
      { id: "protein", title: "پروتئین و پودر" },
      { id: "diet", title: "کمک‌رژیمی" },
      { id: "diabetic", title: "محصولات مخصوص دیابت" },
    ],
  },
  {
    id: "eye-care",
    group: "eye-ear",
    title: "چشم و گوش",
    icon: "eye",
    description: "قطره چشم، محلول لنز و مراقبت از گوش",
    subcategories: [
      { id: "eye-drop", title: "قطره چشمی" },
      { id: "lens-care", title: "محلول لنز" },
      { id: "ear-care", title: "مراقبت از گوش" },
    ],
  },
  {
    id: "senior",
    group: "elderly",
    title: "سلامت سالمندان",
    icon: "heart",
    description: "لوازم حرکت، مراقبت و پایش سلامت سالمندان",
    subcategories: [
      { id: "mobility", title: "عصا واکر" },
      { id: "incontinence", title: "لوازم بی‌اختیاری" },
      { id: "senior-supply", title: "ملزومات مراقبت" },
    ],
  },
  {
    id: "herbal-tea",
    group: "herbal",
    title: "دمنوش و گیاهان دارویی",
    icon: "leaf",
    description: "دمنوش، عرقیات سنتی و مکمل‌های گیاهی",
    subcategories: [
      { id: "tea", title: "دمنوش" },
      { id: "distillate", title: "عرقیات" },
      { id: "herbal-capsule", title: "کپسول گیاهی" },
    ],
  },
  {
    id: "sports",
    group: "sport",
    title: "مکمل ورزشی",
    icon: "activity",
    description: "مکمل افزایش عملکرد، بازیابی و تغذیه ورزشی",
    subcategories: [
      { id: "whey", title: "پروتئین وی" },
      { id: "creatine", title: "کراتین و آمینو" },
      { id: "pre-workout", title: "قبل از تمرین" },
    ],
  },
];

/** Fast lookups used by services and pages. */
export const categoryById = new Map(
  categories.map((category) => [category.id, category]),
);

export const groupById = new Map(
  categoryGroups.map((group) => [group.id, group]),
);

/** All leaf subcategories flattened, each carrying its parent. */
export const subcategories = categories.flatMap((category) =>
  category.subcategories.map((sub) => ({
    ...sub,
    categoryId: category.id,
    categoryTitle: category.title,
    group: category.group,
  })),
);

export const subcategoryById = new Map(
  subcategories.map((sub) => [sub.id, sub]),
);

/** Categories belonging to a group. */
export function categoriesInGroup(groupId) {
  return categories.filter((category) => category.group === groupId);
}

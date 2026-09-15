/**
 * DARUMIX — application entry point.
 *
 * Responsibilities:
 *   1. Mount the persistent shell (header, footer, drawers, overlays).
 *   2. Register every route with its lazily-imported page module.
 *   3. Start the router.
 *
 * Pages are code-split by route: a visitor who only browses the homepage never
 * downloads the admin dashboard, and vice versa.
 */

import "./styles/index.css";

import { el, qs } from "./core/dom.js";
import { route, startRouter, setMountTarget, to, refresh } from "./core/router.js";
import { appEvents, EVENTS } from "./core/event-bus.js";
import { storeEvents, subscribe, slices } from "./core/store.js";

import {
  ambientBackground,
  header,
  mobileNav,
  searchOverlay,
  footer,
  drawer,
  overlay,
} from "./ui/components/shell.js";
import {
  toastStack,
  toast,
  progressBar,
  modal,
  confirmDialog,
} from "./ui/components/overlays.js";
import { cartDrawer } from "./ui/components/cart-drawer.js";
import { icon } from "./ui/icons.js";
import * as cartService from "./services/cart.js";
import * as catalogService from "./services/catalog.js";
import * as blogService from "./services/blog.js";
import * as accountService from "./services/account.js";

/* ==========================================================================
   1. Route table
   ========================================================================== */

const ROUTES = [
  /* --- Storefront ------------------------------------------------------- */
  {
    path: "/",
    loader: () => import("./pages/home.js"),
    title: "داروخانه آنلاین",
  },
  {
    path: "/catalog",
    loader: () => import("./pages/catalog.js"),
    title: "فروشگاه",
  },
  {
    path: "/categories",
    loader: () => import("./pages/categories.js"),
    title: "دسته‌بندی‌ها",
  },
  {
    path: "/category/:id",
    loader: () => import("./pages/categories.js"),
    title: "دسته‌بندی",
  },
  {
    path: "/product/:slug",
    loader: () => import("./pages/product.js"),
    title: "جزئیات محصول",
  },
  { path: "/cart", loader: () => import("./pages/cart.js"), title: "سبد خرید" },
  {
    path: "/checkout",
    loader: () => import("./pages/checkout.js"),
    title: "تسویه حساب",
  },
  {
    path: "/wishlist",
    loader: () => import("./pages/wishlist.js"),
    title: "علاقه‌مندی‌ها",
  },
  {
    path: "/compare",
    loader: () => import("./pages/compare.js"),
    title: "مقایسه محصولات",
  },
  {
    path: "/recently-viewed",
    loader: () => import("./pages/recently-viewed.js"),
    title: "بازدیدهای اخیر",
  },

  /* --- Health services -------------------------------------------------- */
  {
    path: "/prescription",
    loader: () => import("./pages/prescription.js"),
    title: "ثبت نسخه الکترونیکی",
  },
  {
    path: "/consultation",
    loader: () => import("./pages/consultation.js"),
    title: "مشاوره داروساز",
  },
  {
    path: "/magazine",
    loader: () => import("./pages/magazine.js"),
    title: "مجله سلامت",
  },
  {
    path: "/magazine/:slug",
    loader: () => import("./pages/article.js"),
    title: "مقاله",
  },

  /* --- Account ---------------------------------------------------------- */
  {
    path: "/account",
    loader: () => import("./pages/account.js"),
    title: "حساب کاربری",
  },
  {
    path: "/account/orders",
    loader: () => import("./pages/orders.js"),
    title: "سفارش‌های من",
  },
  {
    path: "/account/order/:id",
    loader: () => import("./pages/order-detail.js"),
    title: "جزئیات سفارش",
  },
  {
    path: "/account/prescriptions",
    loader: () => import("./pages/my-prescriptions.js"),
    title: "نسخه‌های من",
  },
  {
    path: "/account/reviews",
    loader: () => import("./pages/my-reviews.js"),
    title: "نظرات من",
  },
  {
    path: "/account/notifications",
    loader: () => import("./pages/notifications.js"),
    title: "اعلان‌ها",
  },
  {
    path: "/account/settings",
    loader: () => import("./pages/account-settings.js"),
    title: "تنظیمات حساب",
  },

  /* --- Support ---------------------------------------------------------- */
  {
    path: "/faq",
    loader: () => import("./pages/faq.js"),
    title: "سوالات متداول",
  },
  {
    path: "/contact",
    loader: () => import("./pages/contact.js"),
    title: "تماس و شعبه‌ها",
  },
  {
    path: "/about",
    loader: () => import("./pages/about.js"),
    title: "درباره دارومیکس",
  },

  /* --- Admin dashboard -------------------------------------------------- */
  {
    path: "/admin",
    loader: () => import("./pages/admin/dashboard.js"),
    title: "پیشخوان مدیریت",
    meta: { admin: true },
  },
  {
    path: "/admin/analytics",
    loader: () => import("./pages/admin/analytics.js"),
    title: "تحلیل و آمار",
    meta: { admin: true },
  },
  {
    path: "/admin/products",
    loader: () => import("./pages/admin/products.js"),
    title: "مدیریت محصولات",
    meta: { admin: true },
  },
  {
    path: "/admin/categories",
    loader: () => import("./pages/admin/categories.js"),
    title: "مدیریت دسته‌بندی‌ها",
    meta: { admin: true },
  },
  {
    path: "/admin/orders",
    loader: () => import("./pages/admin/orders.js"),
    title: "مدیریت سفارش‌ها",
    meta: { admin: true },
  },
  {
    path: "/admin/customers",
    loader: () => import("./pages/admin/customers.js"),
    title: "مدیریت مشتریان",
    meta: { admin: true },
  },
  {
    path: "/admin/prescriptions",
    loader: () => import("./pages/admin/prescriptions.js"),
    title: "مدیریت نسخه‌ها",
    meta: { admin: true },
  },
  {
    path: "/admin/content",
    loader: () => import("./pages/admin/content.js"),
    title: "مدیریت محتوا",
    meta: { admin: true },
  },
  {
    path: "/admin/marketing",
    loader: () => import("./pages/admin/marketing.js"),
    title: "بازاریابی و کمپین‌ها",
    meta: { admin: true },
  },
];

ROUTES.forEach(({ path, loader, title, meta }) =>
  route(path, loader, { title, ...meta }),
);

/* ==========================================================================
   2. Shell
   ========================================================================== */

const app = document.getElementById("app");

if (!app) {
  throw new Error("[darumix] #app mount point is missing from index.html");
}

/** Build the persistent chrome and return its cleanup functions. */
function mountShell() {
  app.innerHTML = "";

  const shell = el("div", { class: "app-shell" });
  const main = el("main", {
    class: "app-main",
    id: "main-content",
    tabindex: "-1",
  });

  const routeView = el("div", { class: "route-view" });

  // Skip link is the first focusable element on the page.
  const skip = el("a", {
    class: "skip-link",
    href: "#main-content",
    text: "پرش به محتوای اصلی",
  });

  const headerBar = header();
  const navPanel = drawer({ title: "منوی دارومیکس", side: "start" });
  const navContent = mobileNav();
  navPanel.body.append(navContent.node);

  const search = searchOverlay();
  const backdrop = overlay();
  const cartPanel = cartDrawer();
  const toasts = toastStack();
  const progress = progressBar();

  const footerBar = footer();

  main.append(routeView);
  shell.append(headerBar.node, main, footerBar.node);

  app.append(
    skip,
    ambientBackground(),
    progress.node,
    shell,
    backdrop.node,
    navPanel.node,
    cartPanel.node,
    search.node,
    toasts.node,
  );

  setMountTarget(routeView);

  /* --- Drawer coordination ---------------------------------------------- */
  // Only one full-height panel may be open at a time, and the backdrop is
  // shared between them.
  const panels = [
    {
      instance: navPanel,
      openEvent: EVENTS.openNav,
      closeEvent: EVENTS.closeNav,
      bodyClass: "nav-open",
    },
    {
      instance: cartPanel,
      openEvent: EVENTS.openCart,
      closeEvent: EVENTS.closeCart,
      bodyClass: "cart-open",
    },
  ];

  const disposers = [];

  function closeAllPanels(except) {
    panels.forEach((panel) => {
      if (panel.instance !== except) {
        panel.instance.close();
        document.body.classList.remove(panel.bodyClass);
      }
    });
  }

  panels.forEach((panel) => {
    disposers.push(
      appEvents.on(panel.openEvent, () => {
        closeAllPanels(panel.instance);
        panel.instance.open();
        document.body.classList.add(panel.bodyClass);
        backdrop.show();
      }),
    );

    disposers.push(
      appEvents.on(panel.closeEvent, () => {
        panel.instance.close();
        document.body.classList.remove(panel.bodyClass);
        backdrop.hide();
      }),
    );

    // The shared backdrop closes whichever panel is open.
    backdrop.node.addEventListener("click", () => {
      closeAllPanels(null);
      document.body.classList.remove(panel.bodyClass);
      backdrop.hide();
      appEvents.emit(EVENTS.closeSearch);
    });

    // Closing from inside a panel (Esc, close button, "continue" links) must
    // also hide the backdrop.
    disposers.push(
      storeEvents.on("change", () => {
        if (!panel.instance.isOpen())
          document.body.classList.remove(panel.bodyClass);
        if (!panels.some((entry) => entry.instance.isOpen())) backdrop.hide();
      }),
    );
  });

  /* --- Global openers (used by header buttons and pages) ----------------- */
  disposers.push(
    document.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      if (target.closest("[data-open-cart]")) {
        event.preventDefault();
        appEvents.emit(EVENTS.openCart);
      }

      if (target.closest("[data-open-nav]")) {
        event.preventDefault();
        appEvents.emit(EVENTS.openNav);
      }

      if (target.closest("[data-open-search]")) {
        event.preventDefault();
        appEvents.emit(EVENTS.openSearch);
      }
    }),
  );

  /* --- Header badge subscription ---------------------------------------- */
  disposers.push(
    subscribe(() => {
      // The header subscribes on its own; this keeps the document title badge
      // (and anything else document-level) in sync without extra plumbing.
      const count = cartService.count();
      document.body.dataset.cartCount = String(count);
    }),
  );

  return {
    routeView,
    cleanup: () => {
      disposers.forEach((dispose) => dispose());
      headerBar.cleanup();
      navContent.cleanup();
      navPanel.cleanup();
      search.cleanup();
      cartPanel.cleanup();
      toasts.cleanup();
      progress.cleanup();
    },
  };
}

/* ==========================================================================
   3. Global event wiring
   ========================================================================== */

const shell = mountShell();

/** Confirm the "add to cart" toast with an undo-style action. */
appEvents.on(EVENTS.productAdded, ({ product, quantity }) => {
  toast.success("به سبد خرید اضافه شد", `${product.name} — ${quantity} عدد`, {
    duration: 3600,
    action: {
      label: "مشاهده سبد",
      onClick: () => appEvents.emit(EVENTS.openCart),
    },
  });
});

/** Wishlist / compare feedback. */
appEvents.on(EVENTS.favoritesChanged, ({ added, productId }) => {
  if (added)
    toast.success(
      "به علاقه‌مندی‌ها اضافه شد",
      "می‌توانید بعداً از فهرست علاقه‌مندی‌ها خرید کنید.",
    );
  else toast.info("از علاقه‌مندی‌ها حذف شد");
});

appEvents.on(EVENTS.compareChanged, ({ added }) => {
  if (added)
    toast.info(
      "به لیست مقایسه اضافه شد",
      "حداکثر ۴ محصول را می‌توانید مقایسه کنید.",
    );
  else toast.info("از لیست مقایسه حذف شد");
});

/** Surface unexpected errors instead of failing silently. */
window.addEventListener("unhandledrejection", (event) => {
  console.error("[darumix] unhandled rejection:", event.reason);
});

window.addEventListener("error", (event) => {
  if (event.message && event.message.includes("ResizeObserver")) return; // benign
  console.error("[darumix] runtime error:", event.message);
});

/* ==========================================================================
   4. Start
   ========================================================================== */

// First visit: make sure a profile exists so the account area is navigable
// without a separate "sign in" step in this frontend-only demo.
import("./services/account.js")
  .then((account) => {
    if (!account.profile()) account.ensureProfile();
  })
  .catch(() => {});

startRouter();

// Expose a tiny debug surface — handy in the browser console, harmless in prod.
window.DARUMIX = {
  version: "1.0.0",
  routes: ROUTES.map((entry) => entry.path),
  /** Force a re-render of the active route (used by the smoke test). */
  render: () => refresh(),
  toast,
  modal,
  confirmDialog,
  navigate: (path, query) => {
    window.location.hash = to(path, query).slice(1);
  },
  resetDemoData: async () => {
    const admin = await import("./services/admin.js");
    admin.resetDemoData();
    window.location.reload();
  },
  /**
   * Concrete ids for the parameterised routes — used by the smoke test so it
   * can visit `/product/:slug`-style routes without importing the services a
   * second time (which would instantiate a separate module graph).
   */
  sampleParams: () => {
    const product = catalogService.allProducts()[0];
    const category = catalogService.allCategories()[0];
    const article = blogService.allArticles()[0];
    const order = accountService.orderHistory(1)[0];

    return {
      productSlug: product?.slug || "",
      categoryId: category?.id || "",
      articleSlug: article?.slug || "",
      orderId: order?.id || "",
    };
  },
  state: () =>
    Object.fromEntries(
      Object.entries(slices).map(([key, slice]) => [key, slice.get()]),
    ),
};

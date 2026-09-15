/**
 * DARUMIX — admin dashboard (overview).
 *
 * Headline KPIs, a revenue trend, the order status breakdown, inventory
 * warnings and the newest orders / prescriptions that need attention.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { to } from "../../core/router.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
  formatRelativeTime,
} from "../../core/format.js";
import { statusBadge, meter, emptyState } from "../../ui/components/common.js";
import { toast } from "../../ui/components/overlays.js";
import {
  ORDER_STATUSES,
  PRESCRIPTION_STATUSES,
  statusOf,
} from "../../data/statuses.js";
import * as admin from "../../services/admin.js";
import * as catalogService from "../../services/catalog.js";
import { adminLayout, kpiTile, money } from "./_layout.js";
import { revenueChart } from "../../ui/components/charts.js";

export default async function adminDashboardPage() {
  const overview = admin.overview();
  const revenue = admin.revenueSeries(14);
  const mix = admin.categoryMix();
  const segmentStats = admin.customerSegments();

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const stats = [
    kpiTile({
      label: "درآمد کل",
      value: money(overview.revenue),
      iconName: "currency",
      tone: "brand",
      change: overview.revenueChange,
      hint: "تومان",
    }),
    kpiTile({
      label: "سفارش‌ها",
      value: toPersianDigits(overview.orders),
      iconName: "package",
      tone: "mint",
      change: overview.ordersChange,
      hint: "کل سفارش‌های ثبت‌شده",
    }),
    kpiTile({
      label: "میانگین سبد",
      value: money(overview.averageOrder),
      iconName: "chart",
      tone: "blue",
      change: overview.averageOrderChange,
      hint: "تومان",
    }),
    kpiTile({
      label: "مشتریان",
      value: toPersianDigits(overview.customers),
      iconName: "users",
      tone: "gold",
      change: overview.customersChange,
      hint: `${toPersianDigits(overview.conversionRate)}٪ نرخ تبدیل`,
    }),
  ];

  /* -------------------------------------------------------------------------
     Content
     ------------------------------------------------------------------------- */

  const content = el("div", { class: "stack stack--lg" });

  content.innerHTML = html`
    <!-- ===================== Charts row ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${raw(icon("trendingUp", { size: 20 }))} روند درآمد ۱۴ روز اخیر
          </h2>
          <span class="badge badge--neutral"
            >مجموع
            ${money(revenue.reduce((total, entry) => total + entry.revenue, 0))}
            تومان</span
          >
        </div>
        <div data-slot="revenue"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("pieChart", { size: 20 }))} سهم دسته‌بندی‌ها
        </h2>
        <div class="stack" data-slot="mix"></div>
      </section>
    </div>

    <!-- ===================== Status + inventory ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("layers", { size: 20 }))} وضعیت سفارش‌ها
        </h2>
        <div class="stack" data-slot="statuses"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${raw(icon("database", { size: 20 }))} وضعیت انبار
          </h2>
          <a class="btn btn--ghost btn--xs" href="${to("/admin/products")}"
            >مدیریت محصولات</a
          >
        </div>
        <div class="stack" data-slot="inventory"></div>
      </section>
    </div>

    <!-- ===================== Recent orders ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <h2 class="mb-0">${raw(icon("clock", { size: 20 }))} آخرین سفارش‌ها</h2>
        <a class="btn btn--ghost btn--xs" href="${to("/admin/orders")}"
          >همه سفارش‌ها</a
        >
      </div>
      <div class="table-wrap" data-slot="orders"></div>
    </section>

    <!-- ===================== Attention needed ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${raw(icon("prescription", { size: 20 }))} نسخه‌های در انتظار
          </h2>
          <a class="btn btn--ghost btn--xs" href="${to("/admin/prescriptions")}"
            >مدیریت نسخه‌ها</a
          >
        </div>
        <div class="stack stack--sm" data-slot="prescriptions"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${raw(icon("users", { size: 20 }))} بخش‌بندی مشتریان
          </h2>
          <a class="btn btn--ghost btn--xs" href="${to("/admin/customers")}"
            >مدیریت مشتریان</a
          >
        </div>
        <div class="stack stack--sm" data-slot="segments"></div>
      </section>
    </div>

    <!-- ===================== Service KPIs ===================== -->
    <section class="glass radius-xl p-6">
      <h2 class="mb-6">
        ${raw(icon("stethoscope", { size: 20 }))} شاخص‌های خدمات سلامت
      </h2>
      <div class="auto-grid auto-grid--wide" data-slot="service"></div>
    </section>
  `.toString();

  /* -------------------------------------------------------------------------
     Revenue chart
     ------------------------------------------------------------------------- */

  const revenueSlot = qs('[data-slot="revenue"]', content);

  const chart = revenueChart(revenue, {
    valueKey: "revenue",
    labelKey: "date",
    height: 220,
    formatValue: (value) => money(value),
  });
  revenueSlot.append(chart.node);

  /* -------------------------------------------------------------------------
     Category mix
     ------------------------------------------------------------------------- */

  const mixSlot = qs('[data-slot="mix"]', content);

  if (!mix.length) {
    mixSlot.innerHTML = html`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString();
  } else {
    mixSlot.innerHTML = html`
      ${mix.map((entry) =>
        raw(html`
          <div class="mix-row">
            <div class="row row--between">
              <span class="fs-sm fw-semibold">${entry.title}</span>
              <span class="fs-sm">${toPersianDigits(entry.percent)}٪</span>
            </div>
            ${raw(meter(entry.percent, "brand"))}
            <div class="row row--between fs-xs text-soft">
              <span>${toPersianDigits(entry.units)} عدد فروش</span>
              <span>${money(entry.revenue)} تومان</span>
            </div>
          </div>
        `),
      )}
    `.toString();
  }

  /* -------------------------------------------------------------------------
     Order statuses
     ------------------------------------------------------------------------- */

  const statusSlot = qs('[data-slot="statuses"]', content);
  const totalOrders = overview.orders || 1;

  const activeStatuses = ORDER_STATUSES.map((status) => ({
    ...status,
    count: overview.statusCounts[status.id] || 0,
  })).filter((status) => status.count > 0);

  statusSlot.innerHTML = html`
    ${activeStatuses.map((status) =>
      raw(html`
        <div class="status-row">
          <div class="row row--sm">
            ${raw(statusBadge(status))}
            <span class="grow"></span>
            <span class="fw-bold fs-sm">${toPersianDigits(status.count)}</span>
            <span class="fs-xs text-soft"
              >${toPersianDigits(
                Math.round((status.count / totalOrders) * 100),
              )}٪</span
            >
          </div>
          ${raw(meter((status.count / totalOrders) * 100))}
        </div>
      `),
    )}
  `.toString();

  /* -------------------------------------------------------------------------
     Inventory
     ------------------------------------------------------------------------- */

  const inventorySlot = qs('[data-slot="inventory"]', content);
  const inventory = overview.inventory;

  inventorySlot.innerHTML = html`
    <div class="row row--between">
      <span class="fs-sm">تعداد کل محصولات</span>
      <span class="fw-bold">${toPersianDigits(inventory.total)}</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">مجموع موجودی (عدد)</span>
      <span class="fw-bold">${toPersianDigits(inventory.totalUnits)}</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">ارزش موجودی انبار</span>
      <span class="fw-bold">${money(inventory.inventoryValue)} تومان</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">میانگین امتیاز محصولات</span>
      <span class="fw-bold"
        >${toPersianDigits(inventory.averageRating.toFixed(2))}</span
      >
    </div>

    <div class="divider"></div>

    ${inventory.lowStock.length
      ? html`
          <div class="alert alert--warn">
            ${raw(icon("alert", { size: 18 }))}
            <span>
              <strong>${toPersianDigits(inventory.lowStock.length)}</strong>
              محصول موجودی کم دارد.
              <button class="link-like" type="button" data-show-low>
                مشاهده
              </button>
            </span>
          </div>
        `
      : ""}
    ${inventory.outOfStock.length
      ? html`
          <div class="alert alert--danger">
            ${raw(icon("x", { size: 18 }))}
            <span>
              <strong>${toPersianDigits(inventory.outOfStock.length)}</strong>
              محصول ناموجود است.
              <button class="link-like" type="button" data-show-out>
                مشاهده
              </button>
            </span>
          </div>
        `
      : ""}
  `.toString();

  /* -------------------------------------------------------------------------
     Recent orders table
     ------------------------------------------------------------------------- */

  const ordersSlot = qs('[data-slot="orders"]', content);
  const recentOrders = admin.orders().slice(0, 6);

  ordersSlot.innerHTML = html`
    <table class="table">
      <thead>
        <tr>
          <th scope="col">کد سفارش</th>
          <th scope="col">مشتری</th>
          <th scope="col">تاریخ</th>
          <th scope="col">اقلام</th>
          <th scope="col">مبلغ</th>
          <th scope="col">وضعیت</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        ${recentOrders.map((order) => {
          const status = statusOf("order", order.status);

          return raw(html`
            <tr>
              <td class="fw-semibold">${order.id}</td>
              <td>
                <div class="fs-sm">${order.customerName}</div>
                <span class="fs-xs text-soft">${order.city || "—"}</span>
              </td>
              <td class="fs-sm">${formatDate(order.placedAt)}</td>
              <td>${toPersianDigits(order.itemCount)}</td>
              <td class="fw-semibold">${money(order.total)}</td>
              <td>${raw(statusBadge(status))}</td>
              <td>
                <button
                  class="btn btn--ghost btn--xs"
                  type="button"
                  data-order-detail="${order.id}"
                >
                  جزئیات
                </button>
              </td>
            </tr>
          `);
        })}
      </tbody>
    </table>
  `.toString();

  /* -------------------------------------------------------------------------
     Pending prescriptions
     ------------------------------------------------------------------------- */

  const rxSlot = qs('[data-slot="prescriptions"]', content);
  const pending = admin.prescriptions({ status: "submitted" }).slice(0, 4);

  if (!pending.length) {
    rxSlot.append(
      emptyState({
        iconName: "prescription",
        title: "نسخه‌ای در انتظار بررسی نیست",
        compact: true,
      }).node,
    );
  } else {
    pending.forEach((entry) => {
      const row = el("div", { class: "attention-row" });
      row.innerHTML = html`
        <span class="attention-row__icon"
          >${raw(icon("prescription", { size: 18 }))}</span
        >
        <div class="grow">
          <div class="row row--sm">
            <span class="fw-semibold fs-sm">${entry.id}</span>
            ${raw(statusBadge(statusOf("prescription", entry.status)))}
          </div>
          <span class="fs-xs text-soft"
            >${entry.customerName} ·
            ${toPersianDigits(entry.medicineCount || 0)} قلم ·
            ${formatRelativeTime(entry.submittedAt)}</span
          >
        </div>
        <a class="btn btn--glass btn--xs" href="${to("/admin/prescriptions")}"
          >بررسی</a
        >
      `.toString();
      rxSlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Customer segments
     ------------------------------------------------------------------------- */

  const segmentSlot = qs('[data-slot="segments"]', content);
  const maxSegment = Math.max(...segmentStats.map((entry) => entry.count), 1);

  segmentSlot.innerHTML = html`
    ${segmentStats.map((entry) =>
      raw(html`
        <div class="status-row">
          <div class="row row--between">
            <span class="fs-sm">${entry.label}</span>
            <span class="fw-bold fs-sm">${toPersianDigits(entry.count)}</span>
          </div>
          ${raw(meter((entry.count / maxSegment) * 100, "mint"))}
        </div>
      `),
    )}
  `.toString();

  /* -------------------------------------------------------------------------
     Health-service KPIs
     ------------------------------------------------------------------------- */

  const serviceSlot = qs('[data-slot="service"]', content);

  [
    {
      label: "نسخه در انتظار",
      value: overview.prescriptions.pending,
      icon: "clock",
      tone: "gold",
    },
    {
      label: "کل نسخه‌ها",
      value: overview.prescriptions.total,
      icon: "prescription",
      tone: "brand",
    },
    {
      label: "مشاوره‌ها",
      value: overview.consultations,
      icon: "stethoscope",
      tone: "mint",
    },
    {
      label: "مقالات منتشرشده",
      value: overview.articles,
      icon: "bookmark",
      tone: "blue",
    },
    {
      label: "کالای ناموجود",
      value: overview.outOfStock,
      icon: "x",
      tone: "gold",
    },
    {
      label: "کالای کم‌موجود",
      value: overview.lowStock,
      icon: "alert",
      tone: "gold",
    },
  ].forEach((entry) => {
    const tile = el("div", { class: "mini-stat glass radius-lg" });
    tile.innerHTML = html`
      <span class="mini-stat__icon stat__icon--${entry.tone}"
        >${raw(icon(entry.icon, { size: 18 }))}</span
      >
      <span class="mini-stat__value">${toPersianDigits(entry.value)}</span>
      <span class="mini-stat__label">${entry.label}</span>
    `.toString();
    serviceSlot.append(tile);
  });

  /* -------------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------------- */

  const layout = adminLayout({
    title: "پیشخوان مدیریت",
    subtitle: "نمای کلی فروش، سفارش‌ها، انبار و خدمات سلامت دارومیکس.",
    iconName: "grid",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  const disposers = [];

  disposers.push(
    delegate(content, "click", "[data-show-low]", (event) => {
      event.preventDefault();
      const names = inventory.lowStock
        .slice(0, 8)
        .map((product) => product.name)
        .join("، ");
      toast.warn(
        `${toPersianDigits(inventory.lowStock.length)} کالای کم‌موجود`,
        names || "برای مشاهده کامل به بخش محصولات بروید.",
        { duration: 6000 },
      );
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-show-out]", (event) => {
      event.preventDefault();
      const names = inventory.outOfStock
        .map((product) => product.name)
        .join("، ");
      toast.error(
        `${toPersianDigits(inventory.outOfStock.length)} کالای ناموجود`,
        names || "برای مشاهده کامل به بخش محصولات بروید.",
        { duration: 6000 },
      );
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-order-detail]", async (event, button) => {
      event.preventDefault();

      const { orderDrawer } = await import("./_shared.js");
      orderDrawer(admin.orderById(button.dataset.orderDetail));
    }),
  );

  void PRESCRIPTION_STATUSES;
  void catalogService;

  return {
    node: layout.node,
    title: "پیشخوان مدیریت",
    cleanup: () => {
      chart.cleanup?.();
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

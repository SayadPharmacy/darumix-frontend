/**
 * DARUMIX — admin analytics.
 *
 * Revenue trend, weekday pattern, category mix, traffic sources, top products,
 * order-status funnel and inventory health — all from one service call.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { to } from "../../core/router.js";
import { toPersianDigits, formatPrice } from "../../core/format.js";
import { statusBadge, meter, emptyState } from "../../ui/components/common.js";
import { toast } from "../../ui/components/overlays.js";
import { statusOf } from "../../data/statuses.js";
import * as admin from "../../services/admin.js";
import * as catalogService from "../../services/catalog.js";
import { adminLayout, kpiTile, money } from "./_layout.js";
import {
  revenueChart,
  barList,
  donutChart,
  sparkline,
} from "../../ui/components/charts.js";

export default async function adminAnalyticsPage() {
  const data = admin.analytics();
  const overview = admin.overview();

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const totalRevenue = data.revenue.reduce(
    (total, entry) => total + entry.revenue,
    0,
  );
  const totalOrders = data.revenue.reduce(
    (total, entry) => total + entry.orders,
    0,
  );

  const stats = [
    kpiTile({
      label: "درآمد ۱۴ روز",
      value: money(totalRevenue),
      iconName: "currency",
      tone: "brand",
      change: overview.revenueChange,
      hint: "تومان",
    }),
    kpiTile({
      label: "سفارش ۱۴ روز",
      value: toPersianDigits(totalOrders),
      iconName: "package",
      tone: "mint",
      change: overview.ordersChange,
    }),
    kpiTile({
      label: "نرخ تبدیل",
      value: `${toPersianDigits(overview.conversionRate)}٪`,
      iconName: "target",
      tone: "blue",
      change: overview.conversionChange,
      hint: "بازدید به خرید",
    }),
    kpiTile({
      label: "رضایت مشتری",
      value: toPersianDigits(overview.satisfactionScore),
      iconName: "star",
      tone: "gold",
      hint: `نرخ مرجوعی ${toPersianDigits(overview.returnRate)}٪`,
    }),
  ];

  /* -------------------------------------------------------------------------
     Content
     ------------------------------------------------------------------------- */

  const content = el("div", { class: "stack stack--lg" });

  content.innerHTML = html`
    <!-- ===================== Revenue ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <div>
          <h2 class="mb-1">
            ${raw(icon("trendingUp", { size: 20 }))} روند درآمد و سفارش
          </h2>
          <p class="fs-sm text-muted mb-0">
            بازه ۱۴ روز گذشته — مجموع ${formatPrice(totalRevenue)}
          </p>
        </div>
        <button class="btn btn--glass btn--sm" type="button" data-export>
          ${raw(icon("download", { size: 15 }))} خروجی CSV (نمایشی)
        </button>
      </div>
      <div data-slot="revenue"></div>
    </section>

    <!-- ===================== Weekday + donut ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("calendar", { size: 20 }))} الگوی فروش هفتگی
        </h2>
        <div data-slot="weekday"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("pieChart", { size: 20 }))} سهم درآمد دسته‌بندی‌ها
        </h2>
        <div data-slot="mix"></div>
      </section>
    </div>

    <!-- ===================== Traffic + top products ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("globe", { size: 20 }))} منابع ورودی بازدیدکنندگان
        </h2>
        <div data-slot="traffic"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${raw(icon("crown", { size: 20 }))} پرفروش‌ترین محصولات
          </h2>
          <a class="btn btn--ghost btn--xs" href="${to("/admin/products")}"
            >محصولات</a
          >
        </div>
        <div class="table-wrap" data-slot="top"></div>
      </section>
    </div>

    <!-- ===================== Funnel + inventory ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("layers", { size: 20 }))} قیف وضعیت سفارش‌ها
        </h2>
        <div class="stack" data-slot="funnel"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">${raw(icon("database", { size: 20 }))} سلامت انبار</h2>
        <div class="stack" data-slot="inventory"></div>
      </section>
    </div>

    <!-- ===================== Segments ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <h2 class="mb-0">
          ${raw(icon("users", { size: 20 }))} بخش‌بندی مشتریان
        </h2>
        <a class="btn btn--ghost btn--xs" href="${to("/admin/customers")}"
          >مدیریت مشتریان</a
        >
      </div>
      <div class="auto-grid auto-grid--wide" data-slot="segments"></div>
    </section>
  `.toString();

  /* -------------------------------------------------------------------------
     Revenue chart
     ------------------------------------------------------------------------- */

  const revenueSlot = qs('[data-slot="revenue"]', content);
  const chart = revenueChart(data.revenue, {
    valueKey: "revenue",
    labelKey: "date",
    height: 240,
    formatValue: (value) => money(value),
  });
  revenueSlot.append(chart.node);

  /* -------------------------------------------------------------------------
     Weekday bars
     ------------------------------------------------------------------------- */

  const weekdaySlot = qs('[data-slot="weekday"]', content);
  const weekdayChart = barList(
    data.weekday.map((entry) => ({
      label: entry.label,
      value: entry.value,
      hint: entry.value ? `${money(entry.value)} تومان` : "بدون فروش",
    })),
    { formatValue: (value) => `${money(value)} تومان`, tone: "mint" },
  );
  weekdaySlot.append(weekdayChart.node);

  /* -------------------------------------------------------------------------
     Category donut
     ------------------------------------------------------------------------- */

  const mixSlot = qs('[data-slot="mix"]', content);

  if (data.mix.length) {
    const donut = donutChart(
      data.mix.map((entry, index) => ({
        label: entry.title,
        value: entry.revenue,
        tone: ["brand", "mint", "teal", "blue", "gold", "neutral"][index % 6],
      })),
      {
        centerLabel: "تومان درآمد",
        centerValue: money(
          data.mix.reduce((total, entry) => total + entry.revenue, 0),
        ),
      },
    );
    mixSlot.append(donut.node);
  } else {
    mixSlot.append(
      emptyState({
        iconName: "pieChart",
        title: "داده‌ای برای سهم دسته‌بندی نیست",
        compact: true,
      }).node,
    );
  }

  /* -------------------------------------------------------------------------
     Traffic sources
     ------------------------------------------------------------------------- */

  const trafficSlot = qs('[data-slot="traffic"]', content);
  const trafficChart = barList(
    data.traffic.map((entry) => ({
      label: entry.label,
      value: entry.visits,
      icon: entry.icon,
      hint: `${toPersianDigits(entry.percent)}٪ از کل بازدیدها`,
    })),
    { formatValue: (value) => toPersianDigits(value) },
  );
  trafficSlot.append(trafficChart.node);

  /* -------------------------------------------------------------------------
     Top products
     ------------------------------------------------------------------------- */

  const topSlot = qs('[data-slot="top"]', content);

  if (!data.top.length) {
    topSlot.append(
      emptyState({
        iconName: "bag",
        title: "فروشی ثبت نشده است",
        compact: true,
      }).node,
    );
  } else {
    topSlot.innerHTML = html`
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">محصول</th>
            <th scope="col">فروش</th>
            <th scope="col">درآمد</th>
            <th scope="col">روند</th>
          </tr>
        </thead>
        <tbody>
          ${data.top.map((entry, index) => {
            const product = catalogService.getProductById(entry.productId);

            return raw(html`
              <tr>
                <td class="fw-bold">${toPersianDigits(index + 1)}</td>
                <td>
                  <a
                    class="fw-semibold fs-sm"
                    href="${product ? to(`/product/${product.slug}`) : to("/admin/products")}"
                    >${entry.name}</a
                  >
                </td>
                <td>${toPersianDigits(entry.units)}</td>
                <td class="fw-semibold">${money(entry.revenue)}</td>
                <td data-slot-inline="spark-${index}"></td>
              </tr>
            `);
          })}
        </tbody>
      </table>
    `.toString();

    // Sparklines are DOM nodes, so they are appended after the markup lands.
    data.top.forEach((entry, index) => {
      const cell = qs(`[data-slot-inline="spark-${index}"]`, topSlot);
      if (!cell) return;

      const trend = sparkline(
        Array.from(
          { length: 8 },
          (_, i) => entry.units * (0.6 + ((index + i) % 5) / 6),
        ),
        { tone: "brand" },
      );
      cell.append(trend.node);
    });
  }

  /* -------------------------------------------------------------------------
     Funnel
     ------------------------------------------------------------------------- */

  const funnelSlot = qs('[data-slot="funnel"]', content);
  const totalFunnel = overview.orders || 1;

  funnelSlot.innerHTML = html`
    ${["pending", "confirmed", "processing", "shipped", "delivered"].map(
      (id) => {
        const status = statusOf("order", id);
        const count = overview.statusCounts[id] || 0;

        return raw(html`
          <div class="status-row">
            <div class="row row--sm">
              ${raw(statusBadge(status))}
              <span class="grow"></span>
              <span class="fw-bold fs-sm">${toPersianDigits(count)}</span>
              <span class="fs-xs text-soft"
                >${toPersianDigits(
                  Math.round((count / totalFunnel) * 100),
                )}٪</span
              >
            </div>
            ${raw(meter((count / totalFunnel) * 100))}
          </div>
        `);
      },
    )}
    <div class="summary-row summary-row--total mt-4">
      <span>کل سفارش‌ها</span>
      <span>${toPersianDigits(overview.orders)}</span>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Inventory health
     ------------------------------------------------------------------------- */

  const inventorySlot = qs('[data-slot="inventory"]', content);
  const inventory = data.inventory;

  inventorySlot.innerHTML = html`
    <div class="summary-row">
      <span>محصولات فعال</span>
      <span class="fw-bold">${toPersianDigits(inventory.total)}</span>
    </div>
    <div class="summary-row">
      <span>موجودی کل</span>
      <span class="fw-bold">${toPersianDigits(inventory.totalUnits)} عدد</span>
    </div>
    <div class="summary-row">
      <span>ارزش انبار</span>
      <span class="fw-bold">${money(inventory.inventoryValue)} تومان</span>
    </div>
    <div class="summary-row">
      <span>میانگین امتیاز</span>
      <span class="fw-bold"
        >${toPersianDigits(inventory.averageRating.toFixed(2))}</span
      >
    </div>

    <div class="divider"></div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">موجودی سالم</span>
        <span class="fw-bold"
          >${toPersianDigits(
            inventory.total -
              inventory.lowStock.length -
              inventory.outOfStock.length,
          )}</span
        >
      </div>
      ${raw(
        meter(
          ((inventory.total -
            inventory.lowStock.length -
            inventory.outOfStock.length) /
            (inventory.total || 1)) *
            100,
          "mint",
        ),
      )}
    </div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">موجودی کم</span>
        <span class="fw-bold"
          >${toPersianDigits(inventory.lowStock.length)}</span
        >
      </div>
      ${raw(
        meter(
          (inventory.lowStock.length / (inventory.total || 1)) * 100,
          "gold",
        ),
      )}
    </div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">ناموجود</span>
        <span class="fw-bold"
          >${toPersianDigits(inventory.outOfStock.length)}</span
        >
      </div>
      ${raw(
        meter(
          (inventory.outOfStock.length / (inventory.total || 1)) * 100,
          "danger",
        ),
      )}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Segments
     ------------------------------------------------------------------------- */

  const segmentSlot = qs('[data-slot="segments"]', content);

  data.segments.forEach((segment) => {
    const tile = el("div", { class: "mini-stat glass radius-lg" });
    tile.innerHTML = html`
      <span class="mini-stat__value">${toPersianDigits(segment.count)}</span>
      <span class="mini-stat__label">${segment.label}</span>
    `.toString();
    segmentSlot.append(tile);
  });

  /* -------------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------------- */

  const layout = adminLayout({
    title: "تحلیل و آمار",
    subtitle: "عملکرد فروش، رفتار بازدیدکنندگان و سلامت انبار در یک نگاه.",
    iconName: "chart",
    stats,
    content,
    actions: (() => {
      const link = el("a", {
        class: "btn btn--glass btn--sm",
        href: to("/admin"),
      });
      link.innerHTML = html`${raw(icon("grid", { size: 15 }))} پیشخوان`.toString();
      return link;
    })(),
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  const disposers = [];

  disposers.push(
    delegate(content, "click", "[data-export]", (event) => {
      event.preventDefault();
      toast.info(
        "خروجی CSV در نسخه نمایشی غیرفعال است",
        "در نسخه واقعی، گزارش درآمد به‌صورت فایل قابل دانلود تولید می‌شود.",
      );
    }),
  );

  return {
    node: layout.node,
    title: "تحلیل و آمار",
    cleanup: () => {
      chart.cleanup?.();
      weekdayChart.cleanup?.();
      trafficChart.cleanup?.();
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

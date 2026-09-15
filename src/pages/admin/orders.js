/**
 * DARUMIX — admin order management.
 *
 * Filter by status, search, inspect any order in a drawer and advance it along
 * the fulfilment pipeline. Status changes are held by the admin service.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { to, updateQuery } from "../../core/router.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
  formatRelativeTime,
} from "../../core/format.js";
import { statusBadge, meter } from "../../ui/components/common.js";
import { toast } from "../../ui/components/overlays.js";
import { ORDER_STATUSES, statusOf } from "../../data/statuses.js";
import * as admin from "../../services/admin.js";
import { adminLayout, kpiTile } from "./_layout.js";
import {
  adminToolbar,
  adminPager,
  orderDrawer,
  tableEmpty,
} from "./_shared.js";

const STATUS_TABS = [
  { id: "all", label: "همه" },
  ...ORDER_STATUSES.map((status) => ({ id: status.id, label: status.label })),
];

export default async function adminOrdersPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  const filters = {
    q: query.q || "",
    status: STATUS_TABS.some((entry) => entry.id === query.status)
      ? query.status
      : "all",
    page: Math.max(1, Number(query.page) || 1),
  };

  const perPage = 12;

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const overview = admin.overview();
  const allOrders = admin.orders();
  const revenue = allOrders
    .filter((order) => !["cancelled", "returned"].includes(order.status))
    .reduce((total, order) => total + order.total, 0);

  const stats = [
    kpiTile({
      label: "کل سفارش‌ها",
      value: toPersianDigits(allOrders.length),
      iconName: "package",
      tone: "brand",
      change: overview.ordersChange,
    }),
    kpiTile({
      label: "درآمد تأییدشده",
      value: formatPrice(revenue, { withUnit: false }),
      iconName: "currency",
      tone: "mint",
      change: overview.revenueChange,
      hint: "تومان",
    }),
    kpiTile({
      label: "در انتظار تأیید",
      value: toPersianDigits(overview.statusCounts.pending || 0),
      iconName: "clock",
      tone: "gold",
      hint: "نیازمند اقدام",
    }),
    kpiTile({
      label: "در حال ارسال",
      value: toPersianDigits(overview.statusCounts.shipped || 0),
      iconName: "truck",
      tone: "blue",
      hint: "خارج از انبار",
    }),
  ];

  /* -------------------------------------------------------------------------
     Query
     ------------------------------------------------------------------------- */

  function select() {
    const result = admin.filterOrders({
      status: filters.status,
      q: filters.q,
      page: filters.page,
      perPage,
    });
    filters.page = result.page;
    return result;
  }

  /* -------------------------------------------------------------------------
     Toolbar + status chips
     ------------------------------------------------------------------------- */

  const toolbar = adminToolbar({
    placeholder: "جستجو با کد سفارش، نام مشتری، شهر یا شماره تماس…",
    value: filters.q,
    onSearch: (term) => {
      filters.q = term;
      filters.page = 1;
      updateQuery({ q: term || null });
    },
    extra: (() => {
      const wrap = el("div", { class: "row row--sm" });
      wrap.innerHTML = html`
        <select class="select" data-sort-orders style="min-width:160px">
          <option value="newest">جدیدترین</option>
          <option value="amount-desc">بیشترین مبلغ</option>
          <option value="amount-asc">کمترین مبلغ</option>
        </select>
      `.toString();
      return wrap;
    })(),
  });

  disposers.push(toolbar.cleanup);

  const statusBar = el("div", { class: "admin-status-bar" });
  statusBar.innerHTML = html`
    ${STATUS_TABS.map((entry) => {
      const count =
        entry.id === "all"
          ? allOrders.length
          : overview.statusCounts[entry.id] || 0;

      return raw(html`
        <button
          class="chip${entry.id === filters.status ? " is-active" : ""}"
          type="button"
          data-status="${entry.id}"
        >
          ${entry.label}
          <span class="chip__count">${toPersianDigits(count)}</span>
        </button>
      `);
    })}
  `.toString();

  const tableHost = el("div");

  /* -------------------------------------------------------------------------
     Table
     ------------------------------------------------------------------------- */

  function renderTable() {
    const result = select();

    if (!result.items.length) {
      tableHost.innerHTML = "";
      tableHost.append(
        tableEmpty(
          "سفارشی با این مشخصات پیدا نشد",
          "فیلتر وضعیت یا عبارت جستجو را تغییر دهید.",
        ),
      );
      toolbar.setSummary("");
      return;
    }

    tableHost.innerHTML = html`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">کد سفارش</th>
              <th scope="col">مشتری</th>
              <th scope="col">تاریخ</th>
              <th scope="col">اقلام</th>
              <th scope="col">مبلغ</th>
              <th scope="col">وضعیت</th>
              <th scope="col">پیشرفت</th>
              <th scope="col" style="width:100px"></th>
            </tr>
          </thead>
          <tbody>
            ${result.items.map((order) => {
              const status = statusOf("order", order.status);
              const stepIndex = [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
              ].indexOf(order.status);
              const progress =
                stepIndex >= 0
                  ? ((stepIndex + 1) / 5) * 100
                  : order.status === "delivered"
                    ? 100
                    : 0;

              return raw(html`
                <tr>
                  <td>
                    <span class="fw-semibold">${order.id}</span>
                    ${order.hasPrescription
                      ? html`<span class="badge badge--info d-block mt-1"
                          >${raw(icon("prescription", { size: 11 }))}
                          نسخه‌ای</span
                        >`
                      : ""}
                  </td>

                  <td>
                    <div class="fs-sm fw-semibold">${order.customerName}</div>
                    <span class="fs-xs text-soft"
                      >${order.customerPhone || ""}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${formatDate(order.placedAt)}</div>
                    <span class="fs-xs text-soft"
                      >${formatRelativeTime(order.placedAt)}</span
                    >
                  </td>

                  <td>${toPersianDigits(order.itemCount)}</td>

                  <td class="fw-semibold">
                    ${formatPrice(order.total, { withUnit: false })}
                  </td>

                  <td>${raw(statusBadge(status))}</td>

                  <td style="min-width:120px">
                    ${raw(
                      meter(
                        progress,
                        status.tone === "danger" ? "danger" : "brand",
                      ),
                    )}
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-open-order="${order.id}"
                        data-tip="جزئیات"
                        aria-label="جزئیات سفارش ${order.id}"
                      >
                        ${raw(icon("eye", { size: 16 }))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-advance="${order.id}"
                        data-tip="مرحله بعد"
                        aria-label="انتقال ${order.id} به مرحله بعد"
                      >
                        ${raw(icon("arrowLeft", { size: 16 }))}
                      </button>
                    </div>
                  </td>
                </tr>
              `);
            })}
          </tbody>
        </table>
      </div>

      <div class="admin-table-foot">
        <span class="fs-xs text-soft"></span>
        <div data-slot="pager"></div>
      </div>
    `.toString();

    if (result.pages > 1) {
      const pager = adminPager({
        page: result.page,
        pages: result.pages,
        onChange: (page) =>
          updateQuery({ page: String(page) }, { resetPage: false }),
      });
      qs('[data-slot="pager"]', tableHost).append(pager.node);
      disposers.push(pager.cleanup);
    }

    toolbar.setSummary(
      `نمایش ${toPersianDigits(result.items.length)} از ${toPersianDigits(result.total)} سفارش`,
    );
  }

  /* -------------------------------------------------------------------------
     Mount
     ------------------------------------------------------------------------- */

  content.append(toolbar.node, statusBar, tableHost);
  renderTable();

  const layout = adminLayout({
    title: "مدیریت سفارش‌ها",
    subtitle:
      "پیگیری سفارش‌ها، تغییر وضعیت آماده‌سازی و مشاهده جزئیات هر سفارش.",
    iconName: "package",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-status]", (event, button) => {
      event.preventDefault();
      const status = button.dataset.status;

      statusBar
        .querySelectorAll("[data-status]")
        .forEach((chip) => chip.classList.toggle("is-active", chip === button));

      updateQuery({ status: status === "all" ? null : status });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-open-order]", (event, button) => {
      event.preventDefault();

      orderDrawer(admin.orderById(button.dataset.openOrder), {
        onStatusChange: (id, status) => {
          admin.setOrderStatus(id, status);
          renderTable();
        },
      });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-advance]", (event, button) => {
      event.preventDefault();

      const order = admin.orderById(button.dataset.advance);
      if (!order) return;

      const pipeline = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ];
      const index = pipeline.indexOf(order.status);

      if (index < 0 || index >= pipeline.length - 1) {
        toast.info(
          "امکان تغییر وضعیت نیست",
          "این سفارش در مرحله نهایی یا لغو شده است.",
        );
        return;
      }

      const next = pipeline[index + 1];
      admin.setOrderStatus(order.id, next);
      toast.success(
        `سفارش ${order.id} به‌روزرسانی شد`,
        statusOf("order", next).label,
      );
      renderTable();
    }),
  );

  disposers.push(
    delegate(content, "change", "[data-sort-orders]", (event, select) => {
      const mode = select.value;

      // Sorting is presentation-only here: the service query returns newest
      // first, so the table re-sorts its already-rendered rows.
      const body = qs("tbody", tableHost);
      if (!body) return;

      const rows = [...body.querySelectorAll("tr")];

      rows.sort((a, b) => {
        const amountA =
          Number(a.children[4]?.textContent.replace(/[^\d]/g, "")) || 0;
        const amountB =
          Number(b.children[4]?.textContent.replace(/[^\d]/g, "")) || 0;
        if (mode === "amount-desc") return amountB - amountA;
        if (mode === "amount-asc") return amountA - amountB;
        return 0;
      });

      rows.forEach((row) => body.append(row));
    }),
  );

  void to;

  return {
    node: layout.node,
    title: "مدیریت سفارش‌ها",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

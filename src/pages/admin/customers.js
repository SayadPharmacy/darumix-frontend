/**
 * DARUMIX — admin customer management.
 *
 * Segment filtering, search, and a detail drawer with the customer's order
 * history and lifetime value.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { updateQuery } from "../../core/router.js";
import { toPersianDigits, formatPrice, formatDate } from "../../core/format.js";
import { meter } from "../../ui/components/common.js";
import * as admin from "../../services/admin.js";
import { adminLayout, kpiTile } from "./_layout.js";
import {
  adminToolbar,
  adminPager,
  customerDrawer,
  tableEmpty,
} from "./_shared.js";

export default async function adminCustomersPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  const segments = admin.customerSegments();

  const filters = {
    q: query.q || "",
    segment: segments.some((entry) => entry.id === query.segment)
      ? query.segment
      : "all",
    page: Math.max(1, Number(query.page) || 1),
  };

  const perPage = 12;

  /** Lifetime value per customer, computed once per render pass. */
  function customerValue(customer) {
    const orders = admin.ordersOfCustomer(customer.id);
    const spent = orders.reduce((total, order) => total + order.total, 0);
    return { orders, spent };
  }

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const allCustomers = admin.customers({ perPage: 9999 }).items;
  const totalSpent = allCustomers.reduce(
    (total, customer) => total + customerValue(customer).spent,
    0,
  );

  const stats = [
    kpiTile({
      label: "کل مشتریان",
      value: toPersianDigits(allCustomers.length),
      iconName: "users",
      tone: "brand",
      change: 8,
    }),
    kpiTile({
      label: "مجموع خرید",
      value: formatPrice(totalSpent, { withUnit: false }),
      iconName: "currency",
      tone: "mint",
      hint: "تومان",
    }),
    kpiTile({
      label: "مشتریان وفادار",
      value: toPersianDigits(
        segments.find((entry) => entry.id === "loyal")?.count || 0,
      ),
      iconName: "crown",
      tone: "gold",
      hint: "خرید مکرر",
    }),
    kpiTile({
      label: "میانگین خرید",
      value: formatPrice(
        allCustomers.length ? Math.round(totalSpent / allCustomers.length) : 0,
        { withUnit: false },
      ),
      iconName: "chart",
      tone: "blue",
      hint: "تومان به ازای هر مشتری",
    }),
  ];

  /* -------------------------------------------------------------------------
     Query
     ------------------------------------------------------------------------- */

  function select() {
    const result = admin.customers({
      segment: filters.segment,
      q: filters.q,
      page: filters.page,
      perPage,
    });
    filters.page = result.page;
    return result;
  }

  /* -------------------------------------------------------------------------
     Toolbar + chips
     ------------------------------------------------------------------------- */

  const toolbar = adminToolbar({
    placeholder: "جستجو با نام، شماره تماس، شهر یا ایمیل…",
    value: filters.q,
    onSearch: (term) => {
      filters.q = term;
      filters.page = 1;
      updateQuery({ q: term || null });
    },
  });

  disposers.push(toolbar.cleanup);

  const segmentBar = el("div", { class: "admin-status-bar" });
  segmentBar.innerHTML = html`
    <button
      class="chip${filters.segment === "all" ? " is-active" : ""}"
      type="button"
      data-segment="all"
    >
      همه مشتریان
      <span class="chip__count">${toPersianDigits(allCustomers.length)}</span>
    </button>
    ${segments.map((entry) =>
      raw(html`
        <button
          class="chip${entry.id === filters.segment ? " is-active" : ""}"
          type="button"
          data-segment="${entry.id}"
        >
          ${entry.label}
          <span class="chip__count">${toPersianDigits(entry.count)}</span>
        </button>
      `),
    )}
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
          "مشتری‌ای با این مشخصات پیدا نشد",
          "بخش‌بندی یا عبارت جستجو را تغییر دهید.",
        ),
      );
      toolbar.setSummary("");
      return;
    }

    // Lifetime value feeds both the column and the relative bar.
    const withValue = result.items.map((customer) => ({
      customer,
      ...customerValue(customer),
    }));
    const maxSpent = Math.max(...withValue.map((entry) => entry.spent), 1);

    tableHost.innerHTML = html`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">مشتری</th>
              <th scope="col">تماس</th>
              <th scope="col">شهر</th>
              <th scope="col">بخش</th>
              <th scope="col">سفارش‌ها</th>
              <th scope="col">مجموع خرید</th>
              <th scope="col">عضویت</th>
              <th scope="col" style="width:70px"></th>
            </tr>
          </thead>
          <tbody>
            ${withValue.map((entry) =>
              raw(html`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="table-avatar"
                        >${entry.customer.name.slice(0, 2)}</span
                      >
                      <div>
                        <span class="fw-semibold fs-sm"
                          >${entry.customer.name}</span
                        >
                        <span class="fs-xs text-soft d-block"
                          >${entry.customer.id}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="fs-sm">${entry.customer.phone}</div>
                    <span class="fs-xs text-soft"
                      >${entry.customer.email || ""}</span
                    >
                  </td>

                  <td class="fs-sm">${entry.customer.city}</td>

                  <td>
                    <span class="badge badge--neutral"
                      >${entry.customer.segmentLabel ||
                      entry.customer.segment}</span
                    >
                  </td>

                  <td class="fw-bold">
                    ${toPersianDigits(entry.orders.length)}
                  </td>

                  <td style="min-width:150px">
                    <div class="fw-semibold fs-sm">
                      ${formatPrice(entry.spent, { withUnit: false })}
                    </div>
                    ${raw(meter((entry.spent / maxSpent) * 100, "mint"))}
                  </td>

                  <td class="fs-sm">${formatDate(entry.customer.joinDate)}</td>

                  <td>
                    <button
                      class="icon-btn"
                      type="button"
                      data-open-customer="${entry.customer.id}"
                      data-tip="جزئیات"
                      aria-label="جزئیات ${entry.customer.name}"
                    >
                      ${raw(icon("eye", { size: 16 }))}
                    </button>
                  </td>
                </tr>
              `),
            )}
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
      `نمایش ${toPersianDigits(result.items.length)} از ${toPersianDigits(result.total)} مشتری`,
    );
  }

  /* -------------------------------------------------------------------------
     Mount
     ------------------------------------------------------------------------- */

  content.append(toolbar.node, segmentBar, tableHost);
  renderTable();

  const layout = adminLayout({
    title: "مدیریت مشتریان",
    subtitle: "بخش‌بندی مشتریان، مشاهده ارزش خرید و سابقه سفارش‌های هر مشتری.",
    iconName: "users",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-segment]", (event, button) => {
      event.preventDefault();
      const segment = button.dataset.segment;

      segmentBar
        .querySelectorAll("[data-segment]")
        .forEach((chip) => chip.classList.toggle("is-active", chip === button));

      updateQuery({ segment: segment === "all" ? null : segment });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-open-customer]", (event, button) => {
      event.preventDefault();

      const customer = admin.customerById(button.dataset.openCustomer);
      if (!customer) return;

      customerDrawer(customer, {
        orders: admin.ordersOfCustomer(customer.id),
      });
    }),
  );

  return {
    node: layout.node,
    title: "مدیریت مشتریان",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

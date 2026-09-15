/**
 * DARUMIX — shared admin widgets.
 *
 * The detail drawers, filter toolbars and table helpers that more than one
 * admin page needs. Kept out of `_layout.js` so the layout stays about chrome.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { to } from "../../core/router.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatFileSize,
} from "../../core/format.js";
import { drawer } from "../../ui/components/shell.js";
import { statusBadge, meter } from "../../ui/components/common.js";
import { toast } from "../../ui/components/overlays.js";
import { productArt } from "../../ui/product-art.js";
import {
  ORDER_STATUSES,
  PRESCRIPTION_STATUSES,
  CONSULTATION_STATUSES,
  statusOf,
  SHIPPING_METHODS,
  PAYMENT_METHODS,
} from "../../data/statuses.js";

export function money(amount) {
  return formatPrice(amount, { withUnit: false });
}

/* ==========================================================================
   Search + filter toolbar
   ========================================================================== */

/**
 * A toolbar with a debounced search box, an optional select filter and a slot
 * for extra buttons.
 *
 * @param {object} options
 * @param {string} options.placeholder
 * @param {string} options.value
 * @param {(value: string) => void} options.onSearch
 * @param {{id: string, label: string, options: {id: string, label: string, count?: number}[], value: string, onChange: (id: string) => void}} [options.select]
 * @param {HTMLElement|null} [options.extra]
 * @param {string} [options.summary]
 */
export function adminToolbar(options = {}) {
  const {
    placeholder = "جستجو…",
    value = "",
    onSearch,
    select = null,
    extra = null,
    summary = "",
  } = options;

  const node = el("div", { class: "admin-toolbar glass radius-lg" });
  const disposers = [];

  node.innerHTML = html`
    <div class="input-icon grow">
      ${raw(icon("search", { size: 17 }))}
      <input
        class="input"
        type="search"
        placeholder="${placeholder}"
        value="${value}"
        aria-label="${placeholder}"
        autocomplete="off"
        data-toolbar-search
      />
    </div>

    ${select
      ? html`
          <label class="visually-hidden" for="admin-filter">فیلتر</label>
          <select
            class="select"
            id="admin-filter"
            data-toolbar-select
            style="min-width:170px"
          >
            ${select.options.map((entry) =>
              raw(html`
                <option
                  value="${entry.id}"
                  ${entry.id === select.value ? "selected" : ""}
                >
                  ${entry.label}${entry.count != null
                    ? ` (${toPersianDigits(entry.count)})`
                    : ""}
                </option>
              `),
            )}
          </select>
        `
      : ""}

    <span data-slot="extra"></span>
    ${summary
      ? html`<span class="fs-sm text-soft" data-slot="summary"
          >${summary}</span
        >`
      : ""}
  `.toString();

  if (extra) qs('[data-slot="extra"]', node).append(extra);

  let timer = 0;

  const input = qs("[data-toolbar-search]", node);
  const onInput = () => {
    clearTimeout(timer);
    const term = input.value.trim();
    timer = window.setTimeout(() => onSearch?.(term), 340);
  };

  input.addEventListener("input", onInput);
  disposers.push(() => clearTimeout(timer));

  if (select) {
    disposers.push(
      delegate(node, "change", "[data-toolbar-select]", (event, element) => {
        select.onChange?.(element.value);
      }),
    );
  }

  return {
    node,
    setSummary(text) {
      const slot = qs('[data-slot="summary"]', node);
      if (slot) slot.textContent = text;
    },
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

/* ==========================================================================
   Order detail drawer
   ========================================================================== */

/** Slide-in drawer with the full detail of one order. */
export function orderDrawer(order, options = {}) {
  if (!order) return null;

  const status = statusOf("order", order.status);
  const panel = drawer({ title: `سفارش ${order.id}`, side: "end", wide: true });

  const timeline = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];
  const currentIndex = timeline.indexOf(order.status);

  panel.body.innerHTML = html`
    <div class="stack stack--lg">
      <!-- Status -->
      <div class="glass radius-lg p-6">
        <div class="row row--between">
          <div class="row row--sm">
            ${raw(statusBadge(status, { size: "lg" }))}
            ${order.hasPrescription
              ? html`<span class="badge badge--info"
                  >${raw(icon("prescription", { size: 12 }))} نسخه‌ای</span
                >`
              : ""}
          </div>
          <span class="fw-bold">${formatPrice(order.total)}</span>
        </div>

        <div class="order-track order-track--compact mt-4">
          ${timeline.map((stepId, index) => {
            const step = ORDER_STATUSES.find((entry) => entry.id === stepId);
            const done =
              currentIndex >= index &&
              !["cancelled", "returned"].includes(order.status);

            return raw(html`
              <span class="order-track__step${done ? " is-done" : ""}">
                <span class="order-track__dot"></span>
                <span class="order-track__label">${step?.label || stepId}</span>
              </span>
            `);
          })}
        </div>
      </div>

      <!-- Customer -->
      <div class="glass radius-lg p-6">
        <h3 class="mb-4">${raw(icon("user", { size: 18 }))} مشتری</h3>
        <div class="stack stack--sm fs-sm">
          <div class="summary-row">
            <span>نام</span>
            <span class="fw-semibold">${order.customerName}</span>
          </div>
          <div class="summary-row">
            <span>شماره تماس</span>
            <span>${order.customerPhone || "—"}</span>
          </div>
          <div class="summary-row">
            <span>شهر</span>
            <span>${order.city || "—"}</span>
          </div>
          <div class="summary-row">
            <span>نشانی</span>
            <span style="text-align:end">${order.address || "—"}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="glass radius-lg p-6">
        <h3 class="mb-4">
          ${raw(icon("bag", { size: 18 }))} اقلام
          <span class="fs-sm text-soft"
            >(${toPersianDigits(order.itemCount)} عدد)</span
          >
        </h3>
        <div class="stack stack--sm">
          ${(order.items || []).map((item) =>
            raw(html`
              <div class="review-item">
                <span class="review-item__media"
                  >${raw(
                    productArt({
                      id: item.productId,
                      name: item.name,
                      slug: item.slug,
                    }),
                  )}</span
                >
                <div class="grow">
                  <a
                    class="fw-semibold fs-sm"
                    href="${to(`/product/${item.slug}`)}"
                    >${item.name}</a
                  >
                  <span class="fs-xs text-soft"
                    >${toPersianDigits(item.quantity)} × ${money(item.price)}
                    تومان</span
                  >
                </div>
                <span class="fw-bold fs-sm">${money(item.lineTotal)}</span>
              </div>
            `),
          )}
        </div>
      </div>

      <!-- Totals -->
      <div class="glass radius-lg p-6">
        <h3 class="mb-4">${raw(icon("receipt", { size: 18 }))} پرداخت</h3>
        <div class="summary-rows">
          <div class="summary-row">
            <span>جمع کالاها</span>
            <span>${money(order.subtotal)} تومان</span>
          </div>
          <div class="summary-row">
            <span>ارسال</span>
            <span
              >${order.shipping === 0
                ? "رایگان"
                : `${money(order.shipping)} تومان`}</span
            >
          </div>
          ${order.discount
            ? html`<div class="summary-row text-success">
                <span>تخفیف ${order.couponCode || ""}</span>
                <span>−${money(order.discount)} تومان</span>
              </div>`
            : ""}
          <div class="summary-row summary-row--total">
            <span>مبلغ کل</span>
            <span>${formatPrice(order.total)}</span>
          </div>
        </div>

        <div class="stack stack--sm fs-sm mt-4">
          <div class="summary-row">
            <span>روش پرداخت</span>
            <span
              >${PAYMENT_METHODS.find(
                (entry) => entry.id === order.paymentMethod,
              )?.label || order.paymentMethod}</span
            >
          </div>
          <div class="summary-row">
            <span>روش ارسال</span>
            <span
              >${SHIPPING_METHODS.find(
                (entry) => entry.id === order.shippingMethod,
              )?.label || order.shippingMethod}</span
            >
          </div>
          <div class="summary-row">
            <span>زمان ثبت</span>
            <span
              >${formatDate(order.placedAt)} —
              ${formatTime(order.placedAt)}</span
            >
          </div>
        </div>
      </div>

      <!-- Status control -->
      <div class="glass radius-lg p-6">
        <h3 class="mb-4">
          ${raw(icon("sliders", { size: 18 }))} تغییر وضعیت سفارش
        </h3>
        <div class="chip-row">
          ${ORDER_STATUSES.map((entry) =>
            raw(html`
              <button
                class="chip${entry.id === order.status ? " is-active" : ""}"
                type="button"
                data-set-status="${entry.id}"
              >
                ${entry.label}
              </button>
            `),
          )}
        </div>
        <p class="fs-xs text-soft mt-3 mb-0">
          تغییر وضعیت فقط روی داده‌های همین مرورگر اثر می‌گذارد و برای مشتری
          پیامی ارسال نمی‌شود.
        </p>
      </div>
    </div>
  `.toString();

  panel.node.addEventListener("click", (event) => {
    const button = event.target.closest("[data-set-status]");
    if (!button) return;

    event.preventDefault();
    const next = button.dataset.setStatus;

    options.onStatusChange?.(order.id, next);
    toast.success("وضعیت سفارش به‌روزرسانی شد", statusOf("order", next).label);
    panel.close();
  });

  panel.open();

  return panel;
}

/* ==========================================================================
   Prescription detail drawer
   ========================================================================== */

export function prescriptionDrawer(entry, options = {}) {
  if (!entry) return null;

  const status = statusOf("prescription", entry.status);
  const panel = drawer({ title: `نسخه ${entry.id}`, side: "end", wide: true });

  const pipeline = ["submitted", "in-review", "approved", "ready", "delivered"];
  const currentIndex = pipeline.indexOf(entry.status);

  panel.body.innerHTML = html`
    <div class="stack stack--lg">
      <div class="glass radius-lg p-6">
        <div class="row row--between">
          ${raw(statusBadge(status, { size: "lg" }))}
          <span class="fs-sm text-soft"
            >${formatRelativeTime(entry.submittedAt)}</span
          >
        </div>

        <div class="order-track order-track--compact mt-4">
          ${pipeline.map((stepId, index) => {
            const step = PRESCRIPTION_STATUSES.find(
              (item) => item.id === stepId,
            );
            const done = currentIndex >= index && entry.status !== "rejected";

            return raw(html`
              <span class="order-track__step${done ? " is-done" : ""}">
                <span class="order-track__dot"></span>
                <span class="order-track__label">${step?.label || stepId}</span>
              </span>
            `);
          })}
        </div>
      </div>

      <div class="glass radius-lg p-6">
        <h3 class="mb-4">${raw(icon("user", { size: 18 }))} اطلاعات بیمار</h3>
        <div class="stack stack--sm fs-sm">
          <div class="summary-row">
            <span>نام</span>
            <span class="fw-semibold">${entry.customerName}</span>
          </div>
          <div class="summary-row">
            <span>شماره تماس</span>
            <span>${entry.customerPhone || "—"}</span>
          </div>
          <div class="summary-row">
            <span>پزشک</span>
            <span>${entry.doctorName || "ثبت نشده"}</span>
          </div>
          <div class="summary-row">
            <span>بیمه</span>
            <span>${entry.insuranceProvider || "بدون بیمه"}</span>
          </div>
          <div class="summary-row">
            <span>تعداد اقلام</span>
            <span>${toPersianDigits(entry.medicineCount || 0)} قلم</span>
          </div>
        </div>
      </div>

      ${(entry.files || []).length
        ? html`
            <div class="glass radius-lg p-6">
              <h3 class="mb-4">
                ${raw(icon("image", { size: 18 }))} فایل‌های پیوست
              </h3>
              <div class="stack stack--sm">
                ${entry.files.map((file) =>
                  raw(html`
                    <div class="file-chip glass radius-lg">
                      <span class="file-chip__icon"
                        >${raw(
                          icon(
                            file.type === "application/pdf" ? "file" : "image",
                            { size: 18 },
                          ),
                        )}</span
                      >
                      <div class="grow">
                        <div class="fs-sm fw-semibold">${file.name}</div>
                        <span class="fs-xs text-soft"
                          >${formatFileSize(file.size)}</span
                        >
                      </div>
                    </div>
                  `),
                )}
              </div>
              <p class="fs-xs text-soft mt-3 mb-0">
                در این نسخه نمایشی، فقط اطلاعات توصیفی فایل‌ها ذخیره می‌شود.
              </p>
            </div>
          `
        : ""}
      ${entry.note
        ? html`
            <div class="glass radius-lg p-6">
              <h3 class="mb-2">
                ${raw(icon("message", { size: 18 }))} یادداشت بیمار
              </h3>
              <p class="fs-sm mb-0">${entry.note}</p>
            </div>
          `
        : ""}

      <div class="glass radius-lg p-6">
        <h3 class="mb-4">
          ${raw(icon("sliders", { size: 18 }))} تصمیم داروساز
        </h3>
        <div class="chip-row">
          ${PRESCRIPTION_STATUSES.filter((item) => item.id !== "delivered").map(
            (item) =>
              raw(html`
                <button
                  class="chip${item.id === entry.status ? " is-active" : ""}"
                  type="button"
                  data-set-rx-status="${item.id}"
                >
                  ${item.label}
                </button>
              `),
          )}
        </div>
      </div>
    </div>
  `.toString();

  panel.node.addEventListener("click", (event) => {
    const button = event.target.closest("[data-set-rx-status]");
    if (!button) return;

    event.preventDefault();
    const next = button.dataset.setRxStatus;

    options.onStatusChange?.(entry.id, next);
    toast.success(
      "وضعیت نسخه به‌روزرسانی شد",
      statusOf("prescription", next).label,
    );
    panel.close();
  });

  panel.open();

  return panel;
}

/* ==========================================================================
   Customer detail drawer
   ========================================================================== */

export function customerDrawer(customer, options = {}) {
  if (!customer) return null;

  const panel = drawer({ title: customer.name, side: "end", wide: true });
  const orders = options.orders || [];

  const spent = orders.reduce((total, order) => total + order.total, 0);

  panel.body.innerHTML = html`
    <div class="stack stack--lg">
      <div class="glass radius-lg p-6">
        <div class="row">
          <span class="account-hero__avatar">${customer.name.slice(0, 2)}</span>
          <div class="grow">
            <h3 class="mb-1">${customer.name}</h3>
            <p class="fs-sm text-muted mb-0">
              ${customer.phone} · ${customer.city}
            </p>
            ${customer.email
              ? html`<span class="fs-xs text-soft">${customer.email}</span>`
              : ""}
          </div>
        </div>

        <div class="row row--sm mt-4">
          <span class="badge badge--brand"
            >${customer.segmentLabel || customer.segment}</span
          >
          <span class="badge badge--neutral"
            >عضویت از ${formatDate(customer.joinedAt)}</span
          >
        </div>
      </div>

      <div class="auto-grid auto-grid--tight">
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${toPersianDigits(orders.length)}</span
          >
          <span class="mini-stat__label">سفارش</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value">${money(spent)}</span>
          <span class="mini-stat__label">مجموع خرید (تومان)</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${toPersianDigits(customer.points || 0)}</span
          >
          <span class="mini-stat__label">امتیاز</span>
        </div>
      </div>

      ${orders.length
        ? html`
            <div class="glass radius-lg p-6">
              <h3 class="mb-4">
                ${raw(icon("package", { size: 18 }))} سفارش‌های این مشتری
              </h3>
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">کد</th>
                      <th scope="col">تاریخ</th>
                      <th scope="col">مبلغ</th>
                      <th scope="col">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders.map((order) =>
                      raw(html`
                        <tr>
                          <td class="fw-semibold">${order.id}</td>
                          <td class="fs-sm">${formatDate(order.placedAt)}</td>
                          <td>${money(order.total)}</td>
                          <td>
                            ${raw(statusBadge(statusOf("order", order.status)))}
                          </td>
                        </tr>
                      `),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          `
        : html`<p class="text-muted fs-sm">این مشتری سفارشی ثبت نکرده است.</p>`}
    </div>
  `.toString();

  panel.open();
  return panel;
}

/* ==========================================================================
   Consultations drawer
   ========================================================================== */

export function consultationDrawer(entry) {
  if (!entry) return null;

  const panel = drawer({ title: `مشاوره ${entry.id}`, side: "end" });

  panel.body.innerHTML = html`
    <div class="stack stack--lg">
      <div class="glass radius-lg p-6">
        <div class="row row--between">
          ${raw(
            statusBadge(statusOf("consultation", entry.status), { size: "lg" }),
          )}
          <span class="fs-xs text-soft"
            >${formatRelativeTime(entry.createdAt)}</span
          >
        </div>
      </div>

      <div class="glass radius-lg p-6">
        <div class="stack stack--sm fs-sm">
          <div class="summary-row">
            <span>بیمار</span>
            <span class="fw-semibold">${entry.customerName}</span>
          </div>
          <div class="summary-row">
            <span>شماره تماس</span>
            <span>${entry.customerPhone || "—"}</span>
          </div>
          <div class="summary-row">
            <span>موضوع</span>
            <span>${entry.topic}</span>
          </div>
          <div class="summary-row">
            <span>داروساز</span>
            <span>${entry.pharmacistName}</span>
          </div>
          <div class="summary-row">
            <span>زمان</span>
            <span
              >${entry.date ? formatDate(entry.date) : "—"} —
              ${entry.slot || ""}</span
            >
          </div>
          <div class="summary-row">
            <span>مدت</span>
            <span>${toPersianDigits(entry.durationMinutes || 15)} دقیقه</span>
          </div>
        </div>
      </div>

      ${entry.question
        ? html`
            <div class="glass radius-lg p-6">
              <h3 class="mb-2">
                ${raw(icon("message", { size: 18 }))} پرسش بیمار
              </h3>
              <p class="fs-sm mb-0">${entry.question}</p>
            </div>
          `
        : ""}

      <div class="glass radius-lg p-6">
        <h3 class="mb-4">${raw(icon("sliders", { size: 18 }))} وضعیت مشاوره</h3>
        <div class="chip-row">
          ${CONSULTATION_STATUSES.map((item) =>
            raw(html`
              <button
                class="chip${item.id === entry.status ? " is-active" : ""}"
                type="button"
                data-set-cs-status="${item.id}"
              >
                ${item.label}
              </button>
            `),
          )}
        </div>
      </div>
    </div>
  `.toString();

  panel.open();
  return panel;
}

/* ==========================================================================
   Empty table state
   ========================================================================== */

export function tableEmpty(message = "موردی برای نمایش نیست.", hint = "") {
  const node = el("div", { class: "table-empty" });
  node.innerHTML = html`
    <span class="table-empty__icon">${raw(icon("search", { size: 26 }))}</span>
    <p class="fw-semibold mb-1">${message}</p>
    ${hint ? html`<p class="fs-sm text-muted mb-0">${hint}</p>` : ""}
  `.toString();
  return node;
}

/** Simple pagination bar for admin tables. */
export function adminPager({ page = 1, pages = 1, onChange } = {}) {
  const node = el("div", { class: "admin-pager" });

  if (pages <= 1) return { node, cleanup: () => {} };

  node.innerHTML = html`
    <button
      class="btn btn--glass btn--sm"
      type="button"
      data-page="${page - 1}"
      ${page <= 1 ? "disabled" : ""}
    >
      ${raw(icon("chevronRight", { size: 16 }))} قبلی
    </button>
    <span class="fs-sm text-soft"
      >صفحه ${toPersianDigits(page)} از ${toPersianDigits(pages)}</span
    >
    <button
      class="btn btn--glass btn--sm"
      type="button"
      data-page="${page + 1}"
      ${page >= pages ? "disabled" : ""}
    >
      بعدی ${raw(icon("chevronLeft", { size: 16 }))}
    </button>
  `.toString();

  const dispose = delegate(node, "click", "[data-page]", (event, button) => {
    event.preventDefault();
    if (button.disabled) return;
    onChange?.(Number(button.dataset.page));
  });

  return { node, cleanup: dispose };
}

export { meter, toPersianDigits, formatPrice, formatDate };

/**
 * DARUMIX — admin prescription review queue.
 *
 * The pharmacist-facing side of the prescription pipeline: inspect the uploaded
 * request, then approve / reject / mark ready.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import { updateQuery } from "../../core/router.js";
import {
  toPersianDigits,
  formatDate,
  formatRelativeTime,
} from "../../core/format.js";
import { statusBadge, meter } from "../../ui/components/common.js";
import { toast } from "../../ui/components/overlays.js";
import { PRESCRIPTION_STATUSES, statusOf } from "../../data/statuses.js";
import * as admin from "../../services/admin.js";
import * as prescriptions from "../../services/prescriptions.js";
import { adminLayout, kpiTile } from "./_layout.js";
import { adminToolbar, prescriptionDrawer, tableEmpty } from "./_shared.js";

const PIPELINE = ["submitted", "in-review", "approved", "ready", "delivered"];

export default async function adminPrescriptionsPage({ query = {} } = {}) {
  const content = el("div");
  const disposers = [];

  const filters = {
    q: query.q || "",
    status: PRESCRIPTION_STATUSES.some((entry) => entry.id === query.status)
      ? query.status
      : "all",
  };

  /* -------------------------------------------------------------------------
     Data — seeded queue plus anything the user submitted in this browser
     ------------------------------------------------------------------------- */

  function loadQueue() {
    const seeded = admin.prescriptions({ status: filters.status });

    // Locally submitted prescriptions are merged in so admins can act on them.
    const own = prescriptions
      .ownPrescriptions()
      .filter(
        (entry) => filters.status === "all" || entry.status === filters.status,
      );

    const merged = [...own, ...seeded];

    const needle = filters.q.trim().toLowerCase();

    return needle
      ? merged.filter((entry) =>
          [
            entry.id,
            entry.customerName,
            entry.doctorName,
            entry.insuranceProvider,
          ]
            .join(" ")
            .toLowerCase()
            .includes(needle),
        )
      : merged;
  }

  const stats = prescriptions.prescriptionStats();

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const headerStats = [
    kpiTile({
      label: "کل نسخه‌ها",
      value: toPersianDigits(stats.total),
      iconName: "prescription",
      tone: "brand",
    }),
    kpiTile({
      label: "در انتظار بررسی",
      value: toPersianDigits(stats.inReview),
      iconName: "clock",
      tone: "gold",
      hint: "نیازمند اقدام داروساز",
    }),
    kpiTile({
      label: "تأییدشده",
      value: toPersianDigits(stats.approved),
      iconName: "check",
      tone: "mint",
    }),
    kpiTile({
      label: "آماده تحویل",
      value: toPersianDigits(stats.ready),
      iconName: "package",
      tone: "blue",
    }),
  ];

  /* -------------------------------------------------------------------------
     Toolbar + status chips
     ------------------------------------------------------------------------- */

  const toolbar = adminToolbar({
    placeholder: "جستجو با کد نسخه، نام بیمار یا پزشک…",
    value: filters.q,
    onSearch: (term) => {
      filters.q = term;
      updateQuery({ q: term || null });
    },
  });

  disposers.push(toolbar.cleanup);

  const statusBar = el("div", { class: "admin-status-bar" });
  statusBar.innerHTML = html`
    <button
      class="chip${filters.status === "all" ? " is-active" : ""}"
      type="button"
      data-status="all"
    >
      همه
      <span class="chip__count">${toPersianDigits(stats.total)}</span>
    </button>
    ${PRESCRIPTION_STATUSES.map((status) => {
      const count = admin.prescriptions({ status: status.id }).length;
      if (!count) return "";

      return raw(html`
        <button
          class="chip${status.id === filters.status ? " is-active" : ""}"
          type="button"
          data-status="${status.id}"
        >
          ${status.label}
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
    const queue = loadQueue();

    if (!queue.length) {
      tableHost.innerHTML = "";
      tableHost.append(
        tableEmpty(
          "نسخه‌ای با این مشخصات پیدا نشد",
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
              <th scope="col">کد نسخه</th>
              <th scope="col">بیمار</th>
              <th scope="col">پزشک / بیمه</th>
              <th scope="col">اقلام</th>
              <th scope="col">فایل‌ها</th>
              <th scope="col">زمان ثبت</th>
              <th scope="col">وضعیت</th>
              <th scope="col">پیشرفت</th>
              <th scope="col" style="width:100px"></th>
            </tr>
          </thead>
          <tbody>
            ${queue.map((entry) => {
              const status = statusOf("prescription", entry.status);
              const stepIndex = PIPELINE.indexOf(entry.status);
              const progress =
                stepIndex >= 0 ? ((stepIndex + 1) / PIPELINE.length) * 100 : 0;

              return raw(html`
                <tr>
                  <td>
                    <span class="fw-semibold">${entry.id}</span>
                    ${entry.mine
                      ? html`<span class="badge badge--brand d-block mt-1"
                          >ثبت‌شده توسط شما</span
                        >`
                      : ""}
                  </td>

                  <td>
                    <div class="fs-sm fw-semibold">${entry.customerName}</div>
                    <span class="fs-xs text-soft"
                      >${entry.customerPhone || ""}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${entry.doctorName || "ثبت نشده"}</div>
                    <span class="fs-xs text-soft"
                      >${entry.insuranceProvider || "بدون بیمه"}</span
                    >
                  </td>

                  <td class="fw-bold">
                    ${toPersianDigits(entry.medicineCount || 0)}
                  </td>

                  <td>
                    <span class="badge badge--neutral"
                      >${toPersianDigits((entry.files || []).length)} فایل</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${formatDate(entry.submittedAt)}</div>
                    <span class="fs-xs text-soft"
                      >${formatRelativeTime(entry.submittedAt)}</span
                    >
                  </td>

                  <td>${raw(statusBadge(status))}</td>

                  <td style="min-width:110px">
                    ${raw(
                      meter(
                        progress,
                        entry.status === "rejected" ? "danger" : "brand",
                      ),
                    )}
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-open-rx="${entry.id}"
                        data-tip="بررسی"
                        aria-label="بررسی نسخه ${entry.id}"
                      >
                        ${raw(icon("eye", { size: 16 }))}
                      </button>
                      ${["submitted", "in-review"].includes(entry.status)
                        ? html`
                            <button
                              class="icon-btn"
                              type="button"
                              data-approve-rx="${entry.id}"
                              data-tip="تأیید"
                              aria-label="تأیید نسخه ${entry.id}"
                            >
                              ${raw(icon("check", { size: 16 }))}
                            </button>
                          `
                        : ""}
                    </div>
                  </td>
                </tr>
              `);
            })}
          </tbody>
        </table>
      </div>
    `.toString();

    toolbar.setSummary(`${toPersianDigits(queue.length)} نسخه در این نما`);
  }

  /* -------------------------------------------------------------------------
     Mount
     ------------------------------------------------------------------------- */

  content.append(toolbar.node, statusBar, tableHost);
  renderTable();

  const layout = adminLayout({
    title: "مدیریت نسخه‌ها",
    subtitle:
      "صف بررسی نسخه‌های الکترونیکی؛ تأیید، رد یا آماده‌سازی نسخه‌ها برای تحویل.",
    iconName: "prescription",
    stats: headerStats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  /** Resolve a prescription from either the local store or the seed data. */
  function resolve(id) {
    return (
      prescriptions.prescriptionById(id) ||
      admin.prescriptions({}).find((entry) => entry.id === id) ||
      null
    );
  }

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
    delegate(content, "click", "[data-open-rx]", (event, button) => {
      event.preventDefault();

      const entry = resolve(button.dataset.openRx);
      if (!entry) return;

      prescriptionDrawer(entry, {
        onStatusChange: (id, status) => {
          // Only locally submitted prescriptions are mutable; seeded ones are
          // read-only fixtures, which is stated in the drawer.
          if (prescriptions.ownPrescriptions().some((item) => item.id === id)) {
            prescriptions.setPrescriptionStatus(id, status);
            renderTable();
          } else {
            toast.info(
              "نسخه نمایشی تغییر نکرد",
              "نسخه‌های نمونه نمایشی فقط خواندنی هستند.",
            );
          }
        },
      });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-approve-rx]", (event, button) => {
      event.preventDefault();
      const id = button.dataset.approveRx;

      if (!prescriptions.ownPrescriptions().some((item) => item.id === id)) {
        toast.info(
          "نسخه نمایشی قابل تغییر نیست",
          "نسخه‌های نمونه نمایشی فقط خواندنی هستند.",
        );
        return;
      }

      prescriptions.setPrescriptionStatus(id, "approved", "دکتر زهرا موسوی");
      toast.success("نسخه تأیید شد", id);
      renderTable();
    }),
  );

  return {
    node: layout.node,
    title: "مدیریت نسخه‌ها",
    cleanup: () => {
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

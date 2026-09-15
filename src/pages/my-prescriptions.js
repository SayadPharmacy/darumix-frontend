/**
 * DARUMIX — "my prescriptions" list with status pipeline.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatDate,
  formatRelativeTime,
  formatFileSize,
} from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  emptyState,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import { PRESCRIPTION_STATUSES, statusOf } from "../data/statuses.js";
import * as prescriptions from "../services/prescriptions.js";

const PIPELINE = ["submitted", "in-review", "approved", "ready", "delivered"];

export default async function myPrescriptionsPage() {
  const node = el("div");
  const disposers = [];

  const all = prescriptions.prescriptionHistory(20);
  const stats = prescriptions.prescriptionStats();

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          { label: "نسخه‌های من" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "نسخه‌های من",
          text: "وضعیت نسخه‌هایی که ثبت کرده‌اید، از بررسی داروساز تا آماده‌سازی و تحویل.",
        }),
      )}

      <!-- ===================== Summary ===================== -->
      <div class="auto-grid auto-grid--wide" data-slot="stats"></div>

      <!-- ===================== Actions ===================== -->
      <div class="row mt-6">
        <a class="btn btn--primary" href="${to("/prescription")}">
          ${raw(icon("upload", { size: 17 }))} ثبت نسخه جدید
        </a>
        <a class="btn btn--glass" href="${to("/consultation")}">
          ${raw(icon("stethoscope", { size: 17 }))} مشاوره داروساز
        </a>
      </div>

      <!-- ===================== List ===================== -->
      <div class="section" data-slot="list"></div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Stats
     ------------------------------------------------------------------------- */

  const statsSlot = qs('[data-slot="stats"]', node);

  [
    {
      label: "کل نسخه‌ها",
      value: stats.total,
      icon: "prescription",
      tone: "brand",
    },
    {
      label: "در حال بررسی",
      value: stats.inReview,
      icon: "clock",
      tone: "gold",
    },
    { label: "تأیید شده", value: stats.approved, icon: "check", tone: "mint" },
    { label: "آماده تحویل", value: stats.ready, icon: "package", tone: "blue" },
  ].forEach((entry) => {
    const tile = el("div", { class: "stat glass radius-lg" });
    tile.innerHTML = html`
      <div class="stat__top">
        <span class="stat__icon stat__icon--${entry.tone}"
          >${raw(icon(entry.icon, { size: 20 }))}</span
        >
        <div><div class="stat__label">${entry.label}</div></div>
      </div>
      <div class="stat__value">${toPersianDigits(entry.value)}</div>
    `.toString();
    statsSlot.append(tile);
  });

  /* -------------------------------------------------------------------------
     List
     ------------------------------------------------------------------------- */

  const listSlot = qs('[data-slot="list"]', node);

  if (!all.length) {
    listSlot.append(
      emptyState({
        iconName: "prescription",
        title: "هنوز نسخه‌ای ثبت نکرده‌اید",
        text: "با بارگذاری تصویر نسخه، داروساز دارومیکس آن را بررسی می‌کند و داروها را آماده می‌کنیم.",
        action: {
          label: "ثبت نسخه",
          variant: "btn--primary",
          href: "/prescription",
        },
      }).node,
    );
  } else {
    const stack = el("div", { class: "stack" });

    all.forEach((entry) => {
      const status = statusOf("prescription", entry.status);
      const currentIndex = PIPELINE.indexOf(entry.status);
      const isRejected = entry.status === "rejected";

      const card = el("article", { class: "record-card glass radius-xl" });
      card.innerHTML = html`
        <header class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong>${entry.id}</strong>
              ${raw(statusBadge(status))}
              ${entry.demo
                ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
                : ""}
            </div>
            <div class="row row--sm fs-xs text-soft mt-2">
              <span>${formatDate(entry.submittedAt)}</span>
              <span>•</span>
              <span>${formatRelativeTime(entry.submittedAt)}</span>
              ${entry.doctorName
                ? html`<span>•</span><span>${entry.doctorName}</span>`
                : ""}
            </div>
          </div>

          <div style="text-align:end">
            <span class="fs-xs text-soft">اقلام دارویی</span>
            <div class="fw-bold">
              ${toPersianDigits(entry.medicineCount || 0)} قلم
            </div>
          </div>
        </header>

        <!-- Pipeline -->
        ${!isRejected
          ? html`
              <div class="order-track order-track--compact">
                ${PIPELINE.map((stepId, index) => {
                  const step = PRESCRIPTION_STATUSES.find(
                    (s) => s.id === stepId,
                  );
                  const reached = currentIndex >= index;

                  return raw(html`
                    <span class="order-track__step${reached ? " is-done" : ""}">
                      <span class="order-track__dot"></span>
                      <span class="order-track__label"
                        >${step?.label || stepId}</span
                      >
                    </span>
                  `);
                })}
              </div>
            `
          : html`
              <div class="alert alert--danger mt-3">
                ${raw(icon("x", { size: 18 }))}
                <span
                  >این نسخه تأیید نشد. برای پیگیری با پشتیبانی تماس
                  بگیرید.</span
                >
              </div>
            `}

        <!-- Details -->
        <div class="record-card__grid mt-4">
          <div class="record-field">
            <span class="record-field__label">بیمه</span>
            <span class="record-field__value"
              >${entry.insuranceProvider || "بدون بیمه"}</span
            >
          </div>
          <div class="record-field">
            <span class="record-field__label">داروساز بررسی‌کننده</span>
            <span class="record-field__value"
              >${entry.pharmacistName || "در انتظار تخصیص"}</span
            >
          </div>
          <div class="record-field">
            <span class="record-field__label">تعداد فایل</span>
            <span class="record-field__value"
              >${toPersianDigits((entry.files || []).length)} فایل</span
            >
          </div>
        </div>

        ${(entry.files || []).length
          ? html`
              <div class="chip-row mt-3">
                ${entry.files.map((file) =>
                  raw(html`
                    <span class="chip chip--static">
                      ${raw(
                        icon(
                          file.type === "application/pdf" ? "file" : "image",
                          { size: 13 },
                        ),
                      )}
                      ${file.name}
                      <span class="fs-xs text-soft"
                        >${formatFileSize(file.size)}</span
                      >
                    </span>
                  `),
                )}
              </div>
            `
          : ""}
        ${entry.note
          ? html`<p class="fs-sm text-muted mt-3 mb-0">${entry.note}</p>`
          : ""}
        ${entry.mine
          ? html`
              <div class="row mt-4">
                <button
                  class="btn btn--ghost btn--sm text-danger"
                  type="button"
                  data-cancel-rx="${entry.id}"
                >
                  ${raw(icon("trash", { size: 15 }))} لغو این نسخه
                </button>
              </div>
            `
          : ""}
      `.toString();

      stack.append(card);
    });

    listSlot.append(stack);
  }

  /* -------------------------------------------------------------------------
     Cancel
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-cancel-rx]", async (event, button) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "لغو نسخه",
        message:
          "این درخواست نسخه حذف شود؟ برای ثبت مجدد باید از ابتدا اقدام کنید.",
        confirmLabel: "لغو کن",
        danger: true,
      });

      if (!ok) return;

      prescriptions.cancelPrescription(button.dataset.cancelRx);
      toast.info("درخواست نسخه لغو شد");
      window.location.reload();
    }),
  );

  return {
    node,
    title: "نسخه‌های من",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

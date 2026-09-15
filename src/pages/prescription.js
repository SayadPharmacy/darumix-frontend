/**
 * DARUMIX — electronic prescription submission.
 *
 * Upload UI is fully real (file picker, drag & drop, validation, preview list)
 * but only file *metadata* is kept — nothing is transmitted anywhere. This is
 * the exact shape a real upload-to-API flow would plug into.
 */

import { html, raw, el, qs, delegate, on } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatFileSize,
  formatDate,
  formatRelativeTime,
} from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  sectionHead,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import { statusOf } from "../data/statuses.js";
import * as prescriptions from "../services/prescriptions.js";
import * as account from "../services/account.js";

const INSURANCE_OPTIONS = [
  "بدون بیمه",
  "تأمین اجتماعی",
  "بیمه سلامت",
  "بیمه نیروهای مسلح",
  "بیمه تکمیلی آتیه‌سازان",
  "بیمه تکمیلی دانا",
];

export default async function prescriptionPage() {
  const node = el("div");
  const disposers = [];

  /** Files staged for this submission (metadata only). */
  let files = [];
  let submitting = false;

  const history = prescriptions.prescriptionHistory(6);
  const stats = prescriptions.prescriptionStats();

  /* -------------------------------------------------------------------------
     Note: the file input is rendered inside a label so the whole drop zone is
     clickable — no JS click-forwarding needed.
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "ثبت نسخه الکترونیکی" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "ثبت نسخه الکترونیکی",
          text: "عکس نسخه خود را بارگذاری کنید؛ داروساز دارومیکس آن را بررسی می‌کند، داروها را آماده می‌کنیم و با پیک برای شما می‌فرستیم.",
        }),
      )}

      <!-- ===================== How it works ===================== -->
      <div class="auto-grid auto-grid--wide mb-8">
        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${raw(icon("upload", { size: 22 }))}</span
          >
          <div>
            <h3 class="feature__title">۱. بارگذاری نسخه</h3>
            <p class="feature__text">
              تصویر یا PDF نسخه را اضافه کنید؛ حداکثر ۵ فایل.
            </p>
          </div>
        </div>
        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${raw(icon("stethoscope", { size: 22 }))}</span
          >
          <div>
            <h3 class="feature__title">۲. بررسی داروساز</h3>
            <p class="feature__text">
              داروساز نسخه را بررسی و داروها را کنترل می‌کند.
            </p>
          </div>
        </div>
        <div class="feature glass radius-lg">
          <span class="feature__icon">${raw(icon("truck", { size: 22 }))}</span>
          <div>
            <h3 class="feature__title">۳. آماده‌سازی و ارسال</h3>
            <p class="feature__text">
              داروها آماده و با پیک یا پست ارسال می‌شوند.
            </p>
          </div>
        </div>
      </div>

      <div class="split">
        <!-- ===================== Form ===================== -->
        <form
          class="glass radius-xl prescription-form"
          data-prescription-form
          novalidate
        >
          <h2 class="mb-4">اطلاعات نسخه</h2>

          <!-- Drop zone -->
          <div class="upload" data-dropzone>
            <input
              class="visually-hidden"
              type="file"
              id="prescription-files"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              data-file-input
            />
            <label class="upload__inner" for="prescription-files">
              <span class="upload__icon"
                >${raw(icon("upload", { size: 34 }))}</span
              >
              <span class="upload__title">تصویر نسخه را اینجا رها کنید</span>
              <span class="upload__text">یا برای انتخاب فایل کلیک کنید</span>
              <span class="upload__hint"
                >فرمت‌های مجاز: JPG، PNG، WebP و PDF — حداکثر
                ${toPersianDigits(prescriptions.MAX_FILES)} فایل و هر فایل تا
                ${formatFileSize(prescriptions.MAX_FILE_SIZE)}</span
              >
            </label>
          </div>

          <div class="stack stack--sm mt-4" data-slot="files"></div>

          <!-- Fields -->
          <div class="form-grid form-grid--2 mt-6">
            <div class="field">
              <label class="field__label" for="px-doctor"
                >نام پزشک (اختیاری)</label
              >
              <input
                class="input"
                id="px-doctor"
                name="doctorName"
                placeholder="مثلاً دکتر رضایی"
              />
            </div>

            <div class="field">
              <label class="field__label" for="px-insurance">بیمه</label>
              <select class="select" id="px-insurance" name="insurance">
                ${INSURANCE_OPTIONS.map((entry) =>
                  raw(html`<option value="${entry}">${entry}</option>`),
                )}
              </select>
            </div>

            <div class="field">
              <label class="field__label" for="px-count"
                >تعداد اقلام دارویی</label
              >
              <input
                class="input"
                id="px-count"
                name="medicineCount"
                type="number"
                inputmode="numeric"
                min="1"
                max="40"
                value="1"
              />
            </div>

            <div class="field">
              <label class="field__label" for="px-phone">شماره تماس</label>
              <input
                class="input"
                id="px-phone"
                name="phone"
                inputmode="tel"
                value="${account.profile()?.phone || ""}"
              />
            </div>

            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="px-address">نشانی تحویل</label>
              <input
                class="input"
                id="px-address"
                name="address"
                value="${account.defaultAddress()?.line1 || ""}"
              />
            </div>

            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="px-note"
                >توضیحات برای داروساز</label
              >
              <textarea
                class="textarea"
                id="px-note"
                name="note"
                rows="3"
                placeholder="مثلاً: سابقه حساسیت دارویی دارم یا داروی خاصی مصرف می‌کنم."
              ></textarea>
              <span class="field__error" data-form-error hidden></span>
            </div>
          </div>

          <label class="check mt-4">
            <input type="checkbox" data-rx-consent />
            <span class="check__box">${raw(icon("check", { size: 13 }))}</span>
            <span class="check__text"
              >تأیید می‌کنم نسخه متعلق به خودم یا فرد تحت تکفل من است و اطلاعات
              درست است.</span
            >
          </label>

          <div class="alert alert--info mt-4">
            ${raw(icon("lock", { size: 18 }))}
            <span
              >این نسخه نمایشی است: فایل‌ها فقط به‌صورت اطلاعات توصیفی (نام و
              حجم) روی همین مرورگر ذخیره می‌شوند و هیچ‌جا ارسال نمی‌گردند.</span
            >
          </div>

          <div class="row mt-6">
            <button class="btn btn--primary btn--lg" type="submit" data-submit>
              ${raw(icon("send", { size: 18 }))} ثبت نسخه
            </button>
            <button class="btn btn--ghost" type="reset" data-reset>
              ${raw(icon("rotate", { size: 17 }))} پاک کردن فرم
            </button>
          </div>
        </form>

        <!-- ===================== Side: stats + history ===================== -->
        <aside class="stack stack--lg">
          <div class="glass radius-xl p-6">
            <h3 class="mb-4">وضعیت نسخه‌های شما</h3>
            <div class="stack stack--sm">
              <div class="summary-row">
                <span>در حال بررسی</span>
                <span class="fw-bold">${toPersianDigits(stats.inReview)}</span>
              </div>
              <div class="summary-row">
                <span>تأیید شده</span>
                <span class="fw-bold">${toPersianDigits(stats.approved)}</span>
              </div>
              <div class="summary-row">
                <span>آماده تحویل</span>
                <span class="fw-bold">${toPersianDigits(stats.ready)}</span>
              </div>
              <div class="summary-row">
                <span>تحویل شده</span>
                <span class="fw-bold">${toPersianDigits(stats.delivered)}</span>
              </div>
            </div>
            <a
              class="btn btn--glass btn--block mt-4"
              href="${to("/account/prescriptions")}"
            >
              ${raw(icon("history", { size: 16 }))} همه نسخه‌های من
            </a>
          </div>

          <div class="glass radius-xl p-6">
            <h3 class="mb-4">سوالات پرتکرار درباره نسخه</h3>
            <div class="stack stack--sm fs-sm">
              <div>
                <strong>چه فرمتی قابل قبول است؟</strong>
                <p class="text-muted mb-0 fs-xs">
                  تصویر واضح یا اسکن PDF نسخه.
                </p>
              </div>
              <div>
                <strong>چقدر زمان می‌برد؟</strong>
                <p class="text-muted mb-0 fs-xs">
                  بررسی معمولاً کمتر از ۳۰ دقیقه در ساعات کاری.
                </p>
              </div>
              <div>
                <strong>داروی نیازمند نسخه چطور خرید می‌شود؟</strong>
                <p class="text-muted mb-0 fs-xs">
                  پس از تأیید نسخه، داروها به سبد شما اضافه می‌شوند.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- ===================== History ===================== -->
      ${history.length
        ? html`
            <section class="section">
              ${raw(
                sectionHead({
                  title: "سابقه نسخه‌های شما",
                  subtitle: "وضعیت آخرین نسخه‌هایی که ثبت کرده‌اید.",
                  iconName: "history",
                  actionHref: "/account/prescriptions",
                  actionLabel: "مشاهده همه",
                }),
              )}
              <div class="stack" data-slot="history"></div>
            </section>
          `
        : ""}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     File list rendering
     ------------------------------------------------------------------------- */

  const filesSlot = qs('[data-slot="files"]', node);

  function renderFiles() {
    if (!files.length) {
      filesSlot.innerHTML = "";
      return;
    }

    filesSlot.innerHTML = html`
      <p class="fs-xs text-soft mb-0">
        ${toPersianDigits(files.length)} فایل انتخاب شده از
        ${toPersianDigits(prescriptions.MAX_FILES)} فایل مجاز
      </p>
      ${files.map((file) =>
        raw(html`
          <div class="file-chip glass radius-lg">
            <span class="file-chip__icon"
              >${raw(
                icon(file.type === "application/pdf" ? "file" : "image", {
                  size: 18,
                }),
              )}</span
            >
            <div class="grow">
              <div class="fs-sm fw-semibold">${file.name}</div>
              <span class="fs-xs text-soft">${formatFileSize(file.size)}</span>
            </div>
            <button
              class="icon-btn"
              type="button"
              data-remove-file="${file.id}"
              aria-label="حذف فایل ${file.name}"
            >
              ${raw(icon("close", { size: 15 }))}
            </button>
          </div>
        `),
      )}
    `.toString();
  }

  function addFiles(fileList) {
    const incoming = [...fileList];

    incoming.forEach((file) => {
      const check = prescriptions.validateFile(file, files.length);

      if (!check.ok) {
        toast.warn("فایل پذیرفته نشد", `${file.name}: ${check.reason}`);
        return;
      }

      files = [...files, prescriptions.describeFile(file)];
    });

    renderFiles();
  }

  /* -------------------------------------------------------------------------
     Drag & drop
     ------------------------------------------------------------------------- */

  const dropzone = qs("[data-dropzone]", node);

  disposers.push(
    on(dropzone, "dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    }),
  );

  disposers.push(
    on(dropzone, "dragleave", () => dropzone.classList.remove("is-dragging")),
  );

  disposers.push(
    on(dropzone, "drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
      if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-file-input]", (event, input) => {
      if (input.files?.length) addFiles(input.files);
      // Reset so choosing the same file twice still fires `change`.
      input.value = "";
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-remove-file]", (event, button) => {
      event.preventDefault();
      files = files.filter((file) => file.id !== button.dataset.removeFile);
      renderFiles();
    }),
  );

  /* -------------------------------------------------------------------------
     Submit
     ------------------------------------------------------------------------- */

  function readForm() {
    const form = qs("[data-prescription-form]", node);
    const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

    return {
      files,
      doctorName: value("doctorName"),
      insurance: value("insurance"),
      medicineCount: Number(value("medicineCount")) || files.length || 1,
      phone: value("phone"),
      address: value("address"),
      note: value("note"),
      consent: Boolean(qs("[data-rx-consent]", node)?.checked),
    };
  }

  disposers.push(
    delegate(node, "submit", "[data-prescription-form]", (event) => {
      event.preventDefault();
      if (submitting) return;

      const errorSlot = qs("[data-form-error]", node);
      const payload = readForm();

      if (!payload.files.length) {
        errorSlot.hidden = false;
        errorSlot.textContent = "حداقل یک تصویر از نسخه را بارگذاری کنید.";
        toast.error(
          "نسخه بارگذاری نشده است",
          "برای ادامه، فایل نسخه را اضافه کنید.",
        );
        return;
      }

      if (!payload.consent) {
        errorSlot.hidden = false;
        errorSlot.textContent = "برای ثبت نسخه، تأیید مالکیت نسخه الزامی است.";
        toast.warn("تأیید مالکیت نسخه الزامی است");
        return;
      }

      errorSlot.hidden = true;
      submitting = true;

      const button = qs("[data-submit]", node);
      button.classList.add("is-busy");

      const result = prescriptions.submitPrescription(payload);

      button.classList.remove("is-busy");
      submitting = false;

      if (!result.ok) {
        toast.error("ثبت نسخه ناموفق بود", result.reason);
        return;
      }

      toast.success(
        "نسخه شما ثبت شد",
        `کد پیگیری: ${result.prescription.id} — نتیجه بررسی به شما اطلاع داده می‌شود.`,
        {
          duration: 6000,
          action: {
            label: "مشاهده نسخه‌های من",
            onClick: () => {
              window.location.hash = to("/account/prescriptions").slice(1);
            },
          },
        },
      );

      // Reset the form but stay on the page so the user can send another one.
      files = [];
      renderFiles();
      qs("[data-prescription-form]", node)?.reset();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reset]", (event) => {
      event.preventDefault();
      files = [];
      renderFiles();
      qs("[data-prescription-form]", node)?.reset();
      toast.info("فرم پاک شد");
    }),
  );

  /* -------------------------------------------------------------------------
     History list
     ------------------------------------------------------------------------- */

  const historySlot = qs('[data-slot="history"]', node);

  if (historySlot) {
    history.forEach((entry) => {
      const status = statusOf("prescription", entry.status);

      const row = el("article", { class: "record-card glass radius-lg" });
      row.innerHTML = html`
        <div class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong class="fs-sm">${entry.id}</strong>
              ${raw(statusBadge(status))}
              ${entry.demo
                ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
                : ""}
            </div>
            <span class="fs-xs text-soft"
              >${formatDate(entry.submittedAt)}
              ${entry.doctorName ? `· ${entry.doctorName}` : ""}</span
            >
          </div>
          <span class="fs-xs text-soft"
            >${toPersianDigits(entry.medicineCount || 0)} قلم دارو</span
          >
        </div>

        <div class="row row--sm mt-3">
          <span class="fs-xs text-soft"
            >${(entry.files || []).length
              ? `${toPersianDigits(entry.files.length)} فایل پیوست`
              : "بدون فایل"}</span
          >
          <span class="fs-xs text-soft">•</span>
          <span class="fs-xs text-soft"
            >${formatRelativeTime(entry.submittedAt)}</span
          >
          ${entry.insuranceProvider
            ? html`<span class="fs-xs text-soft"
                >• ${entry.insuranceProvider}</span
              >`
            : ""}
        </div>

        ${entry.mine
          ? html`
              <button
                class="btn btn--ghost btn--xs text-danger mt-3"
                type="button"
                data-cancel-rx="${entry.id}"
              >
                ${raw(icon("x", { size: 14 }))} لغو این نسخه
              </button>
            `
          : ""}
      `.toString();

      historySlot.append(row);
    });
  }

  disposers.push(
    delegate(node, "click", "[data-cancel-rx]", async (event, button) => {
      event.preventDefault();
      const ok = await confirmDialog({
        title: "لغو نسخه",
        message:
          "این درخواست نسخه لغو شود؟ برای ثبت مجدد باید از ابتدا اقدام کنید.",
        confirmLabel: "لغو کن",
        danger: true,
      });
      if (!ok) return;

      prescriptions.cancelPrescription(button.dataset.cancelRx);
      toast.info("درخواست نسخه لغو شد");
      window.location.reload();
    }),
  );

  renderFiles();

  return {
    node,
    title: "ثبت نسخه الکترونیکی",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

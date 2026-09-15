/**
 * DARUMIX — pharmacist consultation booking.
 *
 * Pick a pharmacist, a topic, a date and a free slot; then book. Slot
 * availability is deterministic per date (see services/prescriptions.js) so the
 * grid does not reshuffle between renders.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import {
  toPersianDigits,
  formatDate,
  toJalali,
  formatRelativeTime,
} from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  statusBadge,
  sectionHead,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import { CONSULTATION_TOPICS, statusOf } from "../data/statuses.js";
import * as prescriptions from "../services/prescriptions.js";
import * as account from "../services/account.js";

/** Next `count` days, starting today, as selectable keys. */
function nextDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    date.setHours(0, 0, 0, 0);

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      date,
      isToday: index === 0,
    };
  });
}

export default async function consultationPage() {
  const node = el("div");
  const disposers = [];

  const days = nextDays(7);
  const pharmacists = prescriptions.PHARMACISTS;
  const history = prescriptions.consultationHistory(5);

  const state = {
    pharmacistId: pharmacists[0].id,
    topic: "",
    dateKey: days[0].key,
    slot: "",
    mode: "phone",
    question: "",
    phone: account.profile()?.phone || "",
  };

  /* -------------------------------------------------------------------------
     Slot grid
     ------------------------------------------------------------------------- */

  function renderSlots() {
    const slots = prescriptions.availableSlots(state.dateKey);

    return html`
      <div class="slot-grid" data-slot="slots">
        ${slots.map((entry) => {
          const isSelected = state.slot === entry.slot;

          return raw(html`
            <button
              class="slot${isSelected ? " is-active" : ""}"
              type="button"
              data-slot-value="${entry.slot}"
              ${entry.taken ? "disabled" : ""}
              aria-pressed="${isSelected}"
            >
              ${entry.slot}
              ${entry.taken ? html`<span class="slot__note">تکمیل</span>` : ""}
            </button>
          `);
        })}
      </div>
    `.toString();
  }

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(breadcrumbs([{ label: "خانه", href: "/" }, { label: "مشاوره داروساز" }]))}
      ${raw(
        pageIntro({
          title: "مشاوره با داروساز",
          text: "پیش از خرید یا مصرف دارو، با داروساز متخصص گفت‌وگو کنید؛ درباره تداخل دارویی، دوز مصرف و عوارض احتمالی بپرسید. مشاوره در این نسخه نمایشی رایگان است.",
        }),
      )}

      <!-- ===================== Pharmacists ===================== -->
      <section class="section section--tight">
        ${raw(
          sectionHead({
            title: "انتخاب داروساز",
            subtitle: "می‌توانید داروساز مورد نظر خود را انتخاب کنید یا انتخاب را به ما بسپارید.",
            iconName: "stethoscope",
          }),
        )}
        <div class="auto-grid auto-grid--wide" data-slot="pharmacists"></div>
      </section>

      <div class="split">
        <!-- ===================== Booking form ===================== -->
        <form class="glass radius-xl booking-form" data-booking-form novalidate>
          <h2 class="mb-4">رزرو زمان مشاوره</h2>

          <!-- Topic -->
          <div class="field">
            <label class="field__label" for="cs-topic"
              >موضوع مشاوره <span class="field__required">*</span></label
            >
            <select class="select" id="cs-topic" name="topic" data-topic>
              <option value="">یک موضوع انتخاب کنید…</option>
              ${CONSULTATION_TOPICS.map(
                (topic) => raw(html`<option value="${topic}">${topic}</option>`),
              )}
            </select>
          </div>

          <!-- Mode -->
          <div class="field mt-4">
            <span class="field__label">نحوه مشاوره</span>
            <div class="btn-group">
              <button
                class="btn-group__item is-active"
                type="button"
                data-mode="phone"
              >
                ${raw(icon("phone", { size: 15 }))} تلفنی
              </button>
              <button class="btn-group__item" type="button" data-mode="chat">
                ${raw(icon("message", { size: 15 }))} پیام
              </button>
              <button class="btn-group__item" type="button" data-mode="in-person">
                ${raw(icon("store", { size: 15 }))} حضوری
              </button>
            </div>
          </div>

          <!-- Date -->
          <div class="field mt-4">
            <span class="field__label">تاریخ مشاوره <span class="field__required">*</span></span>
            <div class="day-row" data-slot="days">
              ${days.map(
                (day) => raw(html`
                  <button
                    class="day${day.key === state.dateKey ? " is-active" : ""}"
                    type="button"
                    data-day="${day.key}"
                  >
                    <span class="day__weekday"
                      >${day.isToday
                        ? "امروز"
                        : formatDate(day.date, { withWeekday: true }).split("،")[0]}</span
                    >
                    <span class="day__num">${toPersianDigits(toJalali(day.date).day)}</span>
                    <span class="day__month">${formatDate(day.date).split(" ")[1]}</span>
                  </button>
                `),
              )}
            </div>
          </div>

          <!-- Slots -->
          <div class="field mt-4">
            <span class="field__label">ساعت مشاوره <span class="field__required">*</span></span>
            <div data-slot="slot-host"></div>
            <span class="field__hint">ساعت‌های خاکستری قبلاً رزرو شده‌اند.</span>
          </div>

          <!-- Phone + question -->
          <div class="form-grid form-grid--2 mt-4">
            <div class="field">
              <label class="field__label" for="cs-phone">شماره تماس</label>
              <input
                class="input"
                id="cs-phone"
                name="phone"
                inputmode="tel"
                value="${state.phone}"
                data-phone
              />
            </div>
            <div class="field">
              <label class="field__label" for="cs-pharmacist">داروساز</label>
              <select class="select" id="cs-pharmacist" data-pharmacist>
                ${pharmacists.map(
                  (entry) => raw(html`
                    <option value="${entry.id}" ${entry.id === state.pharmacistId ? "selected" : ""}>
                      ${entry.name} — ${entry.specialty}
                    </option>
                  `),
                )}
              </select>
            </div>
          </div>

          <div class="field mt-4">
            <label class="field__label" for="cs-question">شرح سوال شما</label>
            <textarea
              class="textarea"
              id="cs-question"
              name="question"
              rows="4"
              placeholder="داروها یا مکمل‌هایی که مصرف می‌کنید و سوال خود را بنویسید…"
              data-question
            ></textarea>
            <span class="field__error" data-form-error hidden></span>
          </div>

          <div class="alert alert--info mt-4">
            ${raw(icon("info", { size: 18 }))}
            <span
              >مشاوره دارومیکس جایگزین ویزیت پزشک نیست. در شرایط اورژانسی با ۱۱۵ تماس بگیرید.</span
            >
          </div>

          <button class="btn btn--primary btn--lg btn--block mt-6" type="submit">
            ${raw(icon("calendar", { size: 18 }))} ثبت درخواست مشاوره
          </button>
        </form>

        <!-- ===================== Side ===================== -->
        <aside class="stack stack--lg">
          <div class="glass radius-xl p-6" data-slot="summary"></div>

          <div class="glass radius-xl p-6">
            <h3 class="mb-4">چرا مشاوره داروساز؟</h3>
            <div class="stack stack--sm fs-sm">
              <div class="row row--sm">
                ${raw(icon("checkCircle", { size: 17 }))}
                <span>بررسی تداخل داروها با یکدیگر</span>
              </div>
              <div class="row row--sm">
                ${raw(icon("checkCircle", { size: 17 }))}
                <span>راهنمای دوز مصرف برای کودکان و سالمندان</span>
              </div>
              <div class="row row--sm">
                ${raw(icon("checkCircle", { size: 17 }))}
                <span>انتخاب مکمل مناسب بر اساس شرایط شما</span>
              </div>
              <div class="row row--sm">
                ${raw(icon("checkCircle", { size: 17 }))}
                <span>آگاهی از عوارض احتمالی و شرایط نگهداری</span>
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
                  title: "سابقه مشاوره‌ها",
                  subtitle: "درخواست‌های مشاوره شما و وضعیت آن‌ها.",
                  iconName: "history",
                }),
              )}
              <div class="stack" data-slot="history"></div>
            </section>
          `
        : ""}
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Dynamically rendered regions
     ------------------------------------------------------------------------- */

  function renderSummary() {
    const pharmacist = pharmacists.find((entry) => entry.id === state.pharmacistId);
    const day = days.find((entry) => entry.key === state.dateKey);

    qs('[data-slot="summary"]', node).innerHTML = html`
      <h3 class="mb-4">خلاصه درخواست</h3>
      <div class="stack stack--sm">
        <div class="summary-row">
          <span>داروساز</span>
          <span class="fw-bold">${pharmacist?.name || "—"}</span>
        </div>
        <div class="summary-row">
          <span>تخصص</span>
          <span>${pharmacist?.specialty || "—"}</span>
        </div>
        <div class="summary-row">
          <span>موضوع</span>
          <span>${state.topic || "انتخاب نشده"}</span>
        </div>
        <div class="summary-row">
          <span>تاریخ</span>
          <span>${day ? formatDate(day.date, { withWeekday: true }) : "—"}</span>
        </div>
        <div class="summary-row">
          <span>ساعت</span>
          <span>${state.slot || "انتخاب نشده"}</span>
        </div>
        <div class="summary-row">
          <span>نحوه برگزاری</span>
          <span
            >${state.mode === "phone" ? "تلفنی" : state.mode === "chat" ? "پیام‌رسان" : "حضوری"}</span
          >
        </div>
        <div class="summary-row summary-row--total">
          <span>هزینه مشاوره</span>
          <span class="text-success">رایگان در نسخه نمایشی</span>
        </div>
      </div>
    `.toString();
  }

  const slotHost = qs('[data-slot="slot-host"]', node);

  function renderSlotsInto() {
    slotHost.innerHTML = renderSlots();
  }

  /* --- Pharmacist cards --- */
  const pharmacistSlot = qs('[data-slot="pharmacists"]', node);

  pharmacists.forEach((pharmacist) => {
    const card = el("button", {
      class: `pharmacist glass radius-lg${pharmacist.id === state.pharmacistId ? " is-selected" : ""}`,
      type: "button",
      "data-pharmacist-card": pharmacist.id,
    });

    card.innerHTML = html`
      <span class="pharmacist__avatar">${raw(icon("user", { size: 26 }))}</span>
      <div class="grow" style="text-align:start">
        <div class="fw-bold">${pharmacist.name}</div>
        <p class="fs-xs text-muted mb-0">${pharmacist.specialty}</p>
        <div class="row row--sm fs-xs text-soft mt-2">
          <span>${raw(icon("star", { size: 13, filled: true }))}</span>
          <span>${toPersianDigits(pharmacist.rating.toFixed(1))}</span>
          <span>•</span>
          <span>${toPersianDigits(pharmacist.years)} سال تجربه</span>
        </div>
      </div>
      <span class="pharmacist__check">${raw(icon("check", { size: 16 }))}</span>
    `.toString();

    pharmacistSlot.append(card);
  });

  /* --- History rows --- */
  const historySlot = qs('[data-slot="history"]', node);

  if (historySlot) {
    history.forEach((entry) => {
      const status = statusOf("consultation", entry.status);
      const day = entry.date ? new Date(entry.date) : null;

      const row = el("article", { class: "record-card glass radius-lg" });
      row.innerHTML = html`
        <div class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong class="fs-sm">${entry.topic}</strong>
              ${raw(statusBadge(status))}
              ${entry.demo
                ? html`<span class="badge badge--neutral">نمونه نمایشی</span>`
                : ""}
            </div>
            <span class="fs-xs text-soft"
              >${entry.pharmacistName}${day ? ` · ${formatDate(day)}` : ""}</span
            >
          </div>
          <span class="fs-xs text-soft"
            >${entry.slot ? toPersianDigits(entry.slot) : ""}</span
          >
        </div>
        ${entry.question
          ? html`<p class="fs-sm text-muted mt-3 mb-0">${entry.question}</p>`
          : ""}
        <span class="fs-xs text-soft mt-2"
          >${formatRelativeTime(entry.createdAt)}</span
        >
      `.toString();

      historySlot.append(row);
    });
  }

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-pharmacist-card]", (event, button) => {
      event.preventDefault();
      state.pharmacistId = button.dataset.pharmacistCard;

      qs("[data-pharmacist]", node).value = state.pharmacistId;
      node
        .querySelectorAll("[data-pharmacist-card]")
        .forEach((card) =>
          card.classList.toggle("is-selected", card === button),
        );

      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-day]", (event, button) => {
      event.preventDefault();
      state.dateKey = button.dataset.day;
      // A date change invalidates the chosen slot.
      state.slot = "";

      node
        .querySelectorAll("[data-day]")
        .forEach((day) => day.classList.toggle("is-active", day === button));

      renderSlotsInto();
      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-slot-value]", (event, button) => {
      event.preventDefault();
      if (button.disabled) return;

      state.slot = button.dataset.slotValue;

      button.parentElement
        ?.querySelectorAll("[data-slot-value]")
        .forEach((slot) => {
          slot.classList.toggle("is-active", slot === button);
          slot.setAttribute("aria-pressed", String(slot === button));
        });

      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-mode]", (event, button) => {
      event.preventDefault();
      state.mode = button.dataset.mode;

      button.parentElement
        ?.querySelectorAll("[data-mode]")
        .forEach((entry) => entry.classList.toggle("is-active", entry === button));

      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-topic]", (event, select) => {
      state.topic = select.value;
      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-pharmacist]", (event, select) => {
      state.pharmacistId = select.value;
      node
        .querySelectorAll("[data-pharmacist-card]")
        .forEach((card) =>
          card.classList.toggle(
            "is-selected",
            card.dataset.pharmacistCard === state.pharmacistId,
          ),
        );
      renderSummary();
    }),
  );

  disposers.push(
    delegate(node, "submit", "[data-booking-form]", (event) => {
      event.preventDefault();

      const errorSlot = qs("[data-form-error]", node);
      const payload = {
        topic: qs("[data-topic]", node)?.value || "",
        date: state.dateKey,
        slot: state.slot,
        mode: state.mode,
        question: qs("[data-question]", node)?.value.trim() || "",
        phone: qs("[data-phone]", node)?.value.trim() || "",
        pharmacistName:
          pharmacists.find((entry) => entry.id === state.pharmacistId)?.name || "",
      };

      if (!payload.topic) {
        errorSlot.hidden = false;
        errorSlot.textContent = "موضوع مشاوره را انتخاب کنید.";
        toast.warn("موضوع مشاوره انتخاب نشده است");
        return;
      }

      if (!payload.slot) {
        errorSlot.hidden = false;
        errorSlot.textContent = "ساعت مشاوره را انتخاب کنید.";
        toast.warn("ساعت مشاوره انتخاب نشده است");
        return;
      }

      errorSlot.hidden = true;

      const result = prescriptions.bookConsultation(payload);

      if (!result.ok) {
        toast.error("ثبت مشاوره ناموفق بود", result.reason);
        return;
      }

      toast.success(
        "درخواست مشاوره ثبت شد",
        `${payload.topic} — ${toPersianDigits(payload.slot)}. نتیجه زمان‌بندی به شما اطلاع داده می‌شود.`,
        {
          duration: 6000,
          action: {
            label: "مشاهده مشاوره‌ها",
            onClick: () => {
              window.location.hash = to("/consultation").slice(1);
            },
          },
        },
      );

      // Reset only the volatile parts of the form.
      state.slot = "";
      state.topic = "";
      qs("[data-topic]", node).value = "";
      qs("[data-question]", node).value = "";
      renderSlotsInto();
      renderSummary();
    }),
  );

  /* -------------------------------------------------------------------------
     Initial paint
     ------------------------------------------------------------------------- */

  renderSlotsInto();
  renderSummary();

  return {
    node,
    title: "مشاوره داروساز",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

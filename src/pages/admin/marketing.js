/**
 * DARUMIX — admin marketing.
 *
 * Campaign performance, coupon codes, newsletter segments and the funnel from
 * sent → opened → clicked → converted.
 */

import { html, raw, el, qs, delegate } from "../../core/dom.js";
import { icon } from "../../ui/icons.js";
import {
  toPersianDigits,
  formatPrice,
  formatDate,
} from "../../core/format.js";
import { statusBadge, meter, emptyState } from "../../ui/components/common.js";
import { toast, modal } from "../../ui/components/overlays.js";
import { COUPONS } from "../../data/statuses.js";
import * as admin from "../../services/admin.js";
import * as account from "../../services/account.js";
import { adminLayout, kpiTile } from "./_layout.js";
import { barList } from "../../ui/components/charts.js";

/** Campaign status → the shared badge vocabulary. */
function campaignStatus(status) {
  const map = {
    active: { id: "active", label: "فعال", tone: "mint", icon: "zap" },
    scheduled: {
      id: "scheduled",
      label: "زمان‌بندی شده",
      tone: "info",
      icon: "clock",
    },
    completed: {
      id: "completed",
      label: "پایان یافته",
      tone: "neutral",
      icon: "checkCircle",
    },
    draft: { id: "draft", label: "پیش‌نویس", tone: "neutral", icon: "edit" },
  };
  return (
    map[status] || { id: status, label: status, tone: "neutral", icon: "clock" }
  );
}

export default async function adminMarketingPage() {
  const content = el("div");
  const disposers = [];

  const overview = admin.marketingOverview();
  const campaigns = admin.campaigns();
  const segments = admin.customerSegments();
  const traffic = admin.trafficSources();

  /* -------------------------------------------------------------------------
     Header stats
     ------------------------------------------------------------------------- */

  const stats = [
    kpiTile({
      label: "کمپین‌ها",
      value: toPersianDigits(overview.campaigns),
      iconName: "megaphone",
      tone: "brand",
      hint: `${toPersianDigits(overview.active)} کمپین فعال`,
    }),
    kpiTile({
      label: "نرخ بازشدن",
      value: `${toPersianDigits(overview.openRate)}٪`,
      iconName: "mail",
      tone: "mint",
      hint: `${toPersianDigits(overview.sent)} پیام ارسال‌شده`,
    }),
    kpiTile({
      label: "نرخ تبدیل",
      value: `${toPersianDigits(overview.conversionRate)}٪`,
      iconName: "target",
      tone: "blue",
      hint: `${toPersianDigits(overview.converted)} تبدیل`,
    }),
    kpiTile({
      label: "هزینه جذب",
      value: formatPrice(overview.cpa, { withUnit: false }),
      iconName: "currency",
      tone: "gold",
      hint: "تومان به ازای هر تبدیل",
    }),
  ];

  /* -------------------------------------------------------------------------
     Content
     ------------------------------------------------------------------------- */

  content.innerHTML = html`
    <!-- ===================== Funnel ===================== -->
    <section class="glass radius-xl p-6">
      <h2 class="mb-6">${raw(icon("target", { size: 20 }))} قیف بازاریابی</h2>

      <div class="auto-grid auto-grid--wide" data-slot="funnel"></div>

      <div class="divider"></div>

      <div class="stack" data-slot="funnel-bars"></div>
    </section>

    <!-- ===================== Campaigns ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <h2 class="mb-0">${raw(icon("megaphone", { size: 20 }))} کمپین‌ها</h2>
        <button
          class="btn btn--primary btn--sm"
          type="button"
          data-new-campaign
        >
          ${raw(icon("plus", { size: 15 }))} کمپین جدید
        </button>
      </div>
      <div class="table-wrap" data-slot="campaigns"></div>
    </section>

    <!-- ===================== Coupons ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <div>
          <h2 class="mb-1">${raw(icon("tag", { size: 20 }))} کدهای تخفیف</h2>
          <p class="fs-sm text-muted mb-0">
            کدهای فعال در فرآیند تسویه حساب این نسخه نمایشی.
          </p>
        </div>
      </div>
      <div class="auto-grid auto-grid--wide" data-slot="coupons"></div>
    </section>

    <!-- ===================== Segments + traffic ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${raw(icon("users", { size: 20 }))} بخش‌بندی مشتریان
        </h2>
        <div class="stack" data-slot="segments"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">${raw(icon("globe", { size: 20 }))} منابع ورودی</h2>
        <div data-slot="traffic"></div>
      </section>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Funnel tiles
     ------------------------------------------------------------------------- */

  const funnelSlot = qs('[data-slot="funnel"]', content);

  [
    {
      label: "پیام ارسال‌شده",
      value: overview.sent,
      icon: "send",
      tone: "brand",
    },
    {
      label: "بازشده",
      value: Math.round((overview.sent * overview.openRate) / 100),
      icon: "eye",
      tone: "mint",
    },
    {
      label: "کلیک‌شده",
      value: Math.round((overview.sent * overview.clickRate) / 100),
      icon: "target",
      tone: "blue",
    },
    {
      label: "تبدیل‌شده",
      value: overview.converted,
      icon: "checkCircle",
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
    funnelSlot.append(tile);
  });

  /* -------------------------------------------------------------------------
     Funnel bars
     ------------------------------------------------------------------------- */

  const funnelBarsSlot = qs('[data-slot="funnel-bars"]', content);
  const funnelSteps = [
    { label: "ارسال", value: overview.sent, tone: "brand" },
    {
      label: "بازشدن",
      value: Math.round((overview.sent * overview.openRate) / 100),
      tone: "mint",
    },
    {
      label: "کلیک",
      value: Math.round((overview.sent * overview.clickRate) / 100),
      tone: "blue",
    },
    { label: "تبدیل", value: overview.converted, tone: "gold" },
  ];

  funnelBarsSlot.innerHTML = html`
    ${funnelSteps.map((step) =>
      raw(html`
        <div class="status-row">
          <div class="row row--between">
            <span class="fs-sm">${step.label}</span>
            <span class="fw-bold fs-sm">${toPersianDigits(step.value)}</span>
          </div>
          ${raw(
            meter(
              overview.sent ? (step.value / overview.sent) * 100 : 0,
              step.tone,
            ),
          )}
        </div>
      `),
    )}
  `.toString();

  /* -------------------------------------------------------------------------
     Campaigns table
     ------------------------------------------------------------------------- */

  const campaignsSlot = qs('[data-slot="campaigns"]', content);

  if (!campaigns.length) {
    campaignsSlot.append(
      emptyState({
        iconName: "megaphone",
        title: "کمپینی ثبت نشده است",
        compact: true,
      }).node,
    );
  } else {
    campaignsSlot.innerHTML = html`
      <table class="table table--admin">
        <thead>
          <tr>
            <th scope="col">کمپین</th>
            <th scope="col">کانال</th>
            <th scope="col">بازه</th>
            <th scope="col">ارسال</th>
            <th scope="col">بازشدن</th>
            <th scope="col">کلیک</th>
            <th scope="col">تبدیل</th>
            <th scope="col">بودجه</th>
            <th scope="col">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          ${campaigns.map((campaign) => {
            const status = campaignStatus(campaign.status);

            return raw(html`
              <tr>
                <td>
                  <span class="fw-semibold fs-sm">${campaign.title}</span>
                  <span class="fs-xs text-soft d-block clamp-1"
                    >${campaign.audience || ""}</span
                  >
                </td>

                <td>
                  <span class="badge badge--neutral"
                    >${campaign.channel || "ایمیل"}</span
                  >
                </td>

                <td class="fs-sm">
                  ${campaign.startDate ? formatDate(campaign.startDate) : "—"}
                  ${campaign.endDate
                    ? html`<br />${formatDate(campaign.endDate)}`
                    : ""}
                </td>

                <td>${toPersianDigits(campaign.sent)}</td>

                <td>
                  <div class="fw-semibold fs-sm">
                    ${toPersianDigits(campaign.openRate)}٪
                  </div>
                  ${raw(meter(campaign.openRate, "mint"))}
                </td>

                <td>
                  <div class="fw-semibold fs-sm">
                    ${toPersianDigits(campaign.clickRate)}٪
                  </div>
                  ${raw(meter(campaign.clickRate, "blue"))}
                </td>

                <td>
                  <div class="fw-semibold fs-sm">
                    ${toPersianDigits(campaign.conversionRate)}٪
                  </div>
                  ${raw(meter(campaign.conversionRate, "gold"))}
                </td>

                <td class="fs-sm">
                  ${formatPrice(campaign.budget, { withUnit: false })}
                </td>

                <td>${raw(statusBadge(status))}</td>
              </tr>
            `);
          })}
        </tbody>
      </table>
    `.toString();
  }

  /* -------------------------------------------------------------------------
     Coupons
     ------------------------------------------------------------------------- */

  const couponsSlot = qs('[data-slot="coupons"]', content);

  COUPONS.forEach((coupon) => {
    const card = el("article", { class: "coupon-card glass radius-lg" });
    card.innerHTML = html`
      <div class="row row--between">
        <span class="coupon-card__code">${coupon.code}</span>
        <span class="badge badge--mint">${coupon.label}</span>
      </div>

      <div class="stack stack--sm fs-sm mt-4">
        <div class="summary-row">
          <span>نوع</span>
          <span
            >${coupon.type === "percent"
              ? "درصدی"
              : coupon.type === "fixed"
                ? "مبلغ ثابت"
                : "ارسال رایگان"}</span
          >
        </div>
        <div class="summary-row">
          <span>حداقل سبد</span>
          <span
            >${coupon.minBasket
              ? `${formatPrice(coupon.minBasket)}`
              : "بدون شرط"}</span
          >
        </div>
        <div class="summary-row">
          <span>سقف تخفیف</span>
          <span
            >${coupon.maxDiscount
              ? formatPrice(coupon.maxDiscount)
              : "نامحدود"}</span
          >
        </div>
      </div>

      <button
        class="btn btn--glass btn--sm btn--block mt-4"
        type="button"
        data-copy-coupon="${coupon.code}"
      >
        ${raw(icon("copy", { size: 14 }))} کپی کد
      </button>
    `.toString();

    couponsSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Segments
     ------------------------------------------------------------------------- */

  const segmentsSlot = qs('[data-slot="segments"]', content);
  const maxSegment = Math.max(...segments.map((entry) => entry.count), 1);

  segmentsSlot.innerHTML = html`
    ${segments.map((entry) =>
      raw(html`
        <div class="status-row">
          <div class="row row--between">
            <span class="fs-sm">${entry.label}</span>
            <span class="fw-bold fs-sm">${toPersianDigits(entry.count)}</span>
          </div>
          ${raw(meter((entry.count / maxSegment) * 100, "brand"))}
        </div>
      `),
    )}
  `.toString();

  /* -------------------------------------------------------------------------
     Traffic
     ------------------------------------------------------------------------- */

  const trafficSlot = qs('[data-slot="traffic"]', content);
  const trafficChart = barList(
    traffic.map((entry) => ({
      label: entry.label,
      value: entry.visits,
      icon: entry.icon,
      hint: `${toPersianDigits(entry.percent)}٪ از کل بازدیدها`,
    })),
    { formatValue: (value) => toPersianDigits(value) },
  );
  trafficSlot.append(trafficChart.node);

  /* -------------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------------- */

  const layout = adminLayout({
    title: "بازاریابی و کمپین‌ها",
    subtitle: "عملکرد کمپین‌های ایمیلی، کدهای تخفیف فعال و بخش‌بندی مخاطبان.",
    iconName: "megaphone",
    stats,
    content,
  });

  /* -------------------------------------------------------------------------
     Interactions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(content, "click", "[data-new-campaign]", (event) => {
      event.preventDefault();

      const dialog = modal({
        title: "ساخت کمپین جدید",
        size: "md",
        body: html`
          <form class="form-grid form-grid--2" data-campaign-form novalidate>
            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="cp-title"
                >عنوان کمپین <span class="field__required">*</span></label
              >
              <input
                class="input"
                id="cp-title"
                name="title"
                placeholder="مثلاً: جشنواره مکمل‌ها"
              />
            </div>

            <div class="field">
              <label class="field__label" for="cp-channel">کانال</label>
              <select class="select" id="cp-channel" name="channel">
                <option value="ایمیل">ایمیل</option>
                <option value="پیامک">پیامک</option>
                <option value="شبکه اجتماعی">شبکه اجتماعی</option>
                <option value="اعلان">اعلان درون‌برنامه</option>
              </select>
            </div>

            <div class="field">
              <label class="field__label" for="cp-segment">مخاطب</label>
              <select class="select" id="cp-segment" name="segment">
                ${segments.map((entry) =>
                  raw(
                    html`<option value="${entry.id}">${entry.label}</option>`,
                  ),
                )}
              </select>
            </div>

            <div class="field">
              <label class="field__label" for="cp-budget">بودجه (تومان)</label>
              <input
                class="input"
                id="cp-budget"
                name="budget"
                type="number"
                inputmode="numeric"
              />
            </div>

            <div class="field">
              <label class="field__label" for="cp-coupon">کد تخفیف همراه</label>
              <select class="select" id="cp-coupon" name="coupon">
                <option value="">بدون کد تخفیف</option>
                ${COUPONS.map((coupon) =>
                  raw(
                    html`<option value="${coupon.code}">
                      ${coupon.code}
                    </option>`,
                  ),
                )}
              </select>
            </div>

            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="cp-desc">توضیح</label>
              <textarea
                class="textarea"
                id="cp-desc"
                name="description"
                rows="3"
              ></textarea>
            </div>

            <span
              class="field__error"
              data-form-error
              hidden
              style="grid-column:1/-1"
            ></span>
          </form>
        `,
        footer:
          `<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button>` +
          `<button class="btn btn--primary" type="button" data-save-campaign>ساخت کمپین</button>`,
      });

      dialog.open();

      dialog.node.addEventListener("click", (clickEvent) => {
        if (!clickEvent.target.closest("[data-save-campaign]")) return;

        const form = qs("[data-campaign-form]", dialog.node);
        const errorSlot = qs("[data-form-error]", form);
        const title = qs('[name="title"]', form)?.value.trim() || "";

        if (!title) {
          errorSlot.hidden = false;
          errorSlot.textContent = "عنوان کمپین الزامی است.";
          return;
        }

        dialog.close();

        // Recorded locally: this demo has no campaign backend to write to.
        account.pushNotification({
          type: "system",
          title: `کمپین «${title}» ساخته شد`,
          text: "کمپین در حالت پیش‌نویس ذخیره شد. در نسخه واقعی، ارسال زمان‌بندی می‌شود.",
          href: "#/admin/marketing",
        });

        toast.success(
          "کمپین ساخته شد",
          `${title} — در نسخه نمایشی، کمپین واقعی ارسال نمی‌شود.`,
        );
      });
    }),
  );

  disposers.push(
    delegate(content, "click", "[data-copy-coupon]", async (event, button) => {
      event.preventDefault();

      const { copyText } = await import("../../core/dom.js");
      const ok = await copyText(button.dataset.copyCoupon);

      toast[ok ? "success" : "error"](
        ok ? "کد تخفیف کپی شد" : "کپی نشد",
        ok ? button.dataset.copyCoupon : "مرورگر اجازه کپی نداد.",
      );
    }),
  );

  return {
    node: layout.node,
    title: "بازاریابی و کمپین‌ها",
    cleanup: () => {
      trafficChart.cleanup?.();
      layout.cleanup();
      disposers.forEach((dispose) => dispose());
    },
  };
}

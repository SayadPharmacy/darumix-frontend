/**
 * DARUMIX — account settings.
 *
 * Profile fields, addresses (add / edit / delete / set default), notification
 * preferences and the demo-data controls. Nothing here talks to a server.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import { toPersianDigits, formatPrice, initials } from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  emptyState,
  tabs,
} from "../ui/components/common.js";
import { toast, confirmDialog, modal } from "../ui/components/overlays.js";
import * as account from "../services/account.js";

const GENDERS = [
  { id: "female", label: "زن" },
  { id: "male", label: "مرد" },
  { id: "other", label: "ترجیح می‌دهم نگویم" },
];

export default async function accountSettingsPage({ query = {} } = {}) {
  const node = el("div");
  const disposers = [];

  const profile = account.ensureProfile();
  const activeTab = ["profile", "addresses", "preferences", "data"].includes(
    query.tab,
  )
    ? query.tab
    : "profile";

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          { label: "تنظیمات حساب" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "تنظیمات حساب",
          text: "اطلاعات پروفایل، نشانی‌ها و ترجیح‌های خود را مدیریت کنید. همه اطلاعات فقط روی همین مرورگر ذخیره می‌شوند.",
        }),
      )}

      <div class="glass radius-lg p-6">
        <div data-slot="tabs"></div>
      </div>

      <div class="settings-layout mt-6">
        <div class="glass radius-xl p-6" data-slot="panel"></div>

        <aside class="stack">
          <div class="glass radius-xl p-6" style="text-align:center">
            <span class="account-hero__avatar account-hero__avatar--lg"
              >${initials(profile.name)}</span
            >
            <h3 class="mt-3 mb-1">${profile.name}</h3>
            <p class="fs-xs text-soft mb-0">${profile.phone}</p>
            <div class="row row--sm mt-4" style="justify-content:center">
              <span class="badge badge--gold"
                >${toPersianDigits(profile.loyaltyPoints)} امتیاز</span
              >
              <span class="badge badge--brand"
                >${formatPrice(profile.walletBalance, { withUnit: false })}
                تومان</span
              >
            </div>
          </div>

          <div class="glass radius-xl p-6">
            <h3 class="mb-4">حساب نمایشی</h3>
            <p class="fs-sm text-muted">
              این حساب به‌صورت خودکار در مرورگر شما ساخته شده است. هیچ ثبت‌نام
              یا ورود واقعی وجود ندارد و اطلاعات شما به سروری ارسال نمی‌شود.
            </p>
            <button
              class="btn btn--ghost btn--sm text-danger"
              type="button"
              data-reset-account
            >
              ${raw(icon("rotate", { size: 15 }))} بازنشانی حساب نمایشی
            </button>
          </div>
        </aside>
      </div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Tab bar
     ------------------------------------------------------------------------- */

  const tabBar = tabs({
    items: [
      { id: "profile", label: "پروفایل", icon: "user" },
      {
        id: "addresses",
        label: "نشانی‌ها",
        icon: "marker",
        count: account.addresses().length,
      },
      { id: "preferences", label: "ترجیح‌ها", icon: "bell" },
      { id: "data", label: "داده‌های نمایشی", icon: "database" },
    ],
    active: activeTab,
    variant: "pill-tabs",
    onChange: (id) => {
      window.location.hash = to(
        "/account/settings",
        id === "profile" ? {} : { tab: id },
      ).slice(1);
    },
  });

  qs('[data-slot="tabs"]', node).append(tabBar.node);
  disposers.push(tabBar.cleanup);

  /* -------------------------------------------------------------------------
     Panels
     ------------------------------------------------------------------------- */

  const panel = qs('[data-slot="panel"]', node);

  /* --- Profile --- */
  function renderProfile() {
    panel.innerHTML = html`
      <h2 class="mb-4">${raw(icon("user", { size: 20 }))} اطلاعات پروفایل</h2>

      <form class="form-grid form-grid--2" data-profile-form novalidate>
        <div class="field">
          <label class="field__label" for="pf-first">نام</label>
          <input
            class="input"
            id="pf-first"
            name="firstName"
            value="${profile.firstName || ""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-last">نام خانوادگی</label>
          <input
            class="input"
            id="pf-last"
            name="lastName"
            value="${profile.lastName || ""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-phone"
            >شماره تماس <span class="field__required">*</span></label
          >
          <input
            class="input"
            id="pf-phone"
            name="phone"
            inputmode="tel"
            value="${profile.phone || ""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-email">ایمیل</label>
          <input
            class="input"
            id="pf-email"
            name="email"
            type="email"
            value="${profile.email || ""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-national">کد ملی (اختیاری)</label>
          <input
            class="input"
            id="pf-national"
            name="nationalId"
            inputmode="numeric"
            value="${profile.nationalId || ""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-birth"
            >تاریخ تولد (اختیاری)</label
          >
          <input
            class="input"
            id="pf-birth"
            name="birthDate"
            placeholder="۱۳۷۰/۰۵/۱۲"
            value="${profile.birthDate || ""}"
          />
        </div>

        <div class="field" style="grid-column:1/-1">
          <span class="field__label">جنسیت</span>
          <div class="chip-row">
            ${GENDERS.map((entry) =>
              raw(html`
                <button
                  class="chip${profile.gender === entry.id ? " is-active" : ""}"
                  type="button"
                  data-gender="${entry.id}"
                >
                  ${entry.label}
                </button>
              `),
            )}
          </div>
        </div>

        <div class="field" style="grid-column:1/-1">
          <span class="field__error" data-form-error hidden></span>
        </div>
      </form>

      <div class="row mt-6">
        <button class="btn btn--primary" type="button" data-save-profile>
          ${raw(icon("check", { size: 17 }))} ذخیره تغییرات
        </button>
        <button class="btn btn--ghost" type="button" data-reload-profile>
          ${raw(icon("rotate", { size: 16 }))} بازگردانی
        </button>
      </div>
    `.toString();
  }

  /* --- Addresses --- */
  function renderAddresses() {
    const addresses = account.addresses();

    panel.innerHTML = html`
      <div class="row row--between mb-4">
        <h2 class="mb-0">${raw(icon("marker", { size: 20 }))} نشانی‌های من</h2>
        <button class="btn btn--primary btn--sm" type="button" data-new-address>
          ${raw(icon("plus", { size: 15 }))} افزودن نشانی
        </button>
      </div>

      <div class="stack" data-slot="address-list"></div>
    `.toString();

    const listSlot = qs('[data-slot="address-list"]', panel);

    if (!addresses.length) {
      listSlot.append(
        emptyState({
          iconName: "marker",
          title: "هنوز نشانی‌ای ثبت نکرده‌اید",
          text: "برای تسویه حساب سریع‌تر، نشانی تحویل خود را اضافه کنید.",
          compact: true,
          action: {
            label: "افزودن نشانی",
            variant: "btn--primary",
            onClick: () => openAddressModal(null),
          },
        }).node,
      );
      return;
    }

    addresses.forEach((address) => {
      const card = el("article", {
        class: `address-card glass radius-lg${address.isDefault ? " is-default" : ""}`,
      });

      card.innerHTML = html`
        <div class="address-card__head">
          <div class="row row--sm">
            <span class="fw-bold">${address.title}</span>
            ${address.isDefault
              ? html`<span class="badge badge--brand">پیش‌فرض</span>`
              : ""}
          </div>
          <div class="row row--sm">
            <button
              class="btn btn--ghost btn--xs"
              type="button"
              data-edit-address="${address.id}"
            >
              ${raw(icon("edit", { size: 14 }))} ویرایش
            </button>
            <button
              class="btn btn--ghost btn--xs text-danger"
              type="button"
              data-delete-address="${address.id}"
            >
              ${raw(icon("trash", { size: 14 }))} حذف
            </button>
          </div>
        </div>

        <p class="fs-sm mb-2">
          ${address.province}، ${address.city}، ${address.line1}
          ${address.line2 ? `، ${address.line2}` : ""}
        </p>

        <div class="row row--sm fs-xs text-soft">
          <span>${address.recipient}</span>
          <span>•</span>
          <span>${address.phone}</span>
          <span>•</span>
          <span>کد پستی ${toPersianDigits(address.postalCode)}</span>
        </div>

        ${address.isDefault
          ? ""
          : html`
              <button
                class="btn btn--glass btn--xs mt-3"
                type="button"
                data-default-address="${address.id}"
              >
                ${raw(icon("check", { size: 14 }))} انتخاب به‌عنوان پیش‌فرض
              </button>
            `}
      `.toString();

      listSlot.append(card);
    });
  }

  /* --- Preferences --- */
  function renderPreferences() {
    const prefs = {
      newsletter: Boolean(profile.newsletter),
      orderUpdates: profile.orderUpdates !== false,
      prescriptionUpdates: profile.prescriptionUpdates !== false,
      promotions: Boolean(profile.promotions),
      sms: profile.sms !== false,
    };

    panel.innerHTML = html`
      <h2 class="mb-4">
        ${raw(icon("bell", { size: 20 }))} ترجیح‌های اطلاع‌رسانی
      </h2>
      <p class="text-muted fs-sm">
        انتخاب کنید چه نوع پیام‌هایی دریافت کنید. در نسخه نمایشی، این تنظیمات
        فقط ذخیره می‌شوند و پیامی ارسال نمی‌شود.
      </p>

      <div class="stack mt-4">
        <label class="switch">
          <input
            type="checkbox"
            data-pref="newsletter"
            ${prefs.newsletter ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>
            <span class="fw-semibold">خبرنامه سلامت دارومیکس</span>
            <span class="fs-xs text-soft d-block"
              >نکات سلامت و پیشنهادهای ویژه به‌صورت هفتگی</span
            >
          </span>
        </label>

        <label class="switch">
          <input
            type="checkbox"
            data-pref="orderUpdates"
            ${prefs.orderUpdates ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>
            <span class="fw-semibold">به‌روزرسانی وضعیت سفارش‌ها</span>
            <span class="fs-xs text-soft d-block"
              >اطلاع از تأیید، آماده‌سازی و ارسال سفارش</span
            >
          </span>
        </label>

        <label class="switch">
          <input
            type="checkbox"
            data-pref="prescriptionUpdates"
            ${prefs.prescriptionUpdates ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>
            <span class="fw-semibold">نتیجه بررسی نسخه</span>
            <span class="fs-xs text-soft d-block"
              >اطلاع از تأیید یا نیاز به اصلاح نسخه</span
            >
          </span>
        </label>

        <label class="switch">
          <input
            type="checkbox"
            data-pref="promotions"
            ${prefs.promotions ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>
            <span class="fw-semibold">تخفیف‌ها و کمپین‌ها</span>
            <span class="fs-xs text-soft d-block"
              >اطلاع از جشنواره‌ها و کدهای تخفیف</span
            >
          </span>
        </label>

        <label class="switch">
          <input
            type="checkbox"
            data-pref="sms"
            ${prefs.sms ? "checked" : ""}
          />
          <span class="switch__track"></span>
          <span>
            <span class="fw-semibold">پیامک</span>
            <span class="fs-xs text-soft d-block"
              >ارسال پیامک برای کد پیگیری و زمان تحویل</span
            >
          </span>
        </label>
      </div>

      <div class="alert alert--info mt-6">
        ${raw(icon("lock", { size: 18 }))}
        <span
          >شماره تماس شما فقط برای اطلاع‌رسانی سفارش استفاده می‌شود و جایی ارسال
          نمی‌گردد.</span
        >
      </div>
    `.toString();
  }

  /* --- Demo data --- */
  function renderData() {
    const stats = account.accountStats();

    panel.innerHTML = html`
      <h2 class="mb-4">
        ${raw(icon("database", { size: 20 }))} داده‌های نمایشی
      </h2>
      <p class="text-muted fs-sm">
        دارومیکس یک نمونه نمایشی بدون سرور است. همه داده‌ها در حافظه محلی مرورگر
        شما ذخیره می‌شوند و می‌توانید آن‌ها را بازنشانی کنید.
      </p>

      <div class="auto-grid auto-grid--wide mt-6">
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value">${toPersianDigits(stats.orders)}</span>
          <span class="mini-stat__label">سفارش ثبت‌شده</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${toPersianDigits(stats.wishlist)}</span
          >
          <span class="mini-stat__label">علاقه‌مندی</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${toPersianDigits(stats.prescriptions)}</span
          >
          <span class="mini-stat__label">نسخه ثبت‌شده</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${toPersianDigits(stats.consultations)}</span
          >
          <span class="mini-stat__label">مشاوره</span>
        </div>
      </div>

      <div class="stack mt-6">
        <div class="danger-zone glass radius-lg">
          <div>
            <h3 class="fs-base mb-1">پاک کردن سابقه سفارش‌ها</h3>
            <p class="fs-xs text-muted mb-0">
              سفارش‌ها، نسخه‌ها، مشاوره‌ها و نظرات ثبت‌شده شما حذف می‌شوند.
            </p>
          </div>
          <button
            class="btn btn--danger btn--sm"
            type="button"
            data-wipe-history
          >
            ${raw(icon("trash", { size: 15 }))} پاک کردن
          </button>
        </div>

        <div class="danger-zone glass radius-lg">
          <div>
            <h3 class="fs-base mb-1">بازنشانی کامل حساب نمایشی</h3>
            <p class="fs-xs text-muted mb-0">
              همه داده‌های محلی شامل پروفایل، سبد خرید و سابقه بازدید پاک
              می‌شوند و برنامه به حالت اولیه برمی‌گردد.
            </p>
          </div>
          <button class="btn btn--danger btn--sm" type="button" data-reset-all>
            ${raw(icon("rotate", { size: 15 }))} بازنشانی کامل
          </button>
        </div>
      </div>

      <div class="alert alert--warn mt-6">
        ${raw(icon("alert", { size: 18 }))}
        <span>این عملیات قابل بازگشت نیست. پیش از ادامه مطمئن شوید.</span>
      </div>
    `.toString();
  }

  function renderPanel() {
    if (activeTab === "addresses") renderAddresses();
    else if (activeTab === "preferences") renderPreferences();
    else if (activeTab === "data") renderData();
    else renderProfile();
  }

  /* -------------------------------------------------------------------------
     Address modal
     ------------------------------------------------------------------------- */

  function openAddressModal(existing) {
    const isEdit = Boolean(existing);

    const dialog = modal({
      title: isEdit ? "ویرایش نشانی" : "افزودن نشانی جدید",
      size: "md",
      body: html`
        <form class="form-grid form-grid--2" data-address-form novalidate>
          <div class="field">
            <label class="field__label" for="am-title">عنوان نشانی</label>
            <input
              class="input"
              id="am-title"
              name="title"
              value="${existing?.title || ""}"
              placeholder="خانه، محل کار…"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-recipient"
              >نام گیرنده <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="am-recipient"
              name="recipient"
              value="${existing?.recipient || ""}"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-phone"
              >شماره تماس <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="am-phone"
              name="phone"
              inputmode="tel"
              value="${existing?.phone || ""}"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-postal">کد پستی</label>
            <input
              class="input"
              id="am-postal"
              name="postalCode"
              inputmode="numeric"
              value="${existing?.postalCode || ""}"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-province"
              >استان <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="am-province"
              name="province"
              value="${existing?.province || ""}"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-city"
              >شهر <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="am-city"
              name="city"
              value="${existing?.city || ""}"
            />
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="am-line1"
              >نشانی کامل <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="am-line1"
              name="line1"
              value="${existing?.line1 || ""}"
            />
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="am-line2"
              >واحد / پلاک (اختیاری)</label
            >
            <input
              class="input"
              id="am-line2"
              name="line2"
              value="${existing?.line2 || ""}"
            />
          </div>
          <label class="check" style="grid-column:1/-1">
            <input
              type="checkbox"
              name="isDefault"
              ${existing?.isDefault ? "checked" : ""}
            />
            <span class="check__box">${raw(icon("check", { size: 13 }))}</span>
            <span class="check__text">این نشانی پیش‌فرض من باشد</span>
          </label>
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
        `<button class="btn btn--primary" type="button" data-save-address>${isEdit ? "ذخیره تغییرات" : "ذخیره نشانی"}</button>`,
    });

    dialog.open();

    dialog.node.addEventListener("click", (event) => {
      if (!event.target.closest("[data-save-address]")) return;

      const form = qs("[data-address-form]", dialog.node);
      const errorSlot = qs("[data-form-error]", form);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      const missing = [
        "recipient",
        "phone",
        "province",
        "city",
        "line1",
      ].filter((name) => !value(name));

      if (missing.length) {
        errorSlot.hidden = false;
        errorSlot.textContent = "پر کردن فیلدهای ستاره‌دار الزامی است.";
        return;
      }

      const payload = {
        title: value("title") || "نشانی جدید",
        recipient: value("recipient"),
        phone: value("phone"),
        postalCode: value("postalCode"),
        province: value("province"),
        city: value("city"),
        line1: value("line1"),
        line2: value("line2"),
        isDefault: Boolean(qs('[name="isDefault"]', form)?.checked),
      };

      if (isEdit) account.updateAddress(existing.id, payload);
      else account.addAddress(payload);

      dialog.close();
      toast.success(isEdit ? "نشانی به‌روزرسانی شد" : "نشانی ذخیره شد");
      renderPanel();
    });
  }

  /* -------------------------------------------------------------------------
     Delegated wiring
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-save-profile]", (event) => {
      event.preventDefault();

      const form = qs("[data-profile-form]", node);
      const errorSlot = qs("[data-form-error]", node);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      if (!value("phone")) {
        errorSlot.hidden = false;
        errorSlot.textContent = "شماره تماس الزامی است.";
        return;
      }

      const email = value("email");
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errorSlot.hidden = false;
        errorSlot.textContent = "آدرس ایمیل معتبر نیست.";
        return;
      }

      errorSlot.hidden = true;

      account.updateProfile({
        firstName: value("firstName"),
        lastName: value("lastName"),
        name:
          `${value("firstName")} ${value("lastName")}`.trim() || profile.name,
        phone: value("phone"),
        email,
        nationalId: value("nationalId"),
        birthDate: value("birthDate"),
      });

      toast.success("پروفایل ذخیره شد");
      window.location.reload();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reload-profile]", (event) => {
      event.preventDefault();
      renderPanel();
      toast.info("فرم بازگردانی شد");
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-gender]", (event, button) => {
      event.preventDefault();
      const value = button.dataset.gender;

      button.parentElement
        ?.querySelectorAll("[data-gender]")
        .forEach((chip) => chip.classList.toggle("is-active", chip === button));

      account.updateProfile({ gender: value });
      toast.info("جنسیت به‌روزرسانی شد");
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-new-address]", (event) => {
      event.preventDefault();
      openAddressModal(null);
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-edit-address]", (event, button) => {
      event.preventDefault();
      const address = account
        .addresses()
        .find((entry) => entry.id === button.dataset.editAddress);
      if (!address) return;
      openAddressModal(address);
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-delete-address]", async (event, button) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "حذف نشانی",
        message: "این نشانی حذف شود؟",
        confirmLabel: "حذف کن",
        danger: true,
      });

      if (!ok) return;

      account.removeAddress(button.dataset.deleteAddress);
      toast.info("نشانی حذف شد");
      renderPanel();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-default-address]", (event, button) => {
      event.preventDefault();
      account.setDefaultAddress(button.dataset.defaultAddress);
      toast.success("نشانی پیش‌فرض تغییر کرد");
      renderPanel();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-pref]", (event, input) => {
      account.updateProfile({ [input.dataset.pref]: input.checked });
      toast.success("ترجیح ذخیره شد", "تنظیمات اطلاع‌رسانی به‌روزرسانی شد.");
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-wipe-history]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "پاک کردن سابقه",
        message: "سفارش‌ها، نسخه‌ها، مشاوره‌ها و نظرات شما حذف شوند؟",
        confirmLabel: "پاک کن",
        danger: true,
      });

      if (!ok) return;

      const { resetDemoData } = await import("../services/admin.js");
      resetDemoData();

      // Re-seed just the history that this action is meant to clear.
      account.clearNotifications();
      account.clearRecentlyViewed();

      toast.success("سابقه پاک شد");
      window.location.reload();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reset-all]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "بازنشانی کامل حساب نمایشی",
        message:
          "همه داده‌های محلی پاک می‌شوند: پروفایل، سبد خرید، علاقه‌مندی‌ها، سفارش‌ها و ویرایش‌های مدیریتی. برنامه به حالت اولیه برمی‌گردد.",
        confirmLabel: "بازنشانی کن",
        danger: true,
      });

      if (!ok) return;

      const { resetDemoData } = await import("../services/admin.js");
      resetDemoData();
      window.location.reload();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-reset-account]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "بازنشانی حساب نمایشی",
        message: "پروفایل شما به حالت اولیه بازگردانده شود؟",
        confirmLabel: "بازنشانی",
        danger: true,
      });

      if (!ok) return;

      account.signOut();
      account.ensureProfile();
      toast.success("حساب نمایشی بازنشانی شد");
      window.location.reload();
    }),
  );

  /* -------------------------------------------------------------------------
     Initial paint
     ------------------------------------------------------------------------- */

  renderPanel();

  return {
    node,
    title: "تنظیمات حساب",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

/**
 * DARUMIX — contact & branches.
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to } from "../core/router.js";
import {
  breadcrumbs,
  pageIntro,
  sectionHead,
  accordion,
} from "../ui/components/common.js";
import { toast } from "../ui/components/overlays.js";
import * as account from "../services/account.js";

/** Demo branch list — static, so the map placeholder has something to show. */
const BRANCHES = [
  {
    id: "br-1",
    name: "داروخانه مرکزی دارومیکس",
    city: "تهران",
    address: "خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲",
    phone: "۰۲۱-۸۷۶۵۴۳۲",
    hours: "همه روزه ۸:۰۰ تا ۲۳:۰۰",
    services: ["تحویل حضوری", "مشاوره داروساز", "کنترل فشار و قند"],
    isMain: true,
  },
  {
    id: "br-2",
    name: "شعبه سعادت‌آباد",
    city: "تهران",
    address: "بلوار دریا، نبش خیابان مطهری، پلاک ۴۵",
    phone: "۰۲۱-۲۳۴۵",
    hours: "همه روزه ۹:۰۰ تا ۲:۰۰",
    services: ["تحویل حضوری", "مشاوره داروساز"],
  },
  {
    id: "br-3",
    name: "شعبه کرج",
    city: "کرج",
    address: "میدان طالقانی، ابتدای خیابان شهید بهشتی",
    phone: "۰۲۶-۳۴۵۶۷",
    hours: "شنبه تا پنجشنبه ۸:۳۰ تا ۲۱:۳۰",
    services: ["تحویل حضوری", "لوازم پزشکی"],
  },
];

const CONTACT_REASONS = [
  "پیگیری سفارش",
  "مشکل در تحویل کالا",
  "سوال درباره نسخه",
  "درخواست مرجوعی",
  "همکاری و نمایندگی",
  "انتقاد یا پیشنهاد",
  "سایر موارد",
];

export default async function contactPage() {
  const node = el("div");
  const disposers = [];

  const profile = account.profile();

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "تماس و شعبه‌ها" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "تماس با دارومیکس",
          text: "کارشناسان ما هر روز از ۸ صبح تا ۱۰ شب پاسخگوی شما هستند. از راه‌های زیر با ما در ارتباط باشید یا پیام خود را ثبت کنید.",
        }),
      )}

      <!-- ===================== Contact channels ===================== -->
      <div class="auto-grid auto-grid--wide mb-8">
        <a class="feature glass radius-lg" href="tel:02188765432">
          <span class="feature__icon">${raw(icon("phone", { size: 22 }))}</span>
          <div>
            <h3 class="feature__title">تماس تلفنی</h3>
            <p class="feature__text">۰۲۱-۸۷۶۵۴۳۲ — روزهای کاری ۸ تا ۲</p>
          </div>
        </a>

        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${raw(icon("message", { size: 22 }))}</span
          >
          <div>
            <h3 class="feature__title">پشتیبانی آنلاین</h3>
            <p class="feature__text">
              پاسخ‌گویی در بازه‌های کاری از طریق فرم همین صفحه.
            </p>
          </div>
        </div>

        <div class="feature glass radius-lg">
          <span class="feature__icon">${raw(icon("mail", { size: 22 }))}</span>
          <div>
            <h3 class="feature__title">ایمیل</h3>
            <p class="feature__text">support@darumix-demo.ir (نمایشی)</p>
          </div>
        </div>

        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${raw(icon("stethoscope", { size: 22 }))}</span
          >
          <div>
            <h3 class="feature__title">مشاوره داروساز</h3>
            <p class="feature__text">
              <a class="fw-bold" href="${to("/consultation")}"
                >رزرو زمان مشاوره</a
              >
            </p>
          </div>
        </div>
      </div>

      <div class="split">
        <!-- ===================== Contact form ===================== -->
        <form class="glass radius-xl contact-form" data-contact-form novalidate>
          <h2 class="mb-4">ارسال پیام</h2>
          <p class="text-muted fs-sm">
            فرم زیر را پر کنید؛ در نسخه واقعی پیام شما به تیم پشتیبانی ارسال و
            با ایمیل یا تلفن پیگیری می‌شود.
          </p>

          <div class="form-grid form-grid--2 mt-4">
            <div class="field">
              <label class="field__label" for="ct-name"
                >نام و نام خانوادگی
                <span class="field__required">*</span></label
              >
              <input
                class="input"
                id="ct-name"
                name="name"
                value="${profile?.name || ""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-phone"
                >شماره تماس <span class="field__required">*</span></label
              >
              <input
                class="input"
                id="ct-phone"
                name="phone"
                inputmode="tel"
                value="${profile?.phone || ""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-email">ایمیل (اختیاری)</label>
              <input
                class="input"
                id="ct-email"
                name="email"
                type="email"
                value="${profile?.email || ""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-reason">موضوع</label>
              <select class="select" id="ct-reason" name="reason">
                ${CONTACT_REASONS.map((reason) =>
                  raw(html`<option value="${reason}">${reason}</option>`),
                )}
              </select>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="ct-message"
                >متن پیام <span class="field__required">*</span></label
              >
              <textarea
                class="textarea"
                id="ct-message"
                name="message"
                rows="5"
                placeholder="پیام خود را بنویسید…"
              ></textarea>
              <span class="field__error" data-form-error hidden></span>
            </div>
          </div>

          <label class="check mt-4">
            <input type="checkbox" data-consent />
            <span class="check__box">${raw(icon("check", { size: 13 }))}</span>
            <span class="check__text"
              >با ثبت پیام، می‌پذیرم اطلاعات وارد‌شده برای پاسخ‌گویی استفاده
              شود.</span
            >
          </label>

          <button class="btn btn--primary btn--lg mt-6" type="submit">
            ${raw(icon("send", { size: 18 }))} ارسال پیام
          </button>

          <div class="alert alert--info mt-4">
            ${raw(icon("lock", { size: 18 }))}
            <span
              >این فرم نمایشی است و پیام شما به هیچ سروری ارسال نمی‌شود؛ فقط
              به‌صورت اعلان محلی ثبت می‌گردد.</span
            >
          </div>
        </form>

        <!-- ===================== Map placeholder ===================== -->
        <div class="glass radius-xl map-placeholder">
          <div class="map-placeholder__inner">
            <span class="map-placeholder__pin"
              >${raw(icon("marker", { size: 34 }))}</span
            >
            <h3 class="mb-2">نقشه تعاملی</h3>
            <p class="text-muted fs-sm mb-0">
              در نسخه واقعی، نقشه شعبه‌ها و مسیریابی اینجا نمایش داده می‌شود.
              مقصد فعلی: داروخانه مرکزی، خیابان ولیعصر، تهران.
            </p>
            <span class="fs-xs text-soft mt-4"
              >عرض جغرافیایی ۳۵٫۷۴۳۱ — طول جغرافیایی ۵۱٫۴۱۰۴</span
            >
          </div>
        </div>
      </div>

      <!-- ===================== Branches ===================== -->
      <section class="section">
        ${raw(
          sectionHead({
            title: "شعبه‌های دارومیکس",
            subtitle:
              "می‌توانید سفارش خود را از نزدیک‌ترین شعبه حضوری تحویل بگیرید.",
            iconName: "store",
          }),
        )}
        <div class="auto-grid auto-grid--wide" data-slot="branches"></div>
      </section>

      <!-- ===================== Short FAQ ===================== -->
      <section class="section section--tight">
        ${raw(
          sectionHead({
            title: "پرسش‌های سریع",
            subtitle: "شاید پاسخ سوال شما همین‌جا باشد.",
            iconName: "help",
            actionHref: "/faq",
            actionLabel: "همه سوالات",
          }),
        )}
        <div data-slot="quick"></div>
      </section>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Branch cards
     ------------------------------------------------------------------------- */

  const branchesSlot = qs('[data-slot="branches"]', node);

  BRANCHES.forEach((branch) => {
    const card = el("article", { class: "branch glass radius-xl" });
    card.innerHTML = html`
      <div class="branch__head">
        <span class="branch__icon">${raw(icon("store", { size: 22 }))}</span>
        <div>
          <h3 class="branch__title">${branch.name}</h3>
          <span class="fs-xs text-soft"
            >${branch.city}${branch.isMain ? " · شعبه مرکزی" : ""}</span
          >
        </div>
        ${branch.isMain
          ? html`<span class="badge badge--brand">اصلی</span>`
          : ""}
      </div>

      <div class="branch__body">
        <div class="row row--sm fs-sm">
          ${raw(icon("marker", { size: 16 }))}
          <span>${branch.address}</span>
        </div>
        <div class="row row--sm fs-sm">
          ${raw(icon("phone", { size: 16 }))}
          <a href="tel:${branch.phone}">${branch.phone}</a>
        </div>
        <div class="row row--sm fs-sm">
          ${raw(icon("clock", { size: 16 }))}
          <span>${branch.hours}</span>
        </div>
      </div>

      <div class="chip-row mt-3">
        ${branch.services.map((service) =>
          raw(html`<span class="chip chip--static">${service}</span>`),
        )}
      </div>

      <a class="btn btn--glass btn--sm mt-4" href="${to("/catalog")}">
        ${raw(icon("bag", { size: 15 }))} خرید و تحویل از این شعبه
      </a>
    `.toString();

    branchesSlot.append(card);
  });

  /* -------------------------------------------------------------------------
     Quick FAQ
     ------------------------------------------------------------------------- */

  const quick = accordion({
    items: [
      {
        id: "q1",
        title: "چقدر طول می‌کشد تا پیام من پاسخ داده شود؟",
        content:
          "<p>پیام‌های ثبت‌شده در ساعات کاری معمولاً کمتر از یک ساعت کاری پاسخ داده می‌شوند. پیام‌های خارج از ساعت کاری، اولین ساعت کاری بعد پیگیری می‌شوند.</p>",
        open: true,
      },
      {
        id: "q2",
        title: "آیا می‌توانم سفارشم را حضوری تحویل بگیرم؟",
        content:
          "<p>بله. در مرحله انتخاب روش ارسال، «تحویل حضوری از داروخانه» را انتخاب کنید و شعبه مورد نظر را در بخش تماس ببینید.</p>",
      },
      {
        id: "q3",
        title: "برای مشاوره دارویی چه کنم؟",
        content: `<p>از صفحه <a href="${to(
          "/consultation",
        )}">مشاوره داروساز</a> زمان رزرو کنید؛ مشاوره در این نسخه نمایشی رایگان است.</p>`,
      },
    ],
    multiple: true,
  });

  qs('[data-slot="quick"]', node).append(quick.node);
  disposers.push(quick.cleanup);

  /* -------------------------------------------------------------------------
     Form submit
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "submit", "[data-contact-form]", (event) => {
      event.preventDefault();

      const form = qs("[data-contact-form]", node);
      const errorSlot = qs("[data-form-error]", node);
      const value = (name) => qs(`[name="${name}"]`, form)?.value.trim() || "";

      const missing = ["name", "phone", "message"].filter(
        (name) => !value(name),
      );

      if (missing.length) {
        errorSlot.hidden = false;
        errorSlot.textContent = "پر کردن فیلدهای ستاره‌دار الزامی است.";
        toast.warn("فرم ناقص است", "لطفاً فیلدهای الزامی را کامل کنید.");
        return;
      }

      if (!qs("[data-consent]", node)?.checked) {
        errorSlot.hidden = false;
        errorSlot.textContent =
          "برای ارسال پیام، پذیرش شرط استفاده الزامی است.";
        toast.warn("پذیرش شرط الزامی است");
        return;
      }

      errorSlot.hidden = true;

      // Recorded locally so the confirmation is real rather than cosmetic.
      account.pushNotification({
        type: "system",
        title: `پیام شما ثبت شد — ${value("reason")}`,
        text: "کارشناسان دارومیکس در اولین فرصت با شما تماس می‌گیرند.",
        href: "#/contact",
      });

      form.reset();
      toast.success(
        "پیام شما ثبت شد",
        "در اولین فرصت کاری با شما تماس می‌گیریم. از همراهی شما سپاسگزاریم.",
      );
    }),
  );

  return {
    node,
    title: "تماس و شعبه‌ها",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

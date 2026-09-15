import{e as N,aQ as P,h as u,r as l,I as B,_ as M,aV as H,t as m,L as R,i as d,a6 as O,am as g,j as V,q as f,w as r,Q as j,aR as Q,a9 as G,bb as F,at as J,A as b,E as D,ag as w,bc as K,bd as W,aO as C,ba as X,aB as Y,be as Z}from"./index-c305d6a7.js";import"./data-f43f95cf.js";const x=[{id:"female",label:"زن"},{id:"male",label:"مرد"},{id:"other",label:"ترجیح می‌دهم نگویم"}];async function ta({query:z={}}={}){const i=N("div"),c=[],n=P(),_=["profile","addresses","preferences","data"].includes(z.tab)?z.tab:"profile";i.innerHTML=u`
    <div class="shell">
      ${l(B([{label:"خانه",href:"/"},{label:"حساب کاربری",href:"/account"},{label:"تنظیمات حساب"}]))}
      ${l(M({title:"تنظیمات حساب",text:"اطلاعات پروفایل، نشانی‌ها و ترجیح‌های خود را مدیریت کنید. همه اطلاعات فقط روی همین مرورگر ذخیره می‌شوند."}))}

      <div class="glass radius-lg p-6">
        <div data-slot="tabs"></div>
      </div>

      <div class="settings-layout mt-6">
        <div class="glass radius-xl p-6" data-slot="panel"></div>

        <aside class="stack">
          <div class="glass radius-xl p-6" style="text-align:center">
            <span class="account-hero__avatar account-hero__avatar--lg"
              >${H(n.name)}</span
            >
            <h3 class="mt-3 mb-1">${n.name}</h3>
            <p class="fs-xs text-soft mb-0">${n.phone}</p>
            <div class="row row--sm mt-4" style="justify-content:center">
              <span class="badge badge--gold"
                >${m(n.loyaltyPoints)} امتیاز</span
              >
              <span class="badge badge--brand"
                >${R(n.walletBalance,{withUnit:!1})}
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
              ${l(d("rotate",{size:15}))} بازنشانی حساب نمایشی
            </button>
          </div>
        </aside>
      </div>
    </div>
  `.toString();const L=O({items:[{id:"profile",label:"پروفایل",icon:"user"},{id:"addresses",label:"نشانی‌ها",icon:"marker",count:g().length},{id:"preferences",label:"ترجیح‌ها",icon:"bell"},{id:"data",label:"داده‌های نمایشی",icon:"database"}],active:_,variant:"pill-tabs",onChange:a=>{window.location.hash=V("/account/settings",a==="profile"?{}:{tab:a}).slice(1)}});f('[data-slot="tabs"]',i).append(L.node),c.push(L.cleanup);const v=f('[data-slot="panel"]',i);function T(){v.innerHTML=u`
      <h2 class="mb-4">${l(d("user",{size:20}))} اطلاعات پروفایل</h2>

      <form class="form-grid form-grid--2" data-profile-form novalidate>
        <div class="field">
          <label class="field__label" for="pf-first">نام</label>
          <input
            class="input"
            id="pf-first"
            name="firstName"
            value="${n.firstName||""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-last">نام خانوادگی</label>
          <input
            class="input"
            id="pf-last"
            name="lastName"
            value="${n.lastName||""}"
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
            value="${n.phone||""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-email">ایمیل</label>
          <input
            class="input"
            id="pf-email"
            name="email"
            type="email"
            value="${n.email||""}"
          />
        </div>

        <div class="field">
          <label class="field__label" for="pf-national">کد ملی (اختیاری)</label>
          <input
            class="input"
            id="pf-national"
            name="nationalId"
            inputmode="numeric"
            value="${n.nationalId||""}"
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
            value="${n.birthDate||""}"
          />
        </div>

        <div class="field" style="grid-column:1/-1">
          <span class="field__label">جنسیت</span>
          <div class="chip-row">
            ${x.map(a=>l(u`
                <button
                  class="chip${n.gender===a.id?" is-active":""}"
                  type="button"
                  data-gender="${a.id}"
                >
                  ${a.label}
                </button>
              `))}
          </div>
        </div>

        <div class="field" style="grid-column:1/-1">
          <span class="field__error" data-form-error hidden></span>
        </div>
      </form>

      <div class="row mt-6">
        <button class="btn btn--primary" type="button" data-save-profile>
          ${l(d("check",{size:17}))} ذخیره تغییرات
        </button>
        <button class="btn btn--ghost" type="button" data-reload-profile>
          ${l(d("rotate",{size:16}))} بازگردانی
        </button>
      </div>
    `.toString()}function U(){const a=g();v.innerHTML=u`
      <div class="row row--between mb-4">
        <h2 class="mb-0">${l(d("marker",{size:20}))} نشانی‌های من</h2>
        <button class="btn btn--primary btn--sm" type="button" data-new-address>
          ${l(d("plus",{size:15}))} افزودن نشانی
        </button>
      </div>

      <div class="stack" data-slot="address-list"></div>
    `.toString();const e=f('[data-slot="address-list"]',v);if(!a.length){e.append(j({iconName:"marker",title:"هنوز نشانی‌ای ثبت نکرده‌اید",text:"برای تسویه حساب سریع‌تر، نشانی تحویل خود را اضافه کنید.",compact:!0,action:{label:"افزودن نشانی",variant:"btn--primary",onClick:()=>k(null)}}).node);return}a.forEach(s=>{const t=N("article",{class:`address-card glass radius-lg${s.isDefault?" is-default":""}`});t.innerHTML=u`
        <div class="address-card__head">
          <div class="row row--sm">
            <span class="fw-bold">${s.title}</span>
            ${s.isDefault?u`<span class="badge badge--brand">پیش‌فرض</span>`:""}
          </div>
          <div class="row row--sm">
            <button
              class="btn btn--ghost btn--xs"
              type="button"
              data-edit-address="${s.id}"
            >
              ${l(d("edit",{size:14}))} ویرایش
            </button>
            <button
              class="btn btn--ghost btn--xs text-danger"
              type="button"
              data-delete-address="${s.id}"
            >
              ${l(d("trash",{size:14}))} حذف
            </button>
          </div>
        </div>

        <p class="fs-sm mb-2">
          ${s.province}، ${s.city}، ${s.line1}
          ${s.line2?`، ${s.line2}`:""}
        </p>

        <div class="row row--sm fs-xs text-soft">
          <span>${s.recipient}</span>
          <span>•</span>
          <span>${s.phone}</span>
          <span>•</span>
          <span>کد پستی ${m(s.postalCode)}</span>
        </div>

        ${s.isDefault?"":u`
              <button
                class="btn btn--glass btn--xs mt-3"
                type="button"
                data-default-address="${s.id}"
              >
                ${l(d("check",{size:14}))} انتخاب به‌عنوان پیش‌فرض
              </button>
            `}
      `.toString(),e.append(t)})}function q(){const a={newsletter:!!n.newsletter,orderUpdates:n.orderUpdates!==!1,prescriptionUpdates:n.prescriptionUpdates!==!1,promotions:!!n.promotions,sms:n.sms!==!1};v.innerHTML=u`
      <h2 class="mb-4">
        ${l(d("bell",{size:20}))} ترجیح‌های اطلاع‌رسانی
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
            ${a.newsletter?"checked":""}
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
            ${a.orderUpdates?"checked":""}
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
            ${a.prescriptionUpdates?"checked":""}
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
            ${a.promotions?"checked":""}
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
            ${a.sms?"checked":""}
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
        ${l(d("lock",{size:18}))}
        <span
          >شماره تماس شما فقط برای اطلاع‌رسانی سفارش استفاده می‌شود و جایی ارسال
          نمی‌گردد.</span
        >
      </div>
    `.toString()}function I(){const a=Q();v.innerHTML=u`
      <h2 class="mb-4">
        ${l(d("database",{size:20}))} داده‌های نمایشی
      </h2>
      <p class="text-muted fs-sm">
        دارومیکس یک نمونه نمایشی بدون سرور است. همه داده‌ها در حافظه محلی مرورگر
        شما ذخیره می‌شوند و می‌توانید آن‌ها را بازنشانی کنید.
      </p>

      <div class="auto-grid auto-grid--wide mt-6">
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value">${m(a.orders)}</span>
          <span class="mini-stat__label">سفارش ثبت‌شده</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${m(a.wishlist)}</span
          >
          <span class="mini-stat__label">علاقه‌مندی</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${m(a.prescriptions)}</span
          >
          <span class="mini-stat__label">نسخه ثبت‌شده</span>
        </div>
        <div class="mini-stat glass radius-lg">
          <span class="mini-stat__value"
            >${m(a.consultations)}</span
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
            ${l(d("trash",{size:15}))} پاک کردن
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
            ${l(d("rotate",{size:15}))} بازنشانی کامل
          </button>
        </div>
      </div>

      <div class="alert alert--warn mt-6">
        ${l(d("alert",{size:18}))}
        <span>این عملیات قابل بازگشت نیست. پیش از ادامه مطمئن شوید.</span>
      </div>
    `.toString()}function h(){_==="addresses"?U():_==="preferences"?q():_==="data"?I():T()}function k(a){const e=!!a,s=G({title:e?"ویرایش نشانی":"افزودن نشانی جدید",size:"md",body:u`
        <form class="form-grid form-grid--2" data-address-form novalidate>
          <div class="field">
            <label class="field__label" for="am-title">عنوان نشانی</label>
            <input
              class="input"
              id="am-title"
              name="title"
              value="${(a==null?void 0:a.title)||""}"
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
              value="${(a==null?void 0:a.recipient)||""}"
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
              value="${(a==null?void 0:a.phone)||""}"
            />
          </div>
          <div class="field">
            <label class="field__label" for="am-postal">کد پستی</label>
            <input
              class="input"
              id="am-postal"
              name="postalCode"
              inputmode="numeric"
              value="${(a==null?void 0:a.postalCode)||""}"
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
              value="${(a==null?void 0:a.province)||""}"
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
              value="${(a==null?void 0:a.city)||""}"
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
              value="${(a==null?void 0:a.line1)||""}"
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
              value="${(a==null?void 0:a.line2)||""}"
            />
          </div>
          <label class="check" style="grid-column:1/-1">
            <input
              type="checkbox"
              name="isDefault"
              ${a!=null&&a.isDefault?"checked":""}
            />
            <span class="check__box">${l(d("check",{size:13}))}</span>
            <span class="check__text">این نشانی پیش‌فرض من باشد</span>
          </label>
          <span
            class="field__error"
            data-form-error
            hidden
            style="grid-column:1/-1"
          ></span>
        </form>
      `,footer:`<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button><button class="btn btn--primary" type="button" data-save-address>${e?"ذخیره تغییرات":"ذخیره نشانی"}</button>`});s.open(),s.node.addEventListener("click",t=>{var A;if(!t.target.closest("[data-save-address]"))return;const p=f("[data-address-form]",s.node),$=f("[data-form-error]",p),o=y=>{var E;return((E=f(`[name="${y}"]`,p))==null?void 0:E.value.trim())||""};if(["recipient","phone","province","city","line1"].filter(y=>!o(y)).length){$.hidden=!1,$.textContent="پر کردن فیلدهای ستاره‌دار الزامی است.";return}const S={title:o("title")||"نشانی جدید",recipient:o("recipient"),phone:o("phone"),postalCode:o("postalCode"),province:o("province"),city:o("city"),line1:o("line1"),line2:o("line2"),isDefault:!!((A=f('[name="isDefault"]',p))!=null&&A.checked)};e?F(a.id,S):J(S),s.close(),b.success(e?"نشانی به‌روزرسانی شد":"نشانی ذخیره شد"),h()})}return c.push(r(i,"click","[data-save-profile]",a=>{a.preventDefault();const e=f("[data-profile-form]",i),s=f("[data-form-error]",i),t=$=>{var o;return((o=f(`[name="${$}"]`,e))==null?void 0:o.value.trim())||""};if(!t("phone")){s.hidden=!1,s.textContent="شماره تماس الزامی است.";return}const p=t("email");if(p&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p)){s.hidden=!1,s.textContent="آدرس ایمیل معتبر نیست.";return}s.hidden=!0,D({firstName:t("firstName"),lastName:t("lastName"),name:`${t("firstName")} ${t("lastName")}`.trim()||n.name,phone:t("phone"),email:p,nationalId:t("nationalId"),birthDate:t("birthDate")}),b.success("پروفایل ذخیره شد"),window.location.reload()})),c.push(r(i,"click","[data-reload-profile]",a=>{a.preventDefault(),h(),b.info("فرم بازگردانی شد")})),c.push(r(i,"click","[data-gender]",(a,e)=>{var t;a.preventDefault();const s=e.dataset.gender;(t=e.parentElement)==null||t.querySelectorAll("[data-gender]").forEach(p=>p.classList.toggle("is-active",p===e)),D({gender:s}),b.info("جنسیت به‌روزرسانی شد")})),c.push(r(i,"click","[data-new-address]",a=>{a.preventDefault(),k(null)})),c.push(r(i,"click","[data-edit-address]",(a,e)=>{a.preventDefault();const s=g().find(t=>t.id===e.dataset.editAddress);s&&k(s)})),c.push(r(i,"click","[data-delete-address]",async(a,e)=>{a.preventDefault(),await w({title:"حذف نشانی",message:"این نشانی حذف شود؟",confirmLabel:"حذف کن",danger:!0})&&(K(e.dataset.deleteAddress),b.info("نشانی حذف شد"),h())})),c.push(r(i,"click","[data-default-address]",(a,e)=>{a.preventDefault(),W(e.dataset.defaultAddress),b.success("نشانی پیش‌فرض تغییر کرد"),h()})),c.push(r(i,"change","[data-pref]",(a,e)=>{D({[e.dataset.pref]:e.checked}),b.success("ترجیح ذخیره شد","تنظیمات اطلاع‌رسانی به‌روزرسانی شد.")})),c.push(r(i,"click","[data-wipe-history]",async a=>{if(a.preventDefault(),!await w({title:"پاک کردن سابقه",message:"سفارش‌ها، نسخه‌ها، مشاوره‌ها و نظرات شما حذف شوند؟",confirmLabel:"پاک کن",danger:!0}))return;const{resetDemoData:s}=await C(()=>import("./admin-cbf8d426.js"),["./admin-cbf8d426.js","./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url);s(),X(),Y(),b.success("سابقه پاک شد"),window.location.reload()})),c.push(r(i,"click","[data-reset-all]",async a=>{if(a.preventDefault(),!await w({title:"بازنشانی کامل حساب نمایشی",message:"همه داده‌های محلی پاک می‌شوند: پروفایل، سبد خرید، علاقه‌مندی‌ها، سفارش‌ها و ویرایش‌های مدیریتی. برنامه به حالت اولیه برمی‌گردد.",confirmLabel:"بازنشانی کن",danger:!0}))return;const{resetDemoData:s}=await C(()=>import("./admin-cbf8d426.js"),["./admin-cbf8d426.js","./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url);s(),window.location.reload()})),c.push(r(i,"click","[data-reset-account]",async a=>{a.preventDefault(),await w({title:"بازنشانی حساب نمایشی",message:"پروفایل شما به حالت اولیه بازگردانده شود؟",confirmLabel:"بازنشانی",danger:!0})&&(Z(),P(),b.success("حساب نمایشی بازنشانی شد"),window.location.reload())})),h(),{node:i,title:"تنظیمات حساب",cleanup:()=>c.forEach(a=>a())}}export{ta as default};

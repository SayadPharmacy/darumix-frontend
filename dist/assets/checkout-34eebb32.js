import{e as R,al as j,w as b,aj as Q,h as i,r as n,I,_ as V,q as p,Q as W,i as d,ad as z,ac as M,L as c,ae as Y,am as D,t as _,an as P,ao as S,ap as J,aq as q,ab as K,k as X,ar as Z,A as y,as as ss,a9 as as,at as es,j as T}from"./index-c305d6a7.js";import"./data-f43f95cf.js";const h=[{id:"address",label:"نشانی تحویل",icon:"marker"},{id:"shipping",label:"روش ارسال",icon:"truck"},{id:"payment",label:"پرداخت",icon:"creditCard"},{id:"review",label:"بازبینی و ثبت",icon:"checkCircle"}];async function ns(){const l=R("div"),u=[],e={step:0,address:j(),shippingId:"standard",paymentMethod:"online",coupon:null,note:"",placedOrder:null},L={address:()=>!!(e.address&&e.address.recipient&&e.address.line1&&e.address.city),shipping:()=>!!e.shippingId,payment:()=>!!e.paymentMethod,review:()=>!0};function C(){return i`
      <ol class="checkout-steps" aria-label="مراحل تسویه حساب">
        ${h.map((a,s)=>{const t=s<e.step?"done":s===e.step?"active":"todo";return n(i`
            <li class="checkout-step checkout-step--${t}">
              <span class="checkout-step__marker">
                ${t==="done"?n(d("check",{size:15})):n(d(a.icon,{size:15}))}
              </span>
              <span class="checkout-step__label">${a.label}</span>
            </li>
          `)})}
      </ol>
    `.toString()}function E(){const a=D();return i`
      <div class="stack">
        <h2 class="mb-0">نشانی تحویل سفارش</h2>
        <p class="text-muted fs-sm">
          نشانی‌ای را انتخاب کنید که سفارش به آن ارسال شود. می‌توانید نشانی جدید
          هم اضافه کنید.
        </p>

        <div class="stack" data-slot="address-list">
          ${a.map(s=>{var t,r;return n(i`
              <label
                class="address-card glass radius-lg${((t=e.address)==null?void 0:t.id)===s.id?" is-selected":""}"
                data-address="${s.id}"
              >
                <input
                  type="radio"
                  name="address"
                  value="${s.id}"
                  ${((r=e.address)==null?void 0:r.id)===s.id?"checked":""}
                  data-address-radio
                />
                <div>
                  <div class="row row--sm">
                    <span class="fw-bold">${s.title}</span>
                    ${s.isDefault?i`<span class="badge badge--brand">پیش‌فرض</span>`:""}
                  </div>
                  <p class="fs-sm text-muted mb-1 mt-2">
                    ${s.province}، ${s.city}، ${s.line1}
                    ${s.line2?`، ${s.line2}`:""}
                  </p>
                  <div class="row row--sm fs-xs text-soft">
                    <span>${s.recipient}</span>
                    <span>•</span>
                    <span>${s.phone}</span>
                    <span>•</span>
                    <span>کد پستی ${_(s.postalCode)}</span>
                  </div>
                </div>
              </label>
            `)})}
        </div>

        <button class="btn btn--glass" type="button" data-add-address>
          ${n(d("plus",{size:16}))} افزودن نشانی جدید
        </button>

        <div class="field">
          <label class="field__label" for="order-note"
            >یادداشت برای پیک (اختیاری)</label
          >
          <textarea
            class="textarea"
            id="order-note"
            rows="2"
            placeholder="مثلاً: تحویل به نگهبانی ساختمان"
            data-note
          >
${e.note}</textarea
          >
        </div>
      </div>
    `.toString()}function H(){const a=M();return i`
      <div class="stack">
        <h2 class="mb-0">روش ارسال</h2>
        <p class="text-muted fs-sm">
          ${a.qualifiesFreeShipping?i`سفارش شما واجد شرایط ارسال رایگان است.`:i`برای ارسال رایگان، ${c(a.freeShippingGap)} دیگر
              خرید کنید.`}
        </p>

        <div class="stack" data-slot="shipping-list">
          ${P.map(s=>{const t=a.qualifiesFreeShipping||s.price===0;return n(i`
              <label
                class="option-card glass radius-lg${e.shippingId===s.id?" is-selected":""}"
                data-shipping="${s.id}"
              >
                <input
                  type="radio"
                  name="shipping"
                  value="${s.id}"
                  ${e.shippingId===s.id?"checked":""}
                  data-shipping-radio
                />
                <span class="option-card__icon"
                  >${n(d(s.icon,{size:20}))}</span
                >
                <div class="grow">
                  <div class="fw-bold">${s.label}</div>
                  <p class="fs-xs text-muted mb-0">${s.description}</p>
                </div>
                <span class="fw-bold">
                  ${t?i`<span class="text-success">رایگان</span>`:c(s.price,{withUnit:!1})}
                </span>
              </label>
            `)})}
        </div>

        <div class="alert alert--info">
          ${n(d("clock",{size:18}))}
          <span>زمان تقریبی تحویل: ${S(2)}</span>
        </div>
      </div>
    `.toString()}function O(){var s;const a=((s=J())==null?void 0:s.walletBalance)||0;return i`
      <div class="stack">
        <h2 class="mb-0">روش پرداخت</h2>
        <p class="text-muted fs-sm">
          این نسخه نمایشی است؛ هیچ پرداخت واقعی انجام نمی‌شود و اطلاعات کارت
          دریافت نمی‌گردد.
        </p>

        <div class="stack" data-slot="payment-list">
          ${q.map(t=>{const r=t.id==="wallet"&&a<=0;return n(i`
              <label
                class="option-card glass radius-lg${e.paymentMethod===t.id?" is-selected":""}${r?" is-disabled":""}"
                data-payment="${t.id}"
              >
                <input
                  type="radio"
                  name="payment"
                  value="${t.id}"
                  ${e.paymentMethod===t.id?"checked":""}
                  ${r?"disabled":""}
                  data-payment-radio
                />
                <span class="option-card__icon"
                  >${n(d(t.icon,{size:20}))}</span
                >
                <div class="grow">
                  <div class="fw-bold">${t.label}</div>
                  <p class="fs-xs text-muted mb-0">${t.description}</p>
                </div>
                ${t.id==="wallet"?i`<span class="fs-xs fw-bold"
                      >${c(a,{withUnit:!1})}</span
                    >`:""}
              </label>
            `)})}
        </div>

        ${e.paymentMethod==="online"?i`
              <div class="alert alert--warn">
                ${n(d("alert",{size:18}))}
                <span
                  >با انتخاب پرداخت آنلاین، در نسخه واقعی به درگاه بانکی هدایت
                  می‌شوید. در این نمایش، سفارش مستقیماً ثبت می‌شود.</span
                >
              </div>
            `:""}
      </div>
    `.toString()}function A(){var r,o,x,w,$,f,g;const a=z({shippingId:e.shippingId,coupon:e.coupon}),s=K(),t=P.find(v=>v.id===e.shippingId);return i`
      <div class="stack stack--lg">
        <div>
          <h2 class="mb-2">بازبینی نهایی</h2>
          <p class="text-muted fs-sm mb-0">
            پیش از ثبت سفارش، اطلاعات زیر را بررسی کنید.
          </p>
        </div>

        ${a.requiresPrescription?i`
              <div class="alert alert--warn">
                ${n(d("prescription",{size:18}))}
                <span
                  >در سبد شما داروی نیازمند نسخه وجود دارد. سفارش ثبت می‌شود اما
                  پیش از ارسال، داروساز نسخه شما را بررسی می‌کند.</span
                >
              </div>
            `:""}

        <!-- Items -->
        <section class="glass radius-lg review-block">
          <h3 class="review-block__title">
            کالاها (${_(a.units)} عدد)
          </h3>
          <div class="stack stack--sm">
            ${s.map(v=>n(i`
                <div class="review-item">
                  <span class="review-item__media"
                    >${n(X(v.product))}</span
                  >
                  <div class="grow">
                    <div class="fw-semibold">${v.product.name}</div>
                    <span class="fs-xs text-soft"
                      >${_(v.quantity)} ×
                      ${c(v.unitPrice,{withUnit:!1})}
                      تومان</span
                    >
                  </div>
                  <span class="fw-bold"
                    >${c(v.lineTotal,{withUnit:!1})}
                    تومان</span
                  >
                </div>
              `))}
          </div>
        </section>

        <!-- Address -->
        <section class="glass radius-lg review-block">
          <div class="row row--between">
            <h3 class="review-block__title">نشانی تحویل</h3>
            <button class="btn btn--ghost btn--xs" type="button" data-goto="0">
              ویرایش
            </button>
          </div>
          <p class="fs-sm mb-1">
            ${(r=e.address)==null?void 0:r.province}، ${(o=e.address)==null?void 0:o.city}،
            ${(x=e.address)==null?void 0:x.line1}
          </p>
          <div class="row row--sm fs-xs text-soft">
            <span>${(w=e.address)==null?void 0:w.recipient}</span>
            <span>•</span>
            <span>${($=e.address)==null?void 0:$.phone}</span>
          </div>
        </section>

        <!-- Shipping & payment -->
        <section class="glass radius-lg review-block">
          <div class="row row--between">
            <h3 class="review-block__title">ارسال و پرداخت</h3>
            <button class="btn btn--ghost btn--xs" type="button" data-goto="1">
              ویرایش
            </button>
          </div>
          <div class="summary-row">
            <span>روش ارسال</span>
            <span>${(t==null?void 0:t.label)||"—"}</span>
          </div>
          <div class="summary-row">
            <span>روش پرداخت</span>
            <span
              >${((f=q.find(v=>v.id===e.paymentMethod))==null?void 0:f.label)||"—"}</span
            >
          </div>
          <div class="summary-row">
            <span>تاریخ تحویل تقریبی</span>
            <span>${S((g=t==null?void 0:t.etaDays)!=null?g:2)}</span>
          </div>
        </section>

        <label class="check">
          <input type="checkbox" data-terms />
          <span class="check__box">${n(d("check",{size:13}))}</span>
          <span class="check__text"
            >قوانین فروش و سیاست بازگشت کالای دارومیکس را مطالعه کرده و
            می‌پذیرم.</span
          >
        </label>
      </div>
    `.toString()}function B(){switch(h[e.step].id){case"address":return E();case"shipping":return H();case"payment":return O();default:return A()}}function F(){const a=z({shippingId:e.shippingId,coupon:e.coupon}),s=M();return i`
      <aside class="cart-summary glass-2 radius-xl">
        <h2 class="cart-summary__title">
          ${n(d("receipt",{size:19}))} خلاصه پرداخت
        </h2>

        <div class="free-ship">
          ${s.qualifiesFreeShipping?i`<div class="row row--sm text-success">
                ${n(d("truck",{size:17}))}
                <span class="fs-sm fw-semibold">ارسال رایگان فعال شد</span>
              </div>`:i`<p class="fs-sm mb-2">
                تا ارسال رایگان
                <strong
                  >${c(s.freeShippingGap,{withUnit:!1})}
                  تومان</strong
                >
                باقی مانده
              </p>`}
          ${n(Y(s.freeShippingProgress,"brand"))}
        </div>

        <div class="summary-rows">
          <div class="summary-row">
            <span>جمع کالاها</span>
            <span>${c(a.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>هزینه ارسال</span>
            <span>
              ${a.shippingFree?i`<span class="text-success fw-bold">رایگان</span>`:c(a.shipping)}
            </span>
          </div>
          ${a.discount?i`<div class="summary-row text-success">
                <span>تخفیف</span>
                <span>−${c(a.discount)}</span>
              </div>`:""}
          <div class="summary-row summary-row--total">
            <span>قابل پرداخت</span>
            <span>${c(a.payable)}</span>
          </div>
        </div>

        ${h.length>1?i`<p class="fs-xs text-soft mt-3 mb-0">
              آستانه ارسال رایگان: ${c(Z)}
            </p>`:""}
      </aside>
    `.toString()}function m(){if(e.placedOrder){const s=e.placedOrder;l.innerHTML=i`
        <div class="shell shell--narrow">
          <div class="order-success glass-2 radius-xl">
            <span class="order-success__icon"
              >${n(d("checkCircle",{size:44}))}</span
            >
            <h1 class="order-success__title">سفارش شما ثبت شد</h1>
            <p class="text-muted">
              از خرید شما سپاسگزاریم. کد پیگیری سفارش شما در ادامه آمده است.
            </p>

            <div class="order-code">
              <span class="fs-xs text-soft">کد سفارش</span>
              <strong class="fs-xl">${s.id}</strong>
            </div>

            <div class="summary-rows mt-6" style="text-align:start">
              <div class="summary-row">
                <span>مبلغ پرداختی</span>
                <span>${c(s.total)}</span>
              </div>
              <div class="summary-row">
                <span>تعداد اقلام</span>
                <span>${_(s.itemCount)} عدد</span>
              </div>
              <div class="summary-row">
                <span>تحویل تقریبی</span>
                <span>${S(2)}</span>
              </div>
            </div>

            <div class="row mt-8" style="justify-content:center">
              <a
                class="btn btn--primary"
                href="${T(`/account/order/${s.id}`)}"
              >
                ${n(d("package",{size:18}))} پیگیری سفارش
              </a>
              <a class="btn btn--glass" href="${T("/catalog")}">
                ${n(d("bag",{size:18}))} ادامه خرید
              </a>
            </div>
          </div>
        </div>
      `.toString();return}if(Q()){l.innerHTML=i`
        <div class="shell">
          ${n(I([{label:"خانه",href:"/"},{label:"تسویه حساب"}]))}
          ${n(V({title:"تسویه حساب"}))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString(),p('[data-slot="empty"]',l).append(W({iconName:"cart",title:"برای تسویه حساب، سبد خرید نباید خالی باشد",text:"ابتدا محصولی را به سبد اضافه کنید، سپس فرآیند خرید را کامل کنید.",action:{label:"مشاهده فروشگاه",variant:"btn--primary",href:"/catalog"}}).node);return}l.innerHTML=i`
      <div class="shell">
        ${n(I([{label:"خانه",href:"/"},{label:"سبد خرید",href:"/cart"},{label:"تسویه حساب"}]))}

        <header class="page-intro">
          <h1 class="page-intro__title">تسویه حساب</h1>
        </header>

        ${n(C())}

        <div class="checkout-layout">
          <div>
            <div class="glass radius-xl checkout-panel" data-slot="body"></div>

            <div class="checkout-nav">
              <button
                class="btn btn--glass"
                type="button"
                data-prev
                ${e.step===0?"disabled":""}
              >
                ${n(d("arrowRight",{size:17}))} مرحله قبل
              </button>

              ${e.step<h.length-1?i`<button class="btn btn--primary" type="button" data-next>
                    مرحله بعد ${n(d("arrowLeft",{size:17}))}
                  </button>`:i`<button
                    class="btn btn--primary btn--lg"
                    type="button"
                    data-place-order
                  >
                    ${n(d("checkCircle",{size:18}))} ثبت نهایی سفارش
                  </button>`}
            </div>
          </div>

          <div data-slot="summary"></div>
        </div>
      </div>
    `.toString(),p('[data-slot="body"]',l).innerHTML=B(),p('[data-slot="summary"]',l).innerHTML=F();const a=p("[data-note]",l);a&&a.addEventListener("input",()=>{e.note=a.value})}function k(a){var s;a<0||a>=h.length||(e.step=a,m(),(s=p(".checkout-steps",l))==null||s.scrollIntoView({behavior:"smooth",block:"start"}))}function N(){const a=h[e.step].id;if(!L[a]()){y.error("تکمیل این مرحله الزامی است","لطفاً اطلاعات خواسته‌شده را کامل کنید.");return}k(e.step+1)}async function U(){const a=p("[data-terms]",l);if(a&&!a.checked){y.warn("پذیرش قوانین الزامی است","برای ثبت سفارش باید قوانین را بپذیرید.");return}const s=p("[data-place-order]",l);s.classList.add("is-busy");const t=ss({address:e.address,shippingId:e.shippingId,paymentMethod:e.paymentMethod,couponCode:"",note:e.note});if(s.classList.remove("is-busy"),!t.ok){y.error("ثبت سفارش ناموفق بود",t.reason);return}e.placedOrder=t.order,m(),y.success("سفارش شما ثبت شد",`کد سفارش: ${t.order.id}`)}function G(){const a=as({title:"افزودن نشانی جدید",size:"md",body:i`
        <form class="form-grid form-grid--2" data-address-form novalidate>
          <div class="field">
            <label class="field__label" for="addr-title">عنوان نشانی</label>
            <input
              class="input"
              id="addr-title"
              name="title"
              placeholder="خانه، محل کار…"
            />
          </div>
          <div class="field">
            <label class="field__label" for="addr-recipient"
              >نام گیرنده <span class="field__required">*</span></label
            >
            <input class="input" id="addr-recipient" name="recipient" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-phone"
              >شماره تماس <span class="field__required">*</span></label
            >
            <input class="input" id="addr-phone" name="phone" inputmode="tel" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-postal">کد پستی</label>
            <input
              class="input"
              id="addr-postal"
              name="postalCode"
              inputmode="numeric"
            />
          </div>
          <div class="field">
            <label class="field__label" for="addr-province"
              >استان <span class="field__required">*</span></label
            >
            <input class="input" id="addr-province" name="province" />
          </div>
          <div class="field">
            <label class="field__label" for="addr-city"
              >شهر <span class="field__required">*</span></label
            >
            <input class="input" id="addr-city" name="city" />
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="addr-line1"
              >نشانی کامل <span class="field__required">*</span></label
            >
            <input class="input" id="addr-line1" name="line1" />
            <span class="field__error" data-error hidden></span>
          </div>
          <label class="check" style="grid-column:1/-1">
            <input type="checkbox" name="isDefault" />
            <span class="check__box">${n(d("check",{size:13}))}</span>
            <span class="check__text">این نشانی پیش‌فرض من باشد</span>
          </label>
        </form>
      `,footer:'<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button><button class="btn btn--primary" type="button" data-save-address>ذخیره نشانی</button>'});a.open(),a.node.addEventListener("click",s=>{var $;if(!s.target.closest("[data-save-address]"))return;const t=p("[data-address-form]",a.node),r=p("[data-error]",t),o=f=>{var g;return((g=p(`[name="${f}"]`,t))==null?void 0:g.value.trim())||""};if(["recipient","phone","province","city","line1"].filter(f=>!o(f)).length){r.hidden=!1,r.textContent="پر کردن فیلدهای ستاره‌دار الزامی است.";return}const w=es({title:o("title")||"نشانی جدید",recipient:o("recipient"),phone:o("phone"),postalCode:o("postalCode"),province:o("province"),city:o("city"),line1:o("line1"),line2:"",isDefault:!!(($=p('[name="isDefault"]',t))!=null&&$.checked)});a.close(),e.address=w,y.success("نشانی ذخیره شد"),m()})}return u.push(b(l,"click","[data-next]",a=>{a.preventDefault(),N()})),u.push(b(l,"click","[data-prev]",a=>{a.preventDefault(),k(e.step-1)})),u.push(b(l,"click","[data-goto]",(a,s)=>{a.preventDefault(),k(Number(s.dataset.goto))})),u.push(b(l,"click","[data-place-order]",a=>{a.preventDefault(),U()})),u.push(b(l,"click","[data-add-address]",a=>{a.preventDefault(),G()})),u.push(b(l,"change","[data-address-radio]",(a,s)=>{const t=D().find(r=>r.id===s.value);t&&(e.address=t,m())})),u.push(b(l,"change","[data-shipping-radio]",(a,s)=>{e.shippingId=s.value,m()})),u.push(b(l,"change","[data-payment-radio]",(a,s)=>{e.paymentMethod=s.value,m()})),m(),{node:l,title:"تسویه حساب",cleanup:()=>u.forEach(a=>a())}}export{ns as default};

import{e as b,ap as A,h as n,r as l,I as H,_ as E,s as D,aG as L,i as c,a8 as f,t as h,aH as M,q as r,aD as P,aE as K,aF as N,w as u,A as $,j as O}from"./index-c305d6a7.js";import{e as F,P as B,f as R,g as W}from"./prescriptions-311987a1.js";import"./data-f43f95cf.js";function j(i=7){return Array.from({length:i},(p,v)=>{const o=new Date;return o.setDate(o.getDate()+v),o.setHours(0,0,0,0),{key:`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`,date:o,isToday:v===0}})}async function V(){var w;const i=b("div"),p=[],v=j(7),o=B,_=F(5),e={pharmacistId:o[0].id,topic:"",dateKey:v[0].key,slot:"",mode:"phone",question:"",phone:((w=A())==null?void 0:w.phone)||""};function I(){const s=R(e.dateKey);return n`
      <div class="slot-grid" data-slot="slots">
        ${s.map(a=>{const t=e.slot===a.slot;return l(n`
            <button
              class="slot${t?" is-active":""}"
              type="button"
              data-slot-value="${a.slot}"
              ${a.taken?"disabled":""}
              aria-pressed="${t}"
            >
              ${a.slot}
              ${a.taken?n`<span class="slot__note">تکمیل</span>`:""}
            </button>
          `)})}
      </div>
    `.toString()}i.innerHTML=n`
    <div class="shell">
      ${l(H([{label:"خانه",href:"/"},{label:"مشاوره داروساز"}]))}
      ${l(E({title:"مشاوره با داروساز",text:"پیش از خرید یا مصرف دارو، با داروساز متخصص گفت‌وگو کنید؛ درباره تداخل دارویی، دوز مصرف و عوارض احتمالی بپرسید. مشاوره در این نسخه نمایشی رایگان است."}))}

      <!-- ===================== Pharmacists ===================== -->
      <section class="section section--tight">
        ${l(D({title:"انتخاب داروساز",subtitle:"می‌توانید داروساز مورد نظر خود را انتخاب کنید یا انتخاب را به ما بسپارید.",iconName:"stethoscope"}))}
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
              ${L.map(s=>l(n`<option value="${s}">${s}</option>`))}
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
                ${l(c("phone",{size:15}))} تلفنی
              </button>
              <button class="btn-group__item" type="button" data-mode="chat">
                ${l(c("message",{size:15}))} پیام
              </button>
              <button class="btn-group__item" type="button" data-mode="in-person">
                ${l(c("store",{size:15}))} حضوری
              </button>
            </div>
          </div>

          <!-- Date -->
          <div class="field mt-4">
            <span class="field__label">تاریخ مشاوره <span class="field__required">*</span></span>
            <div class="day-row" data-slot="days">
              ${v.map(s=>l(n`
                  <button
                    class="day${s.key===e.dateKey?" is-active":""}"
                    type="button"
                    data-day="${s.key}"
                  >
                    <span class="day__weekday"
                      >${s.isToday?"امروز":f(s.date,{withWeekday:!0}).split("،")[0]}</span
                    >
                    <span class="day__num">${h(M(s.date).day)}</span>
                    <span class="day__month">${f(s.date).split(" ")[1]}</span>
                  </button>
                `))}
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
                value="${e.phone}"
                data-phone
              />
            </div>
            <div class="field">
              <label class="field__label" for="cs-pharmacist">داروساز</label>
              <select class="select" id="cs-pharmacist" data-pharmacist>
                ${o.map(s=>l(n`
                    <option value="${s.id}" ${s.id===e.pharmacistId?"selected":""}>
                      ${s.name} — ${s.specialty}
                    </option>
                  `))}
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
            ${l(c("info",{size:18}))}
            <span
              >مشاوره دارومیکس جایگزین ویزیت پزشک نیست. در شرایط اورژانسی با ۱۱۵ تماس بگیرید.</span
            >
          </div>

          <button class="btn btn--primary btn--lg btn--block mt-6" type="submit">
            ${l(c("calendar",{size:18}))} ثبت درخواست مشاوره
          </button>
        </form>

        <!-- ===================== Side ===================== -->
        <aside class="stack stack--lg">
          <div class="glass radius-xl p-6" data-slot="summary"></div>

          <div class="glass radius-xl p-6">
            <h3 class="mb-4">چرا مشاوره داروساز؟</h3>
            <div class="stack stack--sm fs-sm">
              <div class="row row--sm">
                ${l(c("checkCircle",{size:17}))}
                <span>بررسی تداخل داروها با یکدیگر</span>
              </div>
              <div class="row row--sm">
                ${l(c("checkCircle",{size:17}))}
                <span>راهنمای دوز مصرف برای کودکان و سالمندان</span>
              </div>
              <div class="row row--sm">
                ${l(c("checkCircle",{size:17}))}
                <span>انتخاب مکمل مناسب بر اساس شرایط شما</span>
              </div>
              <div class="row row--sm">
                ${l(c("checkCircle",{size:17}))}
                <span>آگاهی از عوارض احتمالی و شرایط نگهداری</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- ===================== History ===================== -->
      ${_.length?n`
            <section class="section">
              ${l(D({title:"سابقه مشاوره‌ها",subtitle:"درخواست‌های مشاوره شما و وضعیت آن‌ها.",iconName:"history"}))}
              <div class="stack" data-slot="history"></div>
            </section>
          `:""}
    </div>
  `.toString();function m(){const s=o.find(t=>t.id===e.pharmacistId),a=v.find(t=>t.key===e.dateKey);r('[data-slot="summary"]',i).innerHTML=n`
      <h3 class="mb-4">خلاصه درخواست</h3>
      <div class="stack stack--sm">
        <div class="summary-row">
          <span>داروساز</span>
          <span class="fw-bold">${(s==null?void 0:s.name)||"—"}</span>
        </div>
        <div class="summary-row">
          <span>تخصص</span>
          <span>${(s==null?void 0:s.specialty)||"—"}</span>
        </div>
        <div class="summary-row">
          <span>موضوع</span>
          <span>${e.topic||"انتخاب نشده"}</span>
        </div>
        <div class="summary-row">
          <span>تاریخ</span>
          <span>${a?f(a.date,{withWeekday:!0}):"—"}</span>
        </div>
        <div class="summary-row">
          <span>ساعت</span>
          <span>${e.slot||"انتخاب نشده"}</span>
        </div>
        <div class="summary-row">
          <span>نحوه برگزاری</span>
          <span
            >${e.mode==="phone"?"تلفنی":e.mode==="chat"?"پیام‌رسان":"حضوری"}</span
          >
        </div>
        <div class="summary-row summary-row--total">
          <span>هزینه مشاوره</span>
          <span class="text-success">رایگان در نسخه نمایشی</span>
        </div>
      </div>
    `.toString()}const C=r('[data-slot="slot-host"]',i);function g(){C.innerHTML=I()}const T=r('[data-slot="pharmacists"]',i);o.forEach(s=>{const a=b("button",{class:`pharmacist glass radius-lg${s.id===e.pharmacistId?" is-selected":""}`,type:"button","data-pharmacist-card":s.id});a.innerHTML=n`
      <span class="pharmacist__avatar">${l(c("user",{size:26}))}</span>
      <div class="grow" style="text-align:start">
        <div class="fw-bold">${s.name}</div>
        <p class="fs-xs text-muted mb-0">${s.specialty}</p>
        <div class="row row--sm fs-xs text-soft mt-2">
          <span>${l(c("star",{size:13,filled:!0}))}</span>
          <span>${h(s.rating.toFixed(1))}</span>
          <span>•</span>
          <span>${h(s.years)} سال تجربه</span>
        </div>
      </div>
      <span class="pharmacist__check">${l(c("check",{size:16}))}</span>
    `.toString(),T.append(a)});const y=r('[data-slot="history"]',i);return y&&_.forEach(s=>{const a=P("consultation",s.status),t=s.date?new Date(s.date):null,d=b("article",{class:"record-card glass radius-lg"});d.innerHTML=n`
        <div class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong class="fs-sm">${s.topic}</strong>
              ${l(K(a))}
              ${s.demo?n`<span class="badge badge--neutral">نمونه نمایشی</span>`:""}
            </div>
            <span class="fs-xs text-soft"
              >${s.pharmacistName}${t?` · ${f(t)}`:""}</span
            >
          </div>
          <span class="fs-xs text-soft"
            >${s.slot?h(s.slot):""}</span
          >
        </div>
        ${s.question?n`<p class="fs-sm text-muted mt-3 mb-0">${s.question}</p>`:""}
        <span class="fs-xs text-soft mt-2"
          >${N(s.createdAt)}</span
        >
      `.toString(),y.append(d)}),p.push(u(i,"click","[data-pharmacist-card]",(s,a)=>{s.preventDefault(),e.pharmacistId=a.dataset.pharmacistCard,r("[data-pharmacist]",i).value=e.pharmacistId,i.querySelectorAll("[data-pharmacist-card]").forEach(t=>t.classList.toggle("is-selected",t===a)),m()})),p.push(u(i,"click","[data-day]",(s,a)=>{s.preventDefault(),e.dateKey=a.dataset.day,e.slot="",i.querySelectorAll("[data-day]").forEach(t=>t.classList.toggle("is-active",t===a)),g(),m()})),p.push(u(i,"click","[data-slot-value]",(s,a)=>{var t;s.preventDefault(),!a.disabled&&(e.slot=a.dataset.slotValue,(t=a.parentElement)==null||t.querySelectorAll("[data-slot-value]").forEach(d=>{d.classList.toggle("is-active",d===a),d.setAttribute("aria-pressed",String(d===a))}),m())})),p.push(u(i,"click","[data-mode]",(s,a)=>{var t;s.preventDefault(),e.mode=a.dataset.mode,(t=a.parentElement)==null||t.querySelectorAll("[data-mode]").forEach(d=>d.classList.toggle("is-active",d===a)),m()})),p.push(u(i,"change","[data-topic]",(s,a)=>{e.topic=a.value,m()})),p.push(u(i,"change","[data-pharmacist]",(s,a)=>{e.pharmacistId=a.value,i.querySelectorAll("[data-pharmacist-card]").forEach(t=>t.classList.toggle("is-selected",t.dataset.pharmacistCard===e.pharmacistId)),m()})),p.push(u(i,"submit","[data-booking-form]",s=>{var k,S,x,q;s.preventDefault();const a=r("[data-form-error]",i),t={topic:((k=r("[data-topic]",i))==null?void 0:k.value)||"",date:e.dateKey,slot:e.slot,mode:e.mode,question:((S=r("[data-question]",i))==null?void 0:S.value.trim())||"",phone:((x=r("[data-phone]",i))==null?void 0:x.value.trim())||"",pharmacistName:((q=o.find(z=>z.id===e.pharmacistId))==null?void 0:q.name)||""};if(!t.topic){a.hidden=!1,a.textContent="موضوع مشاوره را انتخاب کنید.",$.warn("موضوع مشاوره انتخاب نشده است");return}if(!t.slot){a.hidden=!1,a.textContent="ساعت مشاوره را انتخاب کنید.",$.warn("ساعت مشاوره انتخاب نشده است");return}a.hidden=!0;const d=W(t);if(!d.ok){$.error("ثبت مشاوره ناموفق بود",d.reason);return}$.success("درخواست مشاوره ثبت شد",`${t.topic} — ${h(t.slot)}. نتیجه زمان‌بندی به شما اطلاع داده می‌شود.`,{duration:6e3,action:{label:"مشاهده مشاوره‌ها",onClick:()=>{window.location.hash=O("/consultation").slice(1)}}}),e.slot="",e.topic="",r("[data-topic]",i).value="",r("[data-question]",i).value="",g(),m()})),g(),m(),{node:i,title:"مشاوره داروساز",cleanup:()=>p.forEach(s=>s())}}export{V as default};

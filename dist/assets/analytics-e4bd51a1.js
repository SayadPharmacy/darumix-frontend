import{t,e as f,h as p,r as n,i as d,L as A,j as v,q as r,Q as x,Y as D,aD as F,aE as q,ae as b,w as B,A as I}from"./index-c305d6a7.js";import{analytics as K,overview as U}from"./admin-cbf8d426.js";import{k as g,m as u,a as j}from"./_layout-d6de18ae.js";import{r as Q,b as C,d as W,s as Y}from"./charts-d1686a93.js";import"./data-f43f95cf.js";async function ts(){const o=K(),c=U(),w=o.revenue.reduce((s,a)=>s+a.revenue,0),z=o.revenue.reduce((s,a)=>s+a.orders,0),L=[g({label:"درآمد ۱۴ روز",value:u(w),iconName:"currency",tone:"brand",change:c.revenueChange,hint:"تومان"}),g({label:"سفارش ۱۴ روز",value:t(z),iconName:"package",tone:"mint",change:c.ordersChange}),g({label:"نرخ تبدیل",value:`${t(c.conversionRate)}٪`,iconName:"target",tone:"blue",change:c.conversionChange,hint:"بازدید به خرید"}),g({label:"رضایت مشتری",value:t(c.satisfactionScore),iconName:"star",tone:"gold",hint:`نرخ مرجوعی ${t(c.returnRate)}٪`})],i=f("div",{class:"stack stack--lg"});i.innerHTML=p`
    <!-- ===================== Revenue ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <div>
          <h2 class="mb-1">
            ${n(d("trendingUp",{size:20}))} روند درآمد و سفارش
          </h2>
          <p class="fs-sm text-muted mb-0">
            بازه ۱۴ روز گذشته — مجموع ${A(w)}
          </p>
        </div>
        <button class="btn btn--glass btn--sm" type="button" data-export>
          ${n(d("download",{size:15}))} خروجی CSV (نمایشی)
        </button>
      </div>
      <div data-slot="revenue"></div>
    </section>

    <!-- ===================== Weekday + donut ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${n(d("calendar",{size:20}))} الگوی فروش هفتگی
        </h2>
        <div data-slot="weekday"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${n(d("pieChart",{size:20}))} سهم درآمد دسته‌بندی‌ها
        </h2>
        <div data-slot="mix"></div>
      </section>
    </div>

    <!-- ===================== Traffic + top products ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${n(d("globe",{size:20}))} منابع ورودی بازدیدکنندگان
        </h2>
        <div data-slot="traffic"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${n(d("crown",{size:20}))} پرفروش‌ترین محصولات
          </h2>
          <a class="btn btn--ghost btn--xs" href="${v("/admin/products")}"
            >محصولات</a
          >
        </div>
        <div class="table-wrap" data-slot="top"></div>
      </section>
    </div>

    <!-- ===================== Funnel + inventory ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${n(d("layers",{size:20}))} قیف وضعیت سفارش‌ها
        </h2>
        <div class="stack" data-slot="funnel"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">${n(d("database",{size:20}))} سلامت انبار</h2>
        <div class="stack" data-slot="inventory"></div>
      </section>
    </div>

    <!-- ===================== Segments ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <h2 class="mb-0">
          ${n(d("users",{size:20}))} بخش‌بندی مشتریان
        </h2>
        <a class="btn btn--ghost btn--xs" href="${v("/admin/customers")}"
          >مدیریت مشتریان</a
        >
      </div>
      <div class="auto-grid auto-grid--wide" data-slot="segments"></div>
    </section>
  `.toString();const T=r('[data-slot="revenue"]',i),m=Q(o.revenue,{valueKey:"revenue",labelKey:"date",height:240,formatValue:s=>u(s)});T.append(m.node);const M=r('[data-slot="weekday"]',i),N=C(o.weekday.map(s=>({label:s.label,value:s.value,hint:s.value?`${u(s.value)} تومان`:"بدون فروش"})),{formatValue:s=>`${u(s)} تومان`,tone:"mint"});M.append(N.node);const $=r('[data-slot="mix"]',i);if(o.mix.length){const s=W(o.mix.map((a,l)=>({label:a.title,value:a.revenue,tone:["brand","mint","teal","blue","gold","neutral"][l%6]})),{centerLabel:"تومان درآمد",centerValue:u(o.mix.reduce((a,l)=>a+l.revenue,0))});$.append(s.node)}else $.append(x({iconName:"pieChart",title:"داده‌ای برای سهم دسته‌بندی نیست",compact:!0}).node);const V=r('[data-slot="traffic"]',i),H=C(o.traffic.map(s=>({label:s.label,value:s.visits,icon:s.icon,hint:`${t(s.percent)}٪ از کل بازدیدها`})),{formatValue:s=>t(s)});V.append(H.node);const h=r('[data-slot="top"]',i);o.top.length?(h.innerHTML=p`
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">محصول</th>
            <th scope="col">فروش</th>
            <th scope="col">درآمد</th>
            <th scope="col">روند</th>
          </tr>
        </thead>
        <tbody>
          ${o.top.map((s,a)=>{const l=D(s.productId);return n(p`
              <tr>
                <td class="fw-bold">${t(a+1)}</td>
                <td>
                  <a
                    class="fw-semibold fs-sm"
                    href="${l?v(`/product/${l.slug}`):v("/admin/products")}"
                    >${s.name}</a
                  >
                </td>
                <td>${t(s.units)}</td>
                <td class="fw-semibold">${u(s.revenue)}</td>
                <td data-slot-inline="spark-${a}"></td>
              </tr>
            `)})}
        </tbody>
      </table>
    `.toString(),o.top.forEach((s,a)=>{const l=r(`[data-slot-inline="spark-${a}"]`,h);if(!l)return;const E=Y(Array.from({length:8},(G,P)=>s.units*(.6+(a+P)%5/6)),{tone:"brand"});l.append(E.node)})):h.append(x({iconName:"bag",title:"فروشی ثبت نشده است",compact:!0}).node);const O=r('[data-slot="funnel"]',i),S=c.orders||1;O.innerHTML=p`
    ${["pending","confirmed","processing","shipped","delivered"].map(s=>{const a=F("order",s),l=c.statusCounts[s]||0;return n(p`
          <div class="status-row">
            <div class="row row--sm">
              ${n(q(a))}
              <span class="grow"></span>
              <span class="fw-bold fs-sm">${t(l)}</span>
              <span class="fs-xs text-soft"
                >${t(Math.round(l/S*100))}٪</span
              >
            </div>
            ${n(b(l/S*100))}
          </div>
        `)})}
    <div class="summary-row summary-row--total mt-4">
      <span>کل سفارش‌ها</span>
      <span>${t(c.orders)}</span>
    </div>
  `.toString();const R=r('[data-slot="inventory"]',i),e=o.inventory;R.innerHTML=p`
    <div class="summary-row">
      <span>محصولات فعال</span>
      <span class="fw-bold">${t(e.total)}</span>
    </div>
    <div class="summary-row">
      <span>موجودی کل</span>
      <span class="fw-bold">${t(e.totalUnits)} عدد</span>
    </div>
    <div class="summary-row">
      <span>ارزش انبار</span>
      <span class="fw-bold">${u(e.inventoryValue)} تومان</span>
    </div>
    <div class="summary-row">
      <span>میانگین امتیاز</span>
      <span class="fw-bold"
        >${t(e.averageRating.toFixed(2))}</span
      >
    </div>

    <div class="divider"></div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">موجودی سالم</span>
        <span class="fw-bold"
          >${t(e.total-e.lowStock.length-e.outOfStock.length)}</span
        >
      </div>
      ${n(b((e.total-e.lowStock.length-e.outOfStock.length)/(e.total||1)*100,"mint"))}
    </div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">موجودی کم</span>
        <span class="fw-bold"
          >${t(e.lowStock.length)}</span
        >
      </div>
      ${n(b(e.lowStock.length/(e.total||1)*100,"gold"))}
    </div>

    <div class="status-row">
      <div class="row row--between">
        <span class="fs-sm">ناموجود</span>
        <span class="fw-bold"
          >${t(e.outOfStock.length)}</span
        >
      </div>
      ${n(b(e.outOfStock.length/(e.total||1)*100,"danger"))}
    </div>
  `.toString();const _=r('[data-slot="segments"]',i);o.segments.forEach(s=>{const a=f("div",{class:"mini-stat glass radius-lg"});a.innerHTML=p`
      <span class="mini-stat__value">${t(s.count)}</span>
      <span class="mini-stat__label">${s.label}</span>
    `.toString(),_.append(a)});const k=j({title:"تحلیل و آمار",subtitle:"عملکرد فروش، رفتار بازدیدکنندگان و سلامت انبار در یک نگاه.",iconName:"chart",stats:L,content:i,actions:(()=>{const s=f("a",{class:"btn btn--glass btn--sm",href:v("/admin")});return s.innerHTML=p`${n(d("grid",{size:15}))} پیشخوان`.toString(),s})()}),y=[];return y.push(B(i,"click","[data-export]",s=>{s.preventDefault(),I.info("خروجی CSV در نسخه نمایشی غیرفعال است","در نسخه واقعی، گزارش درآمد به‌صورت فایل قابل دانلود تولید می‌شود.")})),{node:k.node,title:"تحلیل و آمار",cleanup:()=>{var s;(s=m.cleanup)==null||s.call(m),k.cleanup(),y.forEach(a=>a())}}}export{ts as default};

import{t as e,e as g,h as o,r as t,i as c,j as m,q as r,ae as h,b0 as I,aE as w,aD as z,a8 as K,Q as U,aF as V,w as $,A as M,aO as q}from"./index-c305d6a7.js";import{overview as B,revenueSeries as F,categoryMix as Q,customerSegments as G,orders as J,prescriptions as W,orderById as X}from"./admin-cbf8d426.js";import{k as b,m as d,a as Y}from"./_layout-d6de18ae.js";import{r as Z}from"./charts-d1686a93.js";import"./data-f43f95cf.js";async function os(){const a=B(),f=F(14),S=Q(),x=G(),D=[b({label:"درآمد کل",value:d(a.revenue),iconName:"currency",tone:"brand",change:a.revenueChange,hint:"تومان"}),b({label:"سفارش‌ها",value:e(a.orders),iconName:"package",tone:"mint",change:a.ordersChange,hint:"کل سفارش‌های ثبت‌شده"}),b({label:"میانگین سبد",value:d(a.averageOrder),iconName:"chart",tone:"blue",change:a.averageOrderChange,hint:"تومان"}),b({label:"مشتریان",value:e(a.customers),iconName:"users",tone:"gold",change:a.customersChange,hint:`${e(a.conversionRate)}٪ نرخ تبدیل`})],i=g("div",{class:"stack stack--lg"});i.innerHTML=o`
    <!-- ===================== Charts row ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${t(c("trendingUp",{size:20}))} روند درآمد ۱۴ روز اخیر
          </h2>
          <span class="badge badge--neutral"
            >مجموع
            ${d(f.reduce((s,n)=>s+n.revenue,0))}
            تومان</span
          >
        </div>
        <div data-slot="revenue"></div>
      </section>

      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${t(c("pieChart",{size:20}))} سهم دسته‌بندی‌ها
        </h2>
        <div class="stack" data-slot="mix"></div>
      </section>
    </div>

    <!-- ===================== Status + inventory ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <h2 class="mb-6">
          ${t(c("layers",{size:20}))} وضعیت سفارش‌ها
        </h2>
        <div class="stack" data-slot="statuses"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${t(c("database",{size:20}))} وضعیت انبار
          </h2>
          <a class="btn btn--ghost btn--xs" href="${m("/admin/products")}"
            >مدیریت محصولات</a
          >
        </div>
        <div class="stack" data-slot="inventory"></div>
      </section>
    </div>

    <!-- ===================== Recent orders ===================== -->
    <section class="glass radius-xl p-6">
      <div class="row row--between mb-6">
        <h2 class="mb-0">${t(c("clock",{size:20}))} آخرین سفارش‌ها</h2>
        <a class="btn btn--ghost btn--xs" href="${m("/admin/orders")}"
          >همه سفارش‌ها</a
        >
      </div>
      <div class="table-wrap" data-slot="orders"></div>
    </section>

    <!-- ===================== Attention needed ===================== -->
    <div class="admin-grid admin-grid--2">
      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${t(c("prescription",{size:20}))} نسخه‌های در انتظار
          </h2>
          <a class="btn btn--ghost btn--xs" href="${m("/admin/prescriptions")}"
            >مدیریت نسخه‌ها</a
          >
        </div>
        <div class="stack stack--sm" data-slot="prescriptions"></div>
      </section>

      <section class="glass radius-xl p-6">
        <div class="row row--between mb-6">
          <h2 class="mb-0">
            ${t(c("users",{size:20}))} بخش‌بندی مشتریان
          </h2>
          <a class="btn btn--ghost btn--xs" href="${m("/admin/customers")}"
            >مدیریت مشتریان</a
          >
        </div>
        <div class="stack stack--sm" data-slot="segments"></div>
      </section>
    </div>

    <!-- ===================== Service KPIs ===================== -->
    <section class="glass radius-xl p-6">
      <h2 class="mb-6">
        ${t(c("stethoscope",{size:20}))} شاخص‌های خدمات سلامت
      </h2>
      <div class="auto-grid auto-grid--wide" data-slot="service"></div>
    </section>
  `.toString();const L=r('[data-slot="revenue"]',i),v=Z(f,{valueKey:"revenue",labelKey:"date",height:220,formatValue:s=>d(s)});L.append(v.node);const k=r('[data-slot="mix"]',i);S.length?k.innerHTML=o`
      ${S.map(s=>t(o`
          <div class="mix-row">
            <div class="row row--between">
              <span class="fs-sm fw-semibold">${s.title}</span>
              <span class="fs-sm">${e(s.percent)}٪</span>
            </div>
            ${t(h(s.percent,"brand"))}
            <div class="row row--between fs-xs text-soft">
              <span>${e(s.units)} عدد فروش</span>
              <span>${d(s.revenue)} تومان</span>
            </div>
          </div>
        `))}
    `.toString():k.innerHTML=o`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString();const C=r('[data-slot="statuses"]',i),_=a.orders||1,H=I.map(s=>({...s,count:a.statusCounts[s.id]||0})).filter(s=>s.count>0);C.innerHTML=o`
    ${H.map(s=>t(o`
        <div class="status-row">
          <div class="row row--sm">
            ${t(w(s))}
            <span class="grow"></span>
            <span class="fw-bold fs-sm">${e(s.count)}</span>
            <span class="fs-xs text-soft"
              >${e(Math.round(s.count/_*100))}٪</span
            >
          </div>
          ${t(h(s.count/_*100))}
        </div>
      `))}
  `.toString();const E=r('[data-slot="inventory"]',i),l=a.inventory;E.innerHTML=o`
    <div class="row row--between">
      <span class="fs-sm">تعداد کل محصولات</span>
      <span class="fw-bold">${e(l.total)}</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">مجموع موجودی (عدد)</span>
      <span class="fw-bold">${e(l.totalUnits)}</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">ارزش موجودی انبار</span>
      <span class="fw-bold">${d(l.inventoryValue)} تومان</span>
    </div>
    <div class="row row--between">
      <span class="fs-sm">میانگین امتیاز محصولات</span>
      <span class="fw-bold"
        >${e(l.averageRating.toFixed(2))}</span
      >
    </div>

    <div class="divider"></div>

    ${l.lowStock.length?o`
          <div class="alert alert--warn">
            ${t(c("alert",{size:18}))}
            <span>
              <strong>${e(l.lowStock.length)}</strong>
              محصول موجودی کم دارد.
              <button class="link-like" type="button" data-show-low>
                مشاهده
              </button>
            </span>
          </div>
        `:""}
    ${l.outOfStock.length?o`
          <div class="alert alert--danger">
            ${t(c("x",{size:18}))}
            <span>
              <strong>${e(l.outOfStock.length)}</strong>
              محصول ناموجود است.
              <button class="link-like" type="button" data-show-out>
                مشاهده
              </button>
            </span>
          </div>
        `:""}
  `.toString();const N=r('[data-slot="orders"]',i),R=J().slice(0,6);N.innerHTML=o`
    <table class="table">
      <thead>
        <tr>
          <th scope="col">کد سفارش</th>
          <th scope="col">مشتری</th>
          <th scope="col">تاریخ</th>
          <th scope="col">اقلام</th>
          <th scope="col">مبلغ</th>
          <th scope="col">وضعیت</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        ${R.map(s=>{const n=z("order",s.status);return t(o`
            <tr>
              <td class="fw-semibold">${s.id}</td>
              <td>
                <div class="fs-sm">${s.customerName}</div>
                <span class="fs-xs text-soft">${s.city||"—"}</span>
              </td>
              <td class="fs-sm">${K(s.placedAt)}</td>
              <td>${e(s.itemCount)}</td>
              <td class="fw-semibold">${d(s.total)}</td>
              <td>${t(w(n))}</td>
              <td>
                <button
                  class="btn btn--ghost btn--xs"
                  type="button"
                  data-order-detail="${s.id}"
                >
                  جزئیات
                </button>
              </td>
            </tr>
          `)})}
      </tbody>
    </table>
  `.toString();const T=r('[data-slot="prescriptions"]',i),O=W({status:"submitted"}).slice(0,4);O.length?O.forEach(s=>{const n=g("div",{class:"attention-row"});n.innerHTML=o`
        <span class="attention-row__icon"
          >${t(c("prescription",{size:18}))}</span
        >
        <div class="grow">
          <div class="row row--sm">
            <span class="fw-semibold fs-sm">${s.id}</span>
            ${t(w(z("prescription",s.status)))}
          </div>
          <span class="fs-xs text-soft"
            >${s.customerName} ·
            ${e(s.medicineCount||0)} قلم ·
            ${V(s.submittedAt)}</span
          >
        </div>
        <a class="btn btn--glass btn--xs" href="${m("/admin/prescriptions")}"
          >بررسی</a
        >
      `.toString(),T.append(n)}):T.append(U({iconName:"prescription",title:"نسخه‌ای در انتظار بررسی نیست",compact:!0}).node);const A=r('[data-slot="segments"]',i),P=Math.max(...x.map(s=>s.count),1);A.innerHTML=o`
    ${x.map(s=>t(o`
        <div class="status-row">
          <div class="row row--between">
            <span class="fs-sm">${s.label}</span>
            <span class="fw-bold fs-sm">${e(s.count)}</span>
          </div>
          ${t(h(s.count/P*100,"mint"))}
        </div>
      `))}
  `.toString();const j=r('[data-slot="service"]',i);[{label:"نسخه در انتظار",value:a.prescriptions.pending,icon:"clock",tone:"gold"},{label:"کل نسخه‌ها",value:a.prescriptions.total,icon:"prescription",tone:"brand"},{label:"مشاوره‌ها",value:a.consultations,icon:"stethoscope",tone:"mint"},{label:"مقالات منتشرشده",value:a.articles,icon:"bookmark",tone:"blue"},{label:"کالای ناموجود",value:a.outOfStock,icon:"x",tone:"gold"},{label:"کالای کم‌موجود",value:a.lowStock,icon:"alert",tone:"gold"}].forEach(s=>{const n=g("div",{class:"mini-stat glass radius-lg"});n.innerHTML=o`
      <span class="mini-stat__icon stat__icon--${s.tone}"
        >${t(c(s.icon,{size:18}))}</span
      >
      <span class="mini-stat__value">${e(s.value)}</span>
      <span class="mini-stat__label">${s.label}</span>
    `.toString(),j.append(n)});const y=Y({title:"پیشخوان مدیریت",subtitle:"نمای کلی فروش، سفارش‌ها، انبار و خدمات سلامت دارومیکس.",iconName:"grid",stats:D,content:i}),u=[];return u.push($(i,"click","[data-show-low]",s=>{s.preventDefault();const n=l.lowStock.slice(0,8).map(p=>p.name).join("، ");M.warn(`${e(l.lowStock.length)} کالای کم‌موجود`,n||"برای مشاهده کامل به بخش محصولات بروید.",{duration:6e3})})),u.push($(i,"click","[data-show-out]",s=>{s.preventDefault();const n=l.outOfStock.map(p=>p.name).join("، ");M.error(`${e(l.outOfStock.length)} کالای ناموجود`,n||"برای مشاهده کامل به بخش محصولات بروید.",{duration:6e3})})),u.push($(i,"click","[data-order-detail]",async(s,n)=>{s.preventDefault();const{orderDrawer:p}=await q(()=>import("./_shared-51e7ab10.js"),["./_shared-51e7ab10.js","./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url);p(X(n.dataset.orderDetail))})),{node:y.node,title:"پیشخوان مدیریت",cleanup:()=>{var s;(s=v.cleanup)==null||s.call(v),y.cleanup(),u.forEach(n=>n())}}}export{os as default};

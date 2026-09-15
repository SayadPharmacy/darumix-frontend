import{e as d,aQ as M,aR as S,aS as A,aT as D,au as P,aU as C,am as U,h as e,r as a,I as O,aV as R,i,a8 as z,t as c,j as n,q as p,aW as u,L as b,aF as q,Q as I,aD as V,aE as j,k as Q,aX as W,aY as B,aZ as F,a_ as X,aA as Y,w as y,a$ as Z,A as T}from"./index-c305d6a7.js";import{a as G}from"./prescriptions-311987a1.js";import"./data-f43f95cf.js";const ts=[{path:"/account",label:"پیشخوان",icon:"home"},{path:"/account/orders",label:"سفارش‌های من",icon:"package"},{path:"/account/prescriptions",label:"نسخه‌های من",icon:"prescription"},{path:"/account/reviews",label:"نظرات من",icon:"star"},{path:"/account/notifications",label:"اعلان‌ها",icon:"bell"},{path:"/account/settings",label:"تنظیمات حساب",icon:"sliders"}];async function is(){const o=d("div"),g=[],l=M(),v=S(),m=A(4),f=D(),h=G(),$=P().slice(0,4),w=C().slice(0,4),L=U();o.innerHTML=e`
    <div class="shell">
      ${a(O([{label:"خانه",href:"/"},{label:"حساب کاربری"}]))}

      <!-- ===================== Profile header ===================== -->
      <header class="account-hero glass-2 radius-xl">
        <span class="account-hero__avatar">${R(l.name)}</span>

        <div class="grow">
          <h1 class="account-hero__name">${l.name}</h1>
          <p class="account-hero__meta">
            ${l.phone} ${l.email?e` · ${l.email}`:""}
          </p>
          <div class="row row--sm mt-2">
            <span class="badge badge--brand"
              >${a(i("crown",{size:13}))} عضو از
              ${z(l.joinDate)}</span
            >
            <span class="badge badge--gold"
              >${c(l.loyaltyPoints)} امتیاز باشگاه</span
            >
          </div>
        </div>

        <div class="account-hero__actions">
          <a class="btn btn--glass btn--sm" href="${n("/account/settings")}">
            ${a(i("edit",{size:15}))} ویرایش پروفایل
          </a>
          <a class="btn btn--primary btn--sm" href="${n("/catalog")}">
            ${a(i("bag",{size:15}))} شروع خرید
          </a>
        </div>
      </header>

      <!-- ===================== Money + quick stats ===================== -->
      <div class="auto-grid auto-grid--wide mt-6" data-slot="stats"></div>

      <!-- ===================== Notifications strip ===================== -->
      ${w.length?e`
            <section class="section section--tight">
              <div class="glass radius-xl p-6">
                <div class="row row--between mb-4">
                  <h2 class="mb-0">
                    ${a(i("bell",{size:20}))} آخرین اعلان‌ها
                  </h2>
                  <a
                    class="btn btn--ghost btn--xs"
                    href="${n("/account/notifications")}"
                    >مشاهده همه</a
                  >
                </div>
                <div class="stack stack--sm" data-slot="notifications"></div>
              </div>
            </section>
          `:""}

      <!-- ===================== Orders ===================== -->
      <section class="section">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${a(i("package",{size:20}))} سفارش‌های اخیر
            </h2>
            <a class="btn btn--ghost btn--xs" href="${n("/account/orders")}"
              >همه سفارش‌ها</a
            >
          </div>
          <div class="stack" data-slot="orders"></div>
        </div>
      </section>

      <!-- ===================== Prescriptions ===================== -->
      <section class="section section--tight">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${a(i("prescription",{size:20}))} وضعیت نسخه‌ها
            </h2>
            <a
              class="btn btn--ghost btn--xs"
              href="${n("/account/prescriptions")}"
              >نسخه‌های من</a
            >
          </div>

          <div class="auto-grid auto-grid--tight">
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${c(h.inReview)}</span
              >
              <span class="mini-stat__label">در حال بررسی</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${c(h.approved)}</span
              >
              <span class="mini-stat__label">تأیید شده</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${c(h.ready)}</span
              >
              <span class="mini-stat__label">آماده تحویل</span>
            </div>
            <div class="mini-stat glass radius-lg">
              <span class="mini-stat__value"
                >${c(h.delivered)}</span
              >
              <span class="mini-stat__label">تحویل شده</span>
            </div>
          </div>

          <div class="row mt-4">
            <a class="btn btn--glass btn--sm" href="${n("/prescription")}">
              ${a(i("upload",{size:15}))} ثبت نسخه جدید
            </a>
            <a class="btn btn--glass btn--sm" href="${n("/consultation")}">
              ${a(i("stethoscope",{size:15}))} مشاوره داروساز
            </a>
          </div>
        </div>
      </section>

      <!-- ===================== Wishlist + address ===================== -->
      <div class="split mt-6">
        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${a(i("heart",{size:20}))} علاقه‌مندی‌ها
            </h2>
            <a class="btn btn--ghost btn--xs" href="${n("/wishlist")}"
              >مشاهده همه</a
            >
          </div>
          <div class="stack stack--sm" data-slot="wishlist"></div>
        </div>

        <div class="glass radius-xl p-6">
          <div class="row row--between mb-4">
            <h2 class="mb-0">
              ${a(i("marker",{size:20}))} نشانی‌های من
            </h2>
            <button
              class="btn btn--ghost btn--xs"
              type="button"
              data-goto-settings
            >
              مدیریت
            </button>
          </div>
          <div class="stack stack--sm" data-slot="addresses"></div>
        </div>
      </div>

      <!-- ===================== Shortcuts ===================== -->
      <section class="section">
        <h2 class="section-head__title mb-4" style="padding-inline:0">
          دسترسی سریع
        </h2>
        <div class="auto-grid auto-grid--tight" data-slot="shortcuts"></div>
      </section>
    </div>
  `.toString();const N=p('[data-slot="stats"]',o);[u({label:"سفارش ثبت‌شده",value:c(f.length),iconName:"package",tone:"brand",hint:"در این حساب محلی"}),u({label:"مجموع خرید",value:b(v.spent,{withUnit:!1}),iconName:"currency",tone:"mint",hint:"بر اساس سفارش‌های شما"}),u({label:"اعتبار کیف پول",value:b(v.wallet,{withUnit:!1}),iconName:"wallet",tone:"gold",hint:"قابل استفاده در خرید بعدی"}),u({label:"امتیاز باشگاه",value:c(v.points),iconName:"crown",tone:"blue",hint:"با هر خرید بیشتر می‌شود"})].forEach(s=>N.append(s));const _=p('[data-slot="notifications"]',o);_&&w.forEach(s=>{const t=d("a",{class:`notification${s.read?"":" is-unread"}`,href:s.href||n("/account/notifications")});t.innerHTML=e`
        <span class="notification__dot" aria-hidden="true"></span>
        <span class="grow">
          <span class="notification__title">${s.title}</span>
          <span class="notification__text clamp-2">${s.text}</span>
        </span>
        <span class="fs-xs text-soft"
          >${q(s.createdAt)}</span
        >
      `.toString(),_.append(t)});const x=p('[data-slot="orders"]',o);m.length?m.forEach(s=>{const t=V("order",s.status),r=d("article",{class:"record-card glass radius-lg"});r.innerHTML=e`
        <div class="record-card__head">
          <div>
            <div class="row row--sm">
              <strong class="fs-sm">${s.id}</strong>
              ${a(j(t))}
              ${s.demo?e`<span class="badge badge--neutral">نمونه نمایشی</span>`:""}
            </div>
            <span class="fs-xs text-soft"
              >${z(s.placedAt)} ·
              ${c(s.itemCount)} قلم</span
            >
          </div>
          <div style="text-align:end">
            <div class="fw-bold">${b(s.total)}</div>
            <span class="fs-xs text-soft">${s.city||""}</span>
          </div>
        </div>

        <div class="row mt-3">
          <a
            class="btn btn--glass btn--xs"
            href="${n(`/account/order/${s.id}`)}"
          >
            ${a(i("eye",{size:14}))} جزئیات سفارش
          </a>
          <button
            class="btn btn--ghost btn--xs"
            type="button"
            data-reorder="${s.id}"
          >
            ${a(i("rotate",{size:14}))} خرید مجدد
          </button>
        </div>
      `.toString(),x.append(r)}):x.append(I({iconName:"package",title:"هنوز سفارشی ثبت نکرده‌اید",text:"اولین سفارش خود را ثبت کنید تا وضعیت آن را اینجا پیگیری کنید.",compact:!0,action:{label:"شروع خرید",variant:"btn--primary",href:"/catalog"}}).node);const k=p('[data-slot="wishlist"]',o);$.length?$.forEach(s=>{const t=d("a",{class:"mini-product",href:n(`/product/${s.slug}`)});t.innerHTML=e`
        <span class="mini-product__media">${a(Q(s))}</span>
        <span class="grow">
          <span class="mini-product__title clamp-1">${s.name}</span>
          <span class="fs-xs text-soft">${s.brandName}</span>
        </span>
        <span class="fw-bold fs-sm"
          >${b(s.price,{withUnit:!1})}</span
        >
      `.toString(),k.append(t)}):k.innerHTML=e`
      <p class="text-muted fs-sm mb-0">
        هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.
      </p>
    `.toString();const E=p('[data-slot="addresses"]',o);L.slice(0,2).forEach(s=>{const t=d("div",{class:"address-mini glass radius-lg"});t.innerHTML=e`
      <div class="row row--sm">
        <span class="fw-bold fs-sm">${s.title}</span>
        ${s.isDefault?e`<span class="badge badge--brand">پیش‌فرض</span>`:""}
      </div>
      <p class="fs-xs text-muted mb-0 mt-2">
        ${s.province}، ${s.city}، ${s.line1}
      </p>
      <span class="fs-xs text-soft"
        >${s.recipient} — ${s.phone}</span
      >
    `.toString(),E.append(t)});const H=p('[data-slot="shortcuts"]',o);return[{path:"/account/orders",label:"سفارش‌های من",icon:"package",count:f.length},{path:"/account/prescriptions",label:"نسخه‌های من",icon:"prescription",count:S().prescriptions},{path:"/account/reviews",label:"نظرات من",icon:"star",count:W().length},{path:"/account/notifications",label:"اعلان‌ها",icon:"bell",count:B()},{path:"/wishlist",label:"علاقه‌مندی‌ها",icon:"heart",count:F().length},{path:"/compare",label:"مقایسه محصولات",icon:"scale",count:X().length},{path:"/recently-viewed",label:"بازدیدهای اخیر",icon:"history",count:Y().length},{path:"/account/settings",label:"تنظیمات حساب",icon:"sliders"}].forEach(s=>{const t=d("a",{class:"shortcut glass radius-lg",href:n(s.path)});t.innerHTML=e`
      <span class="shortcut__icon">${a(i(s.icon,{size:20}))}</span>
      <span class="grow">
        <span class="shortcut__label">${s.label}</span>
        ${s.count!=null?e`<span class="fs-xs text-soft"
              >${c(s.count)} مورد</span
            >`:""}
      </span>
      ${a(i("chevronLeft",{size:16}))}
    `.toString(),H.append(t)}),g.push(y(o,"click","[data-reorder]",(s,t)=>{s.preventDefault();const r=Z(t.dataset.reorder);r.added&&T.success("کالاها به سبد اضافه شد",`${c(r.added)} محصول از این سفارش به سبد خرید اضافه شد.`,{action:{label:"مشاهده سبد",onClick:()=>{window.location.hash=n("/cart").slice(1)}}}),r.skipped&&T.warn("برخی کالاها اضافه نشدند",`${c(r.skipped)} محصول در حال حاضر ناموجود است.`)})),g.push(y(o,"click","[data-goto-settings]",s=>{s.preventDefault(),window.location.hash=n("/account/settings").slice(1)})),{node:o,title:"حساب کاربری",cleanup:()=>g.forEach(s=>s())}}export{ts as ACCOUNT_NAV,is as default};

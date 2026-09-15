import{e as y,aM as D,h as l,r as e,I as L,q as g,Q as H,v as I,aN as N,aL as O,a as R,j as _,i as o,a8 as C,aK as z,t as x,u as S,s as V,aO as b,A as v,w as P,aP as W}from"./index-c305d6a7.js";import"./data-f43f95cf.js";async function B({params:E={}}){const i=y("div"),u=[],s=D(E.slug);if(!s)return i.innerHTML=l`
      <div class="shell">
        ${e(L([{label:"خانه",href:"/"},{label:"مجله سلامت",href:"/magazine"},{label:"مقاله یافت نشد"}]))}
        <div data-slot="missing" class="mt-8"></div>
      </div>
    `.toString(),g('[data-slot="missing"]',i).append(H({iconName:"bookmark",title:"این مقاله پیدا نشد",text:"مکن است این مقاله حذف شده یا نشانی آن تغییر کرده باشد.",action:{label:"بازگشت به مجله",variant:"btn--primary",href:"/magazine"}}).node),{node:i,title:"مقاله یافت نشد",cleanup:()=>{}};const r=I().find(a=>a.id===s.tag),M=N(s,3),T=O(s),h=s.body||[],f=R().filter(a=>{var t;return((t=a.tags)==null?void 0:t.includes(s.tag))||a.featured}).slice(0,4);i.innerHTML=l`
    <div class="shell">
      ${e(L([{label:"خانه",href:"/"},{label:"مجله سلامت",href:"/magazine"},{label:s.title}]))}

      <article class="article">
        <header class="article__header">
          ${r?l`<a
                class="badge badge--brand"
                href="${_("/magazine",{tag:r.id})}"
                >${r.title}</a
              >`:""}

          <h1 class="article__title">${s.title}</h1>
          <p class="article__lead">${s.excerpt}</p>

          <div class="article__meta">
            <span class="article__author">
              <span class="article__avatar"
                >${e(o("user",{size:18}))}</span
              >
              <span>
                <span class="fw-semibold">${s.author}</span>
                <span class="fs-xs text-soft"
                  >${s.authorRole||"کارشناس سلامت"}</span
                >
              </span>
            </span>

            <span class="article__meta-item"
              >${e(o("calendar",{size:15}))}
              ${C(s.date)}</span
            >
            <span class="article__meta-item"
              >${e(o("clock",{size:15}))}
              ${z(s)}</span
            >
            <span class="article__meta-item"
              >${e(o("eye",{size:15}))} ${x(T.views)}
              بازدید</span
            >
          </div>
        </header>

        <div class="article__cover glass radius-xl">
          ${e(S(s))}
        </div>

        <div class="article-layout">
          <!-- ===================== Body ===================== -->
          <div class="article__body prose" data-slot="body"></div>

          <!-- ===================== Aside ===================== -->
          <aside class="article__aside">
            <div class="glass radius-xl p-6">
              <h3 class="mb-4">خلاصه مقاله</h3>
              <div class="stack stack--sm fs-sm">
                <div class="summary-row">
                  <span>موضوع</span>
                  <span>${(r==null?void 0:r.title)||"سلامت"}</span>
                </div>
                <div class="summary-row">
                  <span>زمان مطالعه</span>
                  <span>${x(s.readingMinutes)} دقیقه</span>
                </div>
                <div class="summary-row">
                  <span>نویسنده</span>
                  <span>${s.author}</span>
                </div>
              </div>

              <div class="row row--sm mt-4">
                <button
                  class="btn btn--glass btn--sm grow"
                  type="button"
                  data-copy-link
                >
                  ${e(o("copy",{size:15}))} کپی لینک
                </button>
                <button
                  class="btn btn--glass btn--sm grow"
                  type="button"
                  data-bookmark
                >
                  ${e(o("bookmark",{size:15}))} ذخیره
                </button>
              </div>
            </div>

            <div class="glass radius-xl p-6">
              <h3 class="mb-4">مقالات مرتبط</h3>
              <div class="stack stack--sm" data-slot="related"></div>
            </div>
          </aside>
        </div>
      </article>

      <!-- ===================== Suggested products ===================== -->
      ${f.length?l`
            <section class="section">
              <div class="shell">
                ${e(V({title:"محصولات مرتبط با این مقاله",subtitle:"اگر پس از خواندن این مقاله به خرید فکر می‌کنید، این‌ها را ببینید.",iconName:"bag",actionHref:"/catalog",actionLabel:"فروشگاه"}))}
                <div class="auto-grid" data-slot="products"></div>
              </div>
            </section>
          `:""}

      <!-- ===================== Medical disclaimer ===================== -->
      <section class="section section--tight">
        <div class="alert alert--info">
          ${e(o("info",{size:18}))}
          <span
            >این مطلب جنبه آموزشی دارد و جایگزین تشخیص یا توصیه پزشک نیست. پیش
            از تغییر رژیم دارویی خود با پزشک یا داروساز مشورت کنید.</span
          >
        </div>
      </section>
    </div>
  `.toString();const $=g('[data-slot="body"]',i);h.length?$.innerHTML=h.map(a=>typeof a=="string"&&a.startsWith("## ")?l`<h2>${a.slice(3)}</h2>`.toString():l`<p>${a}</p>`.toString()).join(""):$.innerHTML=l`<p class="text-muted">
      متن این مقاله در دسترس نیست.
    </p>`.toString();const A=g('[data-slot="related"]',i);M.forEach(a=>{const t=y("a",{class:"mini-article",href:_(`/magazine/${a.slug}`)});t.innerHTML=l`
      <span class="mini-article__media">${e(S(a))}</span>
      <span class="grow">
        <span class="mini-article__title clamp-2">${a.title}</span>
        <span class="fs-xs text-soft">${z(a)}</span>
      </span>
    `.toString(),A.append(t)});const k=g('[data-slot="products"]',i);if(k){const{productCard:a}=await b(()=>import("./index-c305d6a7.js").then(n=>n.bP),["./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url),t=await b(()=>import("./index-c305d6a7.js").then(n=>n.bM),["./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url),d=await b(()=>import("./index-c305d6a7.js").then(n=>n.bN),["./index-c305d6a7.js","./data-f43f95cf.js","./index-b3ae5bcb.css"],import.meta.url);f.forEach(n=>{const w=a(n,{onAdd:async p=>{const c=t.add(p.id,1);return!c.ok&&c.reason==="out-of-stock"&&v.error("این محصول موجود نیست",p.name),c},actions:{onWishlist:(p,c)=>{const m=d.toggleWishlist(p.id);c.classList.toggle("is-active",m)},onCompare:(p,c)=>{const m=d.toggleCompare(p.id);if(!m.ok){v.warn("مقایسه محدود است",m.reason);return}c.classList.toggle("is-active",m.added)}}});k.append(w.node),u.push(w.cleanup)})}return u.push(P(i,"click","[data-copy-link]",async a=>{a.preventDefault();const t=`${window.location.origin}${window.location.pathname}${_(`/magazine/${s.slug}`)}`,d=await W(t);v[d?"success":"error"](d?"لینک کپی شد":"کپی نشد",d?"می‌توانید لینک مقاله را برای دیگران بفرستید.":"مرورگر اجازه کپی نداد.")})),u.push(P(i,"click","[data-bookmark]",(a,t)=>{a.preventDefault(),t.classList.toggle("is-active"),v.success(t.classList.contains("is-active")?"مقاله ذخیره شد":"از ذخیره‌ها حذف شد",s.title)})),{node:i,title:s.title,cleanup:()=>u.forEach(a=>a())}}export{B as default};

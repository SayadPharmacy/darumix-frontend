import{e as l,M as T,a as k,h as c,r as i,I as m,i as h,t as S,j as g,q as p,Q as E,Z as z,b as I,p as A,_ as B,s as f,$ as N,o as P,L as y,G as _,w as D,x as G,B as U,A as L,y as W,z as q,D as j}from"./index-c305d6a7.js";import"./data-f43f95cf.js";function Q(){return{onAdd:async e=>{const a=U(e.id,1);return!a.ok&&a.reason==="out-of-stock"&&L.error("این محصول موجود نیست",e.name),a},actions:{onWishlist:(e,a)=>{const s=W(e.id);a.classList.toggle("is-active",s),a.setAttribute("aria-pressed",String(s))},onCompare:(e,a)=>{const s=q(e.id);if(!s.ok){L.warn("مقایسه محدود است",s.reason);return}a.classList.toggle("is-active",s.added)}}}}function x(e){const a=l("div",{class:"product-grid"}),s=[];return e.forEach(d=>{const o=G(d,Q());a.append(o.node),s.push(o.cleanup)}),{node:a,disposers:s}}function Z(e){const a=l("a",{class:"category-card glass radius-xl",href:g(`/category/${e.id}`)});return a.innerHTML=c`
    <span class="category-card__icon"
      >${i(h(e.icon,{size:30}))}</span
    >
    <h3 class="category-card__name">${e.title}</h3>
    <span class="category-card__count"
      >${S(e.productCount)} محصول</span
    >
    <span class="category-card__subs">
      ${(e.subcategories||[]).slice(0,3).map(s=>i(c`<span class="category-card__sub">${s.title}</span>`))}
    </span>
  `.toString(),a}async function K({params:e={}}){const a=l("div"),s=[],d=e.id||"",o=d?T(d):null;if(d&&o){const t=k().filter(r=>r.categoryId===o.id),n=o.subcategories||[],u=x(t);return s.push(...u.disposers),a.innerHTML=c`
      <div class="shell">
        ${i(m([{label:"خانه",href:"/"},{label:"دسته‌بندی‌ها",href:"/categories"},{label:o.title}]))}

        <header class="page-intro">
          <div class="row">
            <span class="category-card__icon"
              >${i(h(o.icon,{size:30}))}</span
            >
            <div>
              <h1 class="page-intro__title">${o.title}</h1>
              <p class="page-intro__text">${o.description}</p>
            </div>
          </div>
        </header>

        <div class="catalog-toolbar glass radius-lg">
          <span
            >${S(t.length)} محصول در این دسته‌بندی</span
          >
          <a
            class="btn btn--glass btn--sm"
            href="${g("/catalog",{category:o.id})}"
          >
            ${i(h("filter",{size:15}))} فیلتر و مرتب‌سازی
          </a>
        </div>

        ${n.length?c`
              <div class="chip-row mt-4" data-slot="subs">
                <span class="fs-xs text-soft">زیرشاخه‌ها:</span>
                ${n.map(r=>i(c`<a
                      class="chip"
                      href="${g("/catalog",{category:o.id,sub:r.id})}"
                      >${r.title}</a
                    >`))}
              </div>
            `:""}

        <div class="mt-6" data-slot="grid"></div>
      </div>
    `.toString(),p('[data-slot="grid"]',a).append(t.length?u.node:E({iconName:"package",title:"این دسته هنوز محصولی ندارد",text:"به‌زودی محصولات این دسته‌بندی اضافه می‌شوند. تا آن زمان می‌توانید فروشگاه را ببینید.",action:{label:"مشاهده فروشگاه",variant:"btn--primary",href:"/catalog"}}).node),{node:a,title:o.title,cleanup:()=>s.forEach(r=>r())}}const H=z(),w=I().filter(t=>t.featured),C=A(4),b=x(C);s.push(...b.disposers),a.innerHTML=c`
    <div class="shell">
      ${i(m([{label:"خانه",href:"/"},{label:"دسته‌بندی‌ها"}]))}
      ${i(B({title:"دسته‌بندی محصولات",text:"همه محصولات دارومیکس در گروه‌های اصلی دارو، مکمل، مراقبت شخصی و تجهیزات پزشکی دسته‌بندی شده‌اند."}))}

      <div data-slot="groups"></div>

      <section class="section">
        ${i(f({title:"برندهای منتخب",subtitle:"برای مشاهده محصولات هر برند روی آن بزنید.",iconName:"verified",actionHref:"/catalog",actionLabel:"همه برندها"}))}
        <div class="auto-grid auto-grid--tight" data-slot="brands"></div>
      </section>

      <section class="section">
        ${i(f({title:"پرفروش‌ترین‌ها",subtitle:"انتخاب بیشترین تعداد مشتریان دارومیکس.",iconName:"trendingUp",actionHref:"/catalog?sort=popular",actionLabel:"مشاهده بیشتر"}))}
        <div data-slot="popular"></div>
      </section>
    </div>
  `.toString();const v=p('[data-slot="groups"]',a);H.forEach(t=>{const n=l("section",{class:"section"});n.innerHTML=c`
      ${i(f({title:t.title,subtitle:t.description,iconName:t.icon}))}
      <div class="auto-grid auto-grid--tight" data-slot="grid"></div>
    `.toString();const u=p('[data-slot="grid"]',n);t.categories.forEach(r=>u.append(Z({...r,productCount:N()[r.id]||0}))),v.append(n)});const M=p('[data-slot="brands"]',a);w.forEach(t=>{const n=l("a",{class:"brand-tile glass radius-lg",href:g("/catalog",{brand:t.id})});n.innerHTML=c`
      ${i(P(t))}
      <span>${t.name}</span>
      <span class="fs-xs text-soft">${t.country}</span>
    `.toString(),M.append(n)}),p('[data-slot="popular"]',a).append(b.node);const $=l("div",{class:"row mt-4"});return $.innerHTML=c`
    <a class="btn btn--glass btn--sm" href="${g("/catalog")}">
      ${i(h("grid",{size:16}))} مشاهده همه محصولات
    </a>
    <button class="btn btn--ghost btn--sm" type="button" data-price-range>
      بازه قیمت:
      ${y(_().min,{withUnit:!1})} تا
      ${y(_().max,{withUnit:!1})}
      تومان
    </button>
  `.toString(),v.append($),s.push(D(a,"click","[data-price-range]",t=>{t.preventDefault(),j("/catalog")})),{node:a,title:"دسته‌بندی‌ها",cleanup:()=>s.forEach(t=>t())}}export{K as default};

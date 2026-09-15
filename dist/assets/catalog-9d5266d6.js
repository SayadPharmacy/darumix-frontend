import{e as g,a as Z,F as G,G as aa,H as ta,h as l,r as i,I as ea,t as f,i as r,S as sa,q as $,J as ia,w as v,K as la,c as na,L as y,b as ca,M as ra,N as oa,O as da,P as pa,D as L,Q as ua,R as I,T as ga,x as ba,U as ha,V as fa,y as E,z as va,A as P,B as ma,W,X as $a,Y as ka,C as _a}from"./index-c305d6a7.js";import"./data-f43f95cf.js";async function Sa({query:M={}}){const u=g("div"),o=[],j=Z(),n=G(M),b=aa(),z=ta(),U=a=>({onWishlist:(t,e)=>{const s=E(t.id);e.classList.toggle("is-active",s),e.setAttribute("aria-pressed",String(s))},onCompare:(t,e)=>{const s=va(t.id);if(!s.ok){P.warn("مقایسه محدود است",s.reason);return}e.classList.toggle("is-active",s.added)}}),C=async a=>{const t=ma(a.id,1);return!t.ok&&t.reason==="out-of-stock"&&P.error("این محصول موجود نیست",a.name),t};u.innerHTML=l`
    <div class="shell">
      ${i(ea([{label:"خانه",href:"/"},{label:"فروشگاه"}]))}

      <header class="page-intro">
        <h1 class="page-intro__title">فروشگاه دارومیکس</h1>
        <p class="page-intro__text">
          ${f(j.length)} محصول سلامت در دسته‌بندی‌های
          دارو، مکمل، مراقبت پوست، مادر و کودک و تجهیزات پزشکی. با فیلترها
          دقیقاً همان چیزی را پیدا کنید که لازم دارید.
        </p>
      </header>

      <div class="catalog-layout">
        <aside
          class="catalog-aside"
          data-slot="sidebar"
          aria-label="فیلترها"
        ></aside>

        <div>
          <div class="catalog-toolbar glass radius-lg">
            <div class="catalog-toolbar__count" data-slot="count"></div>

            <div class="catalog-toolbar__end">
              <button
                class="btn btn--glass btn--sm hide-desktop"
                type="button"
                data-open-filters
              >
                ${i(r("filter",{size:16}))} فیلترها
                <span class="badge badge--brand" data-slot="filter-count" hidden
                  >۰</span
                >
              </button>

              <label class="visually-hidden" for="catalog-sort"
                >ترتیب نمایش</label
              >
              <select
                class="select"
                id="catalog-sort"
                data-sort
                style="min-width:150px"
              >
                ${sa.map(a=>i(l`<option
                      value="${a.id}"
                      ${a.id===n.sort?"selected":""}
                    >
                      ${a.label}
                    </option>`))}
              </select>

              <div
                class="btn-group hide-mobile"
                role="group"
                aria-label="حالت نمایش"
              >
                <button
                  class="btn-group__item ${n.view==="grid"?"is-active":""}"
                  type="button"
                  data-view="grid"
                  aria-label="نمایش شبکه‌ای"
                >
                  ${i(r("grid",{size:16}))}
                </button>
                <button
                  class="btn-group__item ${n.view==="list"?"is-active":""}"
                  type="button"
                  data-view="list"
                  aria-label="نمایش فهرستی"
                >
                  ${i(r("menu",{size:16}))}
                </button>
              </div>
            </div>
          </div>

          <div class="active-filters" data-slot="active-filters"></div>
          <div data-slot="results"></div>
          <div data-slot="pagination"></div>
        </div>
      </div>
    </div>
  `.toString();const _=$('[data-slot="sidebar"]',u),k=$('[data-slot="results"]',u),x=$('[data-slot="pagination"]',u),J=$('[data-slot="count"]',u),H=$('[data-slot="active-filters"]',u),q=$('[data-slot="filter-count"]',u);function Q(){const a=g("div",{class:"stack"}),t=g("div",{class:"filter-group glass radius-lg"});t.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("search",{size:17}))} جستجو
        </h3>
      </div>
      <div class="input-icon">
        ${i(r("search",{size:17}))}
        <input
          class="input"
          type="search"
          placeholder="نام محصول یا برند…"
          value="${n.q}"
          data-filter="q"
          aria-label="جستجو در محصولات"
        />
      </div>
    `.toString(),a.append(t);const e=g("div",{class:"filter-group glass radius-lg"});e.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("layers",{size:17}))} دسته‌بندی
        </h3>
        ${n.categories.length?i(l`<button
                class="filter-group__reset"
                type="button"
                data-reset="category"
              >
                پاک کردن
              </button>`):""}
      </div>
      <div class="filter-list">
        ${na().filter(c=>c.productCount>0).map(c=>{const F=n.categories.includes(c.id),N=c.subcategories||[];return i(l`
              <div>
                <label class="check">
                  <input
                    type="checkbox"
                    data-filter="category"
                    value="${c.id}"
                    ${F?"checked":""}
                  />
                  <span class="check__box"
                    >${i(r("check",{size:13}))}</span
                  >
                  <span class="check__text">
                    ${c.title}
                    <span class="check__meta"
                      >${f(c.productCount)} محصول</span
                    >
                  </span>
                </label>

                ${F&&N.length?l`
                      <div
                        class="stack stack--sm"
                        style="padding-inline-start:32px;margin-top:10px"
                      >
                        ${N.map(T=>i(l`
                            <label class="check">
                              <input
                                type="checkbox"
                                data-filter="sub"
                                value="${T.id}"
                                ${n.subcategories.includes(T.id)?"checked":""}
                              />
                              <span class="check__box"
                                >${i(r("check",{size:12}))}</span
                              >
                              <span class="check__text fs-sm"
                                >${T.title}</span
                              >
                            </label>
                          `))}
                      </div>
                    `:""}
              </div>
            `)})}
      </div>
    `.toString(),a.append(e);const s=g("div",{class:"filter-group glass radius-lg"});s.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("currency",{size:17}))} محدوده قیمت
        </h3>
      </div>

      <div class="stack stack--sm">
        <input
          class="range"
          type="range"
          min="${b.min}"
          max="${b.max}"
          step="10000"
          value="${n.maxPrice}"
          data-filter="max"
          aria-label="حداکثر قیمت"
        />
        <div class="price-inputs">
          <label class="visually-hidden" for="price-min">از قیمت</label>
          <input
            class="input"
            id="price-min"
            type="number"
            inputmode="numeric"
            min="${b.min}"
            max="${b.max}"
            value="${n.minPrice}"
            data-filter="min"
          />

          <span class="text-soft">—</span>

          <label class="visually-hidden" for="price-max">تا قیمت</label>
          <input
            class="input"
            id="price-max"
            type="number"
            inputmode="numeric"
            min="${b.min}"
            max="${b.max}"
            value="${n.maxPrice}"
            data-filter="max-number"
          />
        </div>
        <p class="fs-xs text-soft mb-0">
          بازه قیمت: ${y(b.min)} تا ${y(b.max)}
        </p>
      </div>
    `.toString(),a.append(s);const p=g("div",{class:"filter-group glass radius-lg"}),m=ca().filter(c=>(z.byBrand.get(c.id)||0)>0);p.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("verified",{size:17}))} برند
        </h3>
        ${n.brands.length?i(l`<button
                class="filter-group__reset"
                type="button"
                data-reset="brand"
              >
                پاک کردن
              </button>`):""}
      </div>
      <div class="filter-list">
        ${m.map(c=>i(l`
            <label class="check">
              <input
                type="checkbox"
                data-filter="brand"
                value="${c.id}"
                ${n.brands.includes(c.id)?"checked":""}
              />
              <span class="check__box"
                >${i(r("check",{size:13}))}</span
              >
              <span class="check__text">
                ${c.name}
                <span class="check__meta"
                  >${f(z.byBrand.get(c.id)||0)}
                  محصول</span
                >
              </span>
            </label>
          `))}
      </div>
    `.toString(),a.append(p);const R=g("div",{class:"filter-group glass radius-lg"});R.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("star",{size:17}))} امتیاز
        </h3>
      </div>
      <div class="stack stack--sm">
        ${[0,3,4,4.5].map(c=>i(l`
            <label class="check check--radio">
              <input
                type="radio"
                name="minRating"
                data-filter="rating"
                value="${c}"
                ${n.minRating===c?"checked":""}
              />
              <span class="check__box"></span>
              <span class="check__text"
                >${c===0?"همه امتیازها":`${f(c)} ستاره و بالاتر`}</span
              >
            </label>
          `))}
      </div>
    `.toString(),a.append(R);const A=g("div",{class:"filter-group glass radius-lg"});A.innerHTML=l`
      <div class="filter-group__head">
        <h3 class="filter-group__title">
          ${i(r("sliders",{size:17}))} فیلترهای سریع
        </h3>
      </div>
      <div class="stack">
        <label class="switch">
          <input
            type="checkbox"
            data-filter="stock"
            ${n.inStockOnly?"checked":""}
          />
          <span class="switch__track"></span>
          <span>فقط کالای موجود</span>
        </label>
        <label class="switch">
          <input
            type="checkbox"
            data-filter="sale"
            ${n.onSaleOnly?"checked":""}
          />
          <span class="switch__track"></span>
          <span>فقط کالاهای تخفیف‌دار</span>
        </label>
      </div>
    `.toString(),a.append(A);const B=g("button",{class:"btn btn--glass btn--block",type:"button","data-reset-all":""});return B.innerHTML=l`${i(r("rotate",{size:16}))} حذف همه
    فیلترها`.toString(),a.append(B),a}function V(a){const t=[];if(a.q&&t.push({label:`جستجو: ${a.q}`,clear:{q:null}}),a.categories.forEach(e=>{const s=ra(e);s&&t.push({label:s.title,clear:{category:a.categories.filter(p=>p!==e).join(",")}})}),a.subcategories.forEach(e=>{const p=oa(a.categories[0]||"").find(m=>m.id===e);p&&t.push({label:p.title,clear:{sub:a.subcategories.filter(m=>m!==e).join(",")}})}),a.brands.forEach(e=>{const s=da(e);s&&t.push({label:s.name,clear:{brand:a.brands.filter(p=>p!==e).join(",")}})}),a.inStockOnly&&t.push({label:"فقط موجود",clear:{stock:null}}),a.onSaleOnly&&t.push({label:"فقط تخفیف‌دار",clear:{sale:null}}),a.minRating>0&&t.push({label:`امتیاز ${f(a.minRating)}+`,clear:{rating:null}}),(a.minPrice>b.min||a.maxPrice<b.max)&&t.push({label:`قیمت ${y(a.minPrice,{withUnit:!1})} تا ${y(a.maxPrice,{withUnit:!1})}`,clear:{min:null,max:null}}),!t.length){H.innerHTML="";return}H.innerHTML=l`
      <span class="fs-xs text-soft">فیلترهای فعال:</span>
      ${t.map(e=>i(l`
          <button
            class="chip is-active"
            type="button"
            data-clear="${JSON.stringify(e.clear).replace(/"/g,"&quot;")}"
          >
            ${e.label}
            <span class="chip__remove"
              >${i(r("close",{size:11}))}</span
            >
          </button>
        `))}
      <button
        class="btn btn--ghost btn--xs text-danger"
        type="button"
        data-reset-all
      >
        حذف همه
      </button>
    `.toString()}function K(a){const t=pa(a);if(t.total>0&&a.page>t.pages&&L("/catalog",{...M,page:t.pages},{replace:!0}),J.innerHTML=l`
      ${t.total>0?l`نمایش
            <strong
              >${f((t.page-1)*t.perPage+1)}</strong
            >
            تا
            <strong
              >${f(Math.min(t.page*t.perPage,t.total))}</strong
            >
            از <strong>${f(t.total)}</strong> محصول`:"محصولی مطابق فیلترها یافت نشد"}
    `.toString(),t.total===0){k.innerHTML="";const e=ua({iconName:"search",title:"محصولی با این مشخصات پیدا نشد",text:I(a)?"فیلترها را تغییر دهید یا همه آن‌ها را حذف کنید تا نتایج بیشتری ببینید.":"به نظر می‌رسد این بخش هنوز محصولی ندارد.",action:I(a)?{label:"حذف همه فیلترها",variant:"btn--primary",onClick:()=>L("/catalog",{})}:{label:"بازگشت به خانه",variant:"btn--primary",href:"/"}});k.append(e.node),x.innerHTML="";return}if(a.view==="list"){const e=g("div",{class:"stack"});t.items.forEach(s=>{const p=ga(s,{metaContent:l`
            <div class="row row--sm mt-2">
              ${i(r("checkCircle",{size:14}))}
              <span class="fs-xs text-soft"
                >${s.categoryTitle}${s.subcategoryTitle?` · ${s.subcategoryTitle}`:""}</span
              >
            </div>
          `,endContent:l`
            <div class="stack stack--sm" style="justify-items:end">
              ${i(l`<span class="price">
                  <span class="price__now"
                    >${y(s.price,{withUnit:!1})}</span
                  >
                  <span class="price__unit">تومان</span>
                  ${s.discount?l`<span class="price__off"
                        >${f(s.discount)}٪</span
                      >`:""}
                </span>`)}
              <div class="row row--sm">
                <button
                  class="btn btn--glass btn--sm"
                  type="button"
                  data-row-wishlist="${s.id}"
                >
                  ${i(r("heart",{size:15}))} علاقه‌مندی
                </button>
                <button
                  class="btn btn--primary btn--sm"
                  type="button"
                  data-row-add="${s.id}"
                  ${s.stock<=0?"disabled":""}
                >
                  ${i(r("cart",{size:15}))}
                  ${s.stock<=0?"ناموجود":"افزودن"}
                </button>
              </div>
            </div>
          `});e.append(p.node)}),k.innerHTML="",k.append(e)}else{const e=g("div",{class:"product-grid"});t.items.forEach(s=>{e.append(ba(s,{onAdd:C,actions:U()}).node)}),k.innerHTML="",k.append(e)}if(x.innerHTML="",t.pages>1){const e=ha({page:t.page,pages:t.pages,onChange:s=>{W({page:String(s)},{resetPage:!1}),X()}});x.append(e.node),o.push(e.cleanup)}}function X(){const a=$(".catalog-toolbar",u);if(a){const t=window.matchMedia("(prefers-reduced-motion: reduce)").matches;a.scrollIntoView({behavior:t?"auto":"smooth",block:"start"})}}function d(a,t={}){W(a,t)}function w(a,t,e){const s=n[a],p=e?[...s,t]:s.filter(m=>m!==t);d({[a]:p.join(",")})}_.append(Q());const S=ia({title:"فیلترها",side:"start"});S.body.append(_),o.push(S.cleanup,()=>_.parentNode!==u&&O());function O(){const a=u.querySelector(".catalog-aside");a&&_.parentNode!==a&&a.append(_)}V(n),K(n);const D=(()=>{const a=G(fa().query);return a.categories.length+a.subcategories.length+a.brands.length+(a.inStockOnly?1:0)+(a.onSaleOnly?1:0)+(a.minRating?1:0)})();D>0&&(q.hidden=!1,q.textContent=f(D));const h=u;o.push(v(h,"change","[data-filter]",(a,t)=>{switch(t.dataset.filter){case"category":w("categories",t.value,t.checked),d({sub:null},{replace:!1});break;case"sub":w("subcategories",t.value,t.checked);break;case"brand":w("brands",t.value,t.checked);break;case"rating":d({rating:t.value==="0"?null:t.value});break;case"stock":d({stock:t.checked?"1":null});break;case"sale":d({sale:t.checked?"1":null});break;case"max":{const s=Math.max(n.minPrice,Number(t.value));d({max:String(s)});break}}}));const Y=$a(a=>{const t=a.dataset.filter;if(t==="q"){const e=a.value.trim();e.length>=2&&_a(e),d({q:e||null})}else t==="min"?d({min:a.value}):t==="max-number"&&d({max:a.value})},420);return o.push(la(h,"input",a=>{const t=a.target.closest("[data-filter]");if(!t)return;const e=t.dataset.filter;["q","min","max-number"].includes(e)&&Y(t)})),o.push(v(h,"click","[data-clear]",(a,t)=>{a.preventDefault();try{d(JSON.parse(t.dataset.clear.replace(/&quot;/g,'"')))}catch{}})),o.push(v(h,"click","[data-reset]",(a,t)=>{a.preventDefault();const e=t.dataset.reset,s=e==="category"?{category:null,sub:null}:e==="brand"?{brand:null}:{[e]:null};d(s)})),o.push(v(h,"click","[data-reset-all]",a=>{a.preventDefault(),L("/catalog",n.view==="grid"?{}:{view:"list"})})),o.push(v(h,"change","[data-sort]",(a,t)=>{d({sort:t.value})})),o.push(v(h,"click","[data-view]",(a,t)=>{a.preventDefault(),d({view:t.dataset.view})})),o.push(v(h,"click","[data-open-filters]",a=>{a.preventDefault(),O(),S.open()})),o.push(v(h,"click","[data-row-add]",(a,t)=>{a.preventDefault();const e=ka(t.dataset.rowAdd);e&&C(e)})),o.push(v(h,"click","[data-row-wishlist]",(a,t)=>{a.preventDefault();const e=E(t.dataset.rowWishlist);P.success(e?"به علاقه‌مندی‌ها اضافه شد":"از علاقه‌مندی‌ها حذف شد")})),{node:u,title:n.q?`جستجو: ${n.q}`:"فروشگاه",cleanup:()=>o.forEach(a=>a())}}export{Sa as default};

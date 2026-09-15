import{e as x,w as u,ax as $,h as o,r as s,I as h,_ as v,q as z,Q as D,t as b,L as k,i as m,j as y,k as L,l as T,ay as S,z as C,A as p,Y as I,B as P,av as A,ag as E,az as M}from"./index-c305d6a7.js";import"./data-f43f95cf.js";function N(n){return[{label:"تصویر",render:a=>s(L(a,{className:"product-art--sm"}))},{label:"برند",render:a=>a.brandName},{label:"دسته‌بندی",render:a=>`${a.categoryTitle}${a.subcategoryTitle?` · ${a.subcategoryTitle}`:""}`},{label:"امتیاز کاربران",render:a=>s(T(a.rating,{count:a.reviewCount}))},{label:"قیمت",render:a=>s(o`
          <span class="price">
            <span class="price__now"
              >${k(a.price,{withUnit:!1})}</span
            >
            <span class="price__unit">تومان</span>
          </span>
        `)},{label:"موجودی",render:a=>s(S(a))},{label:"نسخه‌ای",render:a=>a.rx?s(o`<span class="badge badge--info">نیازمند نسخه</span>`):s(o`<span class="badge badge--neutral">بدون نسخه</span>`)},{label:"بسته‌بندی",render:a=>(a.variants||[]).join("، ")||"—"}]}async function B(){const n=x("div"),a=[];function g(){const e=$();if(e.length<1){n.innerHTML=o`
        <div class="shell">
          ${s(h([{label:"خانه",href:"/"},{label:"مقایسه محصولات"}]))}
          ${s(v({title:"مقایسه محصولات"}))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString(),z('[data-slot="empty"]',n).append(D({iconName:"scale",title:"لیست مقایسه خالی است",text:"با زدن آیکن ترازو روی کارت هر محصول، حداکثر ۴ کالا را برای مقایسه اینجا اضافه کنید.",action:{label:"مشاهده محصولات",variant:"btn--primary",href:"/catalog"}}).node);return}const r=[];e.forEach(t=>{(t.specs||[]).forEach(c=>{const d=c.label||c.key;d&&!r.includes(d)&&r.push(d)})});const l=r.map(t=>({label:t,render:c=>{const d=(c.specs||[]).find(f=>(f.label||f.key)===t);return d?d.value:"—"}})),i=[...N(),...l],w=e.reduce((t,c)=>t+c.price,0),_=e.filter(t=>t.stock>0).length;n.innerHTML=o`
      <div class="shell">
        ${s(h([{label:"خانه",href:"/"},{label:"مقایسه محصولات"}]))}
        ${s(v({title:"مقایسه محصولات",text:`${b(e.length)} محصول انتخاب شده است. می‌توانید حداکثر ۴ محصول را با هم بسنجید.`}))}

        <div class="catalog-toolbar glass radius-lg">
          <span
            >جمع قیمت این ${b(e.length)} محصول:
            <strong>${k(w)}</strong></span
          >
          <div class="row row--sm">
            <button
              class="btn btn--primary btn--sm"
              type="button"
              data-add-all
              ${_?"":"disabled"}
            >
              ${s(m("cart",{size:16}))} افزودن همه
            </button>
            <button
              class="btn btn--ghost btn--sm text-danger"
              type="button"
              data-clear
            >
              ${s(m("trash",{size:15}))} پاک کردن مقایسه
            </button>
          </div>
        </div>

        <div class="table-wrap compare-table-wrap mt-6">
          <table class="table compare-table">
            <thead>
              <tr>
                <th scope="col" class="compare-table__corner">ویژگی</th>
                ${e.map(t=>s(o`
                    <th scope="col" data-product-id="${t.id}">
                      <div class="compare-col">
                        <button
                          class="icon-btn compare-col__remove"
                          type="button"
                          data-remove="${t.id}"
                          aria-label="حذف ${t.name} از مقایسه"
                        >
                          ${s(m("close",{size:15}))}
                        </button>
                        <a
                          class="compare-col__title"
                          href="${y(`/product/${t.slug}`)}"
                          >${t.name}</a
                        >
                        <button
                          class="btn btn--primary btn--xs"
                          type="button"
                          data-col-add="${t.id}"
                          ${t.stock<=0?"disabled":""}
                        >
                          ${t.stock<=0?"ناموجود":"افزودن به سبد"}
                        </button>
                      </div>
                    </th>
                  `))}
              </tr>
            </thead>
            <tbody>
              ${i.map(t=>s(o`
                  <tr>
                    <th scope="row">${t.label}</th>
                    ${e.map(c=>s(o`<td>${t.render(c)}</td>`))}
                  </tr>
                `))}
            </tbody>
          </table>
        </div>

        ${e.length<4?o`
              <div class="alert alert--info mt-6">
                ${s(m("info",{size:18}))}
                <span
                  >می‌توانید ${b(4-e.length)} محصول دیگر
                  هم اضافه کنید.
                  <a class="fw-bold" href="${y("/catalog")}"
                    >افزودن از فروشگاه</a
                  ></span
                >
              </div>
            `:""}
      </div>
    `.toString()}return a.push(u(n,"click","[data-remove]",(e,r)=>{e.preventDefault(),C(r.dataset.remove),p.info("از لیست مقایسه حذف شد"),g()})),a.push(u(n,"click","[data-col-add]",(e,r)=>{e.preventDefault();const l=I(r.dataset.colAdd);if(!l)return;if(!P(l.id,1).ok){p.error("افزودن ناموفق بود",l.name);return}p.success("به سبد خرید اضافه شد",l.name)})),a.push(u(n,"click","[data-add-all]",e=>{e.preventDefault();const r=$().filter(i=>i.stock>0).map(i=>i.id),l=A(r);l.added&&p.success("به سبد خرید اضافه شد",`${b(l.added)} محصول`),l.skipped&&p.warn("برخی کالاها اضافه نشدند",`${b(l.skipped)} مورد ناموجود بود.`)})),a.push(u(n,"click","[data-clear]",async e=>{e.preventDefault(),await E({title:"پاک کردن لیست مقایسه",message:"همه محصولات از لیست مقایسه حذف شوند؟",confirmLabel:"پاک کن",danger:!0})&&(M(),p.info("لیست مقایسه پاک شد"),g())})),g(),{node:n,title:"مقایسه محصولات",cleanup:()=>a.forEach(e=>e())}}export{B as default};

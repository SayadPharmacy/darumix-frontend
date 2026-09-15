import{e as _,c as F,b as J,$ as K,t as b,a6 as U,W as q,h as o,r as n,i as v,w as y,j as H,q as u,a as V,o as X,M as j,ag as I,A as k,O as N,a9 as A}from"./index-c305d6a7.js";import{deleteCategory as Z,deleteBrand as x,saveCategory as aa,saveBrand as ea}from"./admin-cbf8d426.js";import{k as C,a as ta}from"./_layout-d6de18ae.js";import{adminToolbar as sa,tableEmpty as O}from"./_shared-51e7ab10.js";import"./data-f43f95cf.js";const la=["pill","heart","leaf","sun","baby","tooth","mask","bone","stethoscope","thermometer","activity","shield","droplet","sparkle"];async function ia({query:E={}}={}){const p=_("div"),m=[],h=E.tab==="brands"?"brands":"categories",B=E.q||"",$=F(),L=J(),w=K(),P=[C({label:"دسته‌بندی‌ها",value:b($.length),iconName:"layers",tone:"brand",hint:"سطح اول"}),C({label:"زیرشاخه‌ها",value:b($.reduce((a,s)=>a+(s.subcategories||[]).length,0)),iconName:"sliders",tone:"mint",hint:"در همه دسته‌ها"}),C({label:"برندها",value:b(L.length),iconName:"verified",tone:"blue",hint:"داخلی و بین‌المللی"}),C({label:"دسته بدون محصول",value:b($.filter(a=>!w[a.id]).length),iconName:"alert",tone:"gold",hint:"نیازمند محصول"})],T=U({items:[{id:"categories",label:"دسته‌بندی‌ها",icon:"layers",count:$.length},{id:"brands",label:"برندها",icon:"verified",count:L.length}],active:h,variant:"pill-tabs",onChange:a=>q({tab:a==="categories"?null:a})}),z=sa({placeholder:h==="brands"?"جستجوی برند…":"جستجوی دسته‌بندی…",value:B,onSearch:a=>q({q:a||null}),extra:(()=>{const a=_("button",{class:"btn btn--primary btn--sm",type:"button","data-add":h});return a.innerHTML=o`${n(v("plus",{size:15}))} ${h==="brands"?"برند جدید":"دسته جدید"}`.toString(),a})()});m.push(T.cleanup,z.cleanup);const r=_("div",{class:"stack stack--lg"});p.append(T.node,z.node,r);function W(){const a=B.trim().toLowerCase(),s=$.filter(e=>a?[e.title,e.description,...(e.subcategories||[]).map(t=>t.title)].join(" ").toLowerCase().includes(a):!0);if(!s.length){r.innerHTML="",r.append(O("دسته‌بندی‌ای پیدا نشد","عبارت جستجو را تغییر دهید."));return}r.innerHTML=o`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">دسته‌بندی</th>
              <th scope="col">گروه</th>
              <th scope="col">زیرشاخه‌ها</th>
              <th scope="col">تعداد محصول</th>
              <th scope="col" style="width:110px"></th>
            </tr>
          </thead>
          <tbody>
            ${s.map(e=>n(o`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="category-card__icon category-card__icon--sm"
                        >${n(v(e.icon,{size:20}))}</span
                      >
                      <div>
                        <a class="fw-semibold fs-sm" href="${H(`/category/${e.id}`)}"
                          >${e.title}</a
                        >
                        <span class="fs-xs text-soft d-block clamp-1"
                          >${e.description||"بدون توضیح"}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td><span class="badge badge--neutral">${e.group||"—"}</span></td>

                  <td>
                    <div class="chip-row">
                      ${(e.subcategories||[]).length?(e.subcategories||[]).slice(0,4).map(t=>n(o`<span class="chip chip--static fs-xs">${t.title}</span>`)):o`<span class="fs-xs text-soft">بدون زیرشاخه</span>`}
                      ${(e.subcategories||[]).length>4?o`<span class="fs-xs text-soft"
                            >+${b((e.subcategories||[]).length-4)}</span
                          >`:""}
                    </div>
                  </td>

                  <td>
                    <span class="fw-bold">${b(w[e.id]||0)}</span>
                    ${w[e.id]?"":o`<span class="badge badge--warn">خالی</span>`}
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-edit-category="${e.id}"
                        data-tip="ویرایش"
                        aria-label="ویرایش ${e.title}"
                      >
                        ${n(v("edit",{size:16}))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-delete-category="${e.id}"
                        data-tip="حذف"
                        aria-label="حذف ${e.title}"
                      >
                        ${n(v("trash",{size:16}))}
                      </button>
                    </div>
                  </td>
                </tr>
              `))}
          </tbody>
        </table>
      </div>
    `.toString()}function M(a){const s=!!a,e=A({title:s?"ویرایش دسته‌بندی":"افزودن دسته‌بندی",size:"md",body:o`
        <form class="form-grid form-grid--2" data-category-form novalidate>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-title"
              >عنوان <span class="field__required">*</span></label
            >
            <input class="input" id="cg-title" name="title" value="${(a==null?void 0:a.title)||""}" />
          </div>

          <div class="field">
            <label class="field__label" for="cg-group">گروه</label>
            <select class="select" id="cg-group" name="group">
              ${["medicine","supplement","personal","equipment","mother-child","wellness"].map(t=>n(o`
                  <option value="${t}" ${(a==null?void 0:a.group)===t?"selected":""}>
                    ${t}
                  </option>
                `))}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="cg-icon">آیکن</label>
            <select class="select" id="cg-icon" name="icon">
              ${la.map(t=>n(o`
                  <option value="${t}" ${(a==null?void 0:a.icon)===t?"selected":""}>
                    ${t}
                  </option>
                `))}
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-desc">توضیح</label>
            <textarea class="textarea" id="cg-desc" name="description" rows="2">${(a==null?void 0:a.description)||""}</textarea>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="cg-subs">زیرشاخه‌ها (هر خط یک مورد، «عنوان | شناسه»)</label>
            <textarea class="textarea" id="cg-subs" name="subcategories" rows="5" placeholder="قرص و کپسول | tablets&#10;شربت | syrup">${((a==null?void 0:a.subcategories)||[]).map(t=>`${t.title} | ${t.id}`).join(`
`)}</textarea>
          </div>

          <span class="field__error" data-form-error hidden style="grid-column:1/-1"></span>
        </form>
      `,footer:`<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button><button class="btn btn--primary" type="button" data-save-category>${s?"ذخیره":"افزودن"}</button>`});e.open(),e.node.addEventListener("click",t=>{if(!t.target.closest("[data-save-category]"))return;const d=u("[data-category-form]",e.node),c=u("[data-form-error]",d),l=i=>{var f;return((f=u(`[name="${i}"]`,d))==null?void 0:f.value.trim())||""};if(!l("title")){c.hidden=!1,c.textContent="عنوان دسته‌بندی الزامی است.";return}const g=l("subcategories").split(`
`).map(i=>i.trim()).filter(Boolean).map((i,f)=>{const[Q,R]=i.split("|").map(Y=>Y.trim());return{id:R||`sub-${Date.now()}-${f}`,title:Q||i}});aa({id:a==null?void 0:a.id,title:l("title"),group:l("group"),icon:l("icon"),description:l("description"),subcategories:g}),e.close(),k.success(s?"دسته‌بندی به‌روزرسانی شد":"دسته‌بندی اضافه شد",l("title")),window.location.reload()})}function G(){const a=B.trim().toLowerCase(),s=L.filter(t=>a?[t.name,t.nameEn,t.country].join(" ").toLowerCase().includes(a):!0);if(!s.length){r.innerHTML="",r.append(O("برندی پیدا نشد","عبارت جستجو را تغییر دهید."));return}r.innerHTML=o`
      <div class="auto-grid auto-grid--wide" data-slot="brand-grid"></div>
    `.toString();const e=u('[data-slot="brand-grid"]',r);s.forEach(t=>{const d=V().filter(l=>l.brandId===t.id).length,c=_("article",{class:"brand-admin glass radius-xl"});c.innerHTML=o`
        <div class="row">
          <span class="brand-admin__logo">${n(X(t))}</span>
          <div class="grow">
            <div class="row row--sm">
              <h3 class="fs-base mb-0">${t.name}</h3>
              ${t.featured?o`<span class="badge badge--gold">ویژه</span>`:""}
            </div>
            <span class="fs-xs text-soft">${t.nameEn} · ${t.country}</span>
          </div>
        </div>

        <div class="row row--between mt-4">
          <span class="fs-sm text-soft">تعداد محصول</span>
          <span class="fw-bold">${b(d)}</span>
        </div>

        <div class="row row--sm mt-4">
          <a class="btn btn--glass btn--sm grow" href="${H("/catalog",{brand:t.id})}">
            ${n(v("eye",{size:15}))} محصولات
          </a>
          <button class="btn btn--glass btn--sm" type="button" data-edit-brand="${t.id}">
            ${n(v("edit",{size:15}))}
          </button>
          <button
            class="btn btn--ghost btn--sm text-danger"
            type="button"
            data-delete-brand="${t.id}"
          >
            ${n(v("trash",{size:15}))}
          </button>
        </div>
      `.toString(),e.append(c)})}function D(a){const s=!!a,e=A({title:s?"ویرایش برند":"افزودن برند",size:"md",body:o`
        <form class="form-grid form-grid--2" data-brand-form novalidate>
          <div class="field">
            <label class="field__label" for="bd-name"
              >نام فارسی <span class="field__required">*</span></label
            >
            <input class="input" id="bd-name" name="name" value="${(a==null?void 0:a.name)||""}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-nameen">نام انگلیسی</label>
            <input class="input" id="bd-nameen" name="nameEn" value="${(a==null?void 0:a.nameEn)||""}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-country">کشور</label>
            <input class="input" id="bd-country" name="country" value="${(a==null?void 0:a.country)||"ایران"}" />
          </div>

          <div class="field">
            <label class="field__label" for="bd-tone">رنگ برند</label>
            <select class="select" id="bd-tone" name="tone">
              ${["emerald","mint","teal","blue","gold"].map(t=>n(o`
                  <option value="${t}" ${(a==null?void 0:a.tone)===t?"selected":""}>
                    ${t}
                  </option>
                `))}
            </select>
          </div>

          <label class="switch" style="grid-column:1/-1">
            <input type="checkbox" name="featured" ${a!=null&&a.featured?"checked":""} />
            <span class="switch__track"></span>
            <span>نمایش در برندهای منتخب</span>
          </label>

          <span class="field__error" data-form-error hidden style="grid-column:1/-1"></span>
        </form>
      `,footer:`<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button><button class="btn btn--primary" type="button" data-save-brand>${s?"ذخیره":"افزودن"}</button>`});e.open(),e.node.addEventListener("click",t=>{var g;if(!t.target.closest("[data-save-brand]"))return;const d=u("[data-brand-form]",e.node),c=u("[data-form-error]",d),l=i=>{var f;return((f=u(`[name="${i}"]`,d))==null?void 0:f.value.trim())||""};if(!l("name")){c.hidden=!1,c.textContent="نام برند الزامی است.";return}ea({id:a==null?void 0:a.id,name:l("name"),nameEn:l("nameEn")||l("name"),country:l("country"),tone:l("tone"),featured:!!((g=u('[name="featured"]',d))!=null&&g.checked)}),e.close(),k.success(s?"برند به‌روزرسانی شد":"برند اضافه شد",l("name")),window.location.reload()})}h==="brands"?G():W();const S=ta({title:"دسته‌بندی و برند",subtitle:"ساختار کاتالوگ، زیرشاخه‌ها و برندهای همکار را مدیریت کنید.",iconName:"layers",stats:P,content:p});return m.push(y(p,"click","[data-add]",(a,s)=>{a.preventDefault(),s.dataset.add==="brands"?D(null):M(null)})),m.push(y(p,"click","[data-edit-category]",(a,s)=>{a.preventDefault();const e=j(s.dataset.editCategory);e&&M(e)})),m.push(y(p,"click","[data-delete-category]",async(a,s)=>{a.preventDefault();const e=j(s.dataset.deleteCategory),t=w[e==null?void 0:e.id]||0;await I({title:"حذف دسته‌بندی",message:t?`«${e==null?void 0:e.title}» دارای ${b(t)} محصول است. با حذف دسته، محصولات آن بدون دسته‌بندی می‌شوند. ادامه می‌دهید؟`:`«${e==null?void 0:e.title}» حذف شود؟`,confirmLabel:"حذف کن",danger:!0})&&(Z(s.dataset.deleteCategory),k.info("دسته‌بندی حذف شد",e==null?void 0:e.title),window.location.reload())})),m.push(y(p,"click","[data-edit-brand]",(a,s)=>{a.preventDefault();const e=N(s.dataset.editBrand);e&&D(e)})),m.push(y(p,"click","[data-delete-brand]",async(a,s)=>{a.preventDefault();const e=N(s.dataset.deleteBrand);await I({title:"حذف برند",message:`برند «${e==null?void 0:e.name}» حذف شود؟`,confirmLabel:"حذف کن",danger:!0})&&(x(s.dataset.deleteBrand),k.info("برند حذف شد",e==null?void 0:e.name),window.location.reload())})),{node:S.node,title:"دسته‌بندی و برند",cleanup:()=>{S.cleanup(),m.forEach(a=>a())}}}export{ia as default};

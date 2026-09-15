import{e as v,bi as F,t as r,h as o,r as d,i as p,aJ as S,w as $,v as K,W as N,aL as P,u as I,j as J,a8 as Q,aF as W,bs as C,ag as G,bt as O,A as E,a9 as U,bk as V,bl as X,q as b,bu as Y,bv as Z}from"./index-c305d6a7.js";import{k as y,a as x}from"./_layout-d6de18ae.js";import{adminToolbar as aa,tableEmpty as ta}from"./_shared-51e7ab10.js";import"./data-f43f95cf.js";import"./admin-cbf8d426.js";async function ra({query:q={}}={}){const n=v("div"),i=[],c={q:q.q||"",tag:q.tag||"all"},_=K(),f=F(),H=[y({label:"کل مقالات",value:r(f.total),iconName:"bookmark",tone:"brand"}),y({label:"مقالات ویژه",value:r(f.featured),iconName:"crown",tone:"gold",hint:"نمایش در صفحه اصلی"}),y({label:"پیش‌نویس‌ها",value:r(f.drafts),iconName:"edit",tone:"blue",hint:"منتشر نشده"}),y({label:"زمان مطالعه کل",value:`${r(f.totalReadingMinutes)} دقیقه`,iconName:"clock",tone:"mint",hint:"مجموع همه مقالات"})],M=v("button",{class:"btn btn--primary btn--sm",type:"button","data-new-article":""});M.innerHTML=o`${d(p("plus",{size:15}))} مقاله جدید`.toString();const m=aa({placeholder:"جستجو در عنوان، خلاصه یا نویسنده…",value:c.q,onSearch:a=>{c.q=a,N({q:a||null})},extra:M});i.push(m.cleanup);const w=v("div",{class:"admin-status-bar"});w.innerHTML=o`
    <button
      class="chip${c.tag==="all"?" is-active":""}"
      type="button"
      data-tag="all"
    >
      همه موضوع‌ها
      <span class="chip__count"
        >${r(S().length)}</span
      >
    </button>
    ${_.filter(a=>a.id!=="all").map(a=>{const t=S().filter(e=>e.tag===a.id).length;return t?d(o`
          <button
            class="chip${a.id===c.tag?" is-active":""}"
            type="button"
            data-tag="${a.id}"
          >
            ${a.title}
            <span class="chip__count">${r(t)}</span>
          </button>
        `):""})}
  `.toString();const h=v("div");function j(){const a=c.q.trim().toLowerCase();return S().filter(t=>c.tag!=="all"&&t.tag!==c.tag?!1:a?[t.title,t.excerpt,t.author].join(" ").toLowerCase().includes(a):!0)}function k(){const a=j();if(!a.length){h.innerHTML="",h.append(ta("مقاله‌ای با این مشخصات پیدا نشد","موضوع یا عبارت جستجو را تغییر دهید.")),m.setSummary("");return}h.innerHTML=o`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">مقاله</th>
              <th scope="col">موضوع</th>
              <th scope="col">نویسنده</th>
              <th scope="col">تاریخ</th>
              <th scope="col">بازدید</th>
              <th scope="col">تعامل</th>
              <th scope="col">وضعیت</th>
              <th scope="col" style="width:110px"></th>
            </tr>
          </thead>
          <tbody>
            ${a.map(t=>{const e=_.find(u=>u.id===t.tag),l=P(t);return d(o`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="table-thumb table-thumb--wide"
                        >${d(I(t))}</span
                      >
                      <div style="max-width:320px">
                        <a
                          class="fw-semibold fs-sm clamp-1"
                          href="${J(`/magazine/${t.slug}`)}"
                          >${t.title}</a
                        >
                        <span class="fs-xs text-soft clamp-1 d-block"
                          >${t.excerpt}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class="badge badge--neutral"
                      >${(e==null?void 0:e.title)||t.tag}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${t.author}</div>
                    <span class="fs-xs text-soft"
                      >${t.authorRole||""}</span
                    >
                  </td>

                  <td>
                    <div class="fs-sm">${Q(t.date)}</div>
                    <span class="fs-xs text-soft"
                      >${W(t.date)}</span
                    >
                  </td>

                  <td class="fw-bold">
                    ${r(l.views)}
                  </td>

                  <td>
                    <div class="row row--sm fs-xs text-soft">
                      <span
                        >${d(p("heart",{size:12}))}
                        ${r(l.likes)}</span
                      >
                      <span
                        >${d(p("message",{size:12}))}
                        ${r(l.comments)}</span
                      >
                    </div>
                  </td>

                  <td>
                    <div class="stack stack--xs">
                      ${t.draft?o`<span class="badge badge--warn">پیش‌نویس</span>`:o`<span class="badge badge--mint">منتشرشده</span>`}
                      ${t.featured?o`<span class="badge badge--gold">ویژه</span>`:""}
                    </div>
                  </td>

                  <td>
                    <div class="row row--sm">
                      <button
                        class="icon-btn"
                        type="button"
                        data-edit-article="${t.id}"
                        data-tip="ویرایش"
                        aria-label="ویرایش ${t.title}"
                      >
                        ${d(p("edit",{size:16}))}
                      </button>
                      <button
                        class="icon-btn"
                        type="button"
                        data-delete-article="${t.id}"
                        data-tip="حذف"
                        aria-label="حذف ${t.title}"
                      >
                        ${d(p("trash",{size:16}))}
                      </button>
                    </div>
                  </td>
                </tr>
              `)})}
          </tbody>
        </table>
      </div>
    `.toString(),m.setSummary(`${r(a.length)} مقاله نمایش داده می‌شود`)}function T(a){const t=!!a,e=U({title:t?"ویرایش مقاله":"مقاله جدید",size:"lg",body:o`
        <form class="form-grid form-grid--2" data-article-form novalidate>
          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="ar-title"
              >عنوان <span class="field__required">*</span></label
            >
            <input
              class="input"
              id="ar-title"
              name="title"
              value="${(a==null?void 0:a.title)||""}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-slug">نشانی (slug)</label>
            <input
              class="input"
              id="ar-slug"
              name="slug"
              value="${(a==null?void 0:a.slug)||""}"
              placeholder="vitamin-d-guide"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-tag">موضوع</label>
            <select class="select" id="ar-tag" name="tag">
              ${_.filter(l=>l.id!=="all").map(l=>d(o`
                    <option
                      value="${l.id}"
                      ${(a==null?void 0:a.tag)===l.id?"selected":""}
                    >
                      ${l.title}
                    </option>
                  `))}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="ar-author">نویسنده</label>
            <input
              class="input"
              id="ar-author"
              name="author"
              value="${(a==null?void 0:a.author)||"تیم محتوای دارومیکس"}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-role">سمت نویسنده</label>
            <input
              class="input"
              id="ar-role"
              name="authorRole"
              value="${(a==null?void 0:a.authorRole)||"کارشناس سلامت"}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-minutes"
              >زمان مطالعه (دقیقه)</label
            >
            <input
              class="input"
              id="ar-minutes"
              name="readingMinutes"
              type="number"
              inputmode="numeric"
              value="${(a==null?void 0:a.readingMinutes)||5}"
            />
          </div>

          <div class="field">
            <label class="field__label" for="ar-shape">شکل تصویر</label>
            <select class="select" id="ar-shape" name="shape">
              ${V.map(l=>d(o`
                  <option
                    value="${l}"
                    ${(a==null?void 0:a.shape)===l?"selected":""}
                  >
                    ${l}
                  </option>
                `))}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="ar-tone">رنگ تصویر</label>
            <select class="select" id="ar-tone" name="tone">
              ${X.map(l=>d(o`
                  <option
                    value="${l}"
                    ${(a==null?void 0:a.tone)===l?"selected":""}
                  >
                    ${l}
                  </option>
                `))}
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="ar-excerpt"
              >خلاصه <span class="field__required">*</span></label
            >
            <textarea class="textarea" id="ar-excerpt" name="excerpt" rows="2">
${(a==null?void 0:a.excerpt)||""}</textarea
            >
          </div>

          <div class="field" style="grid-column:1/-1">
            <label class="field__label" for="ar-body"
              >متن مقاله
              <span class="field__hint"
                >هر پاراگراف را با یک خط خالی جدا کنید</span
              ></label
            >
            <textarea class="textarea" id="ar-body" name="body" rows="7">
${((a==null?void 0:a.body)||[]).join(`

`)}</textarea
            >
          </div>

          <div class="row row--sm" style="grid-column:1/-1">
            <label class="switch">
              <input
                type="checkbox"
                name="featured"
                ${a!=null&&a.featured?"checked":""}
              />
              <span class="switch__track"></span>
              <span>مقاله ویژه</span>
            </label>

            <label class="switch">
              <input
                type="checkbox"
                name="draft"
                ${a!=null&&a.draft?"checked":""}
              />
              <span class="switch__track"></span>
              <span>ذخیره به‌عنوان پیش‌نویس</span>
            </label>
          </div>

          <span
            class="field__error"
            data-form-error
            hidden
            style="grid-column:1/-1"
          ></span>
        </form>
      `,footer:`<button class="btn btn--ghost" type="button" data-modal-close>انصراف</button><button class="btn btn--primary" type="button" data-save-article>${t?"ذخیره تغییرات":"انتشار مقاله"}</button>`});e.open(),e.node.addEventListener("click",l=>{var B,D;if(!l.target.closest("[data-save-article]"))return;const u=b("[data-article-form]",e.node),g=b("[data-form-error]",u),s=L=>{var R;return((R=b(`[name="${L}"]`,u))==null?void 0:R.value.trim())||""};if(!s("title")||!s("excerpt")){g.hidden=!1,g.textContent="عنوان و خلاصه مقاله الزامی است.";return}g.hidden=!0;const A={title:s("title"),slug:s("slug")||s("title").replace(/\s+/g,"-").replace(/[^\w\u0600-\u06FF-]/g,"").toLowerCase(),tag:s("tag"),author:s("author"),authorRole:s("authorRole"),readingMinutes:Number(s("readingMinutes"))||5,shape:s("shape"),tone:s("tone"),excerpt:s("excerpt"),body:s("body").split(/\n{2,}/).map(L=>L.trim()).filter(Boolean),featured:!!((B=b('[name="featured"]',u))!=null&&B.checked),draft:!!((D=b('[name="draft"]',u))!=null&&D.checked)};t?Y(a.id,A):Z(A),e.close(),E.success(t?"مقاله به‌روزرسانی شد":"مقاله ایجاد شد",A.title),k()})}n.append(m.node,w,h),k();const z=x({title:"مدیریت محتوا",subtitle:"مدیریت مقالات مجله سلامت؛ ایجاد، ویرایش، انتشار و بررسی تعامل مخاطبان.",iconName:"bookmark",stats:H,content:n});return i.push($(n,"click","[data-new-article]",a=>{a.preventDefault(),T(null)})),i.push($(n,"click","[data-tag]",(a,t)=>{a.preventDefault();const e=t.dataset.tag;w.querySelectorAll("[data-tag]").forEach(l=>l.classList.toggle("is-active",l===t)),N({tag:e==="all"?null:e})})),i.push($(n,"click","[data-edit-article]",(a,t)=>{a.preventDefault();const e=C(t.dataset.editArticle);e&&T(e)})),i.push($(n,"click","[data-delete-article]",async(a,t)=>{a.preventDefault();const e=C(t.dataset.deleteArticle);await G({title:"حذف مقاله",message:`مقاله «${e==null?void 0:e.title}» حذف شود؟ این کار روی داده‌های محلی اثر می‌گذارد.`,confirmLabel:"حذف کن",danger:!0})&&(O(t.dataset.deleteArticle),E.info("مقاله حذف شد",e==null?void 0:e.title),k())})),{node:z.node,title:"مدیریت محتوا",cleanup:()=>{z.cleanup(),i.forEach(a=>a())}}}export{ra as default};

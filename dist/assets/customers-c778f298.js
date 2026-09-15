import{e as v,t as o,L as $,h as r,r as u,w as P,W as w,ae as H,a8 as _,i as E,q as U}from"./index-c305d6a7.js";import{customerSegments as B,customers as D,ordersOfCustomer as M,customerById as V}from"./admin-cbf8d426.js";import{k as g,a as j}from"./_layout-d6de18ae.js";import{adminToolbar as y,tableEmpty as z,adminPager as A,customerDrawer as I}from"./_shared-51e7ab10.js";import"./data-f43f95cf.js";async function J({query:m={}}={}){var L;const d=v("div"),l=[],h=B(),n={q:m.q||"",segment:h.some(t=>t.id===m.segment)?m.segment:"all",page:Math.max(1,Number(m.page)||1)},N=12;function x(t){const s=M(t.id),a=s.reduce((e,f)=>e+f.total,0);return{orders:s,spent:a}}const c=D({perPage:9999}).items,S=c.reduce((t,s)=>t+x(s).spent,0),T=[g({label:"کل مشتریان",value:o(c.length),iconName:"users",tone:"brand",change:8}),g({label:"مجموع خرید",value:$(S,{withUnit:!1}),iconName:"currency",tone:"mint",hint:"تومان"}),g({label:"مشتریان وفادار",value:o(((L=h.find(t=>t.id==="loyal"))==null?void 0:L.count)||0),iconName:"crown",tone:"gold",hint:"خرید مکرر"}),g({label:"میانگین خرید",value:$(c.length?Math.round(S/c.length):0,{withUnit:!1}),iconName:"chart",tone:"blue",hint:"تومان به ازای هر مشتری"})];function k(){const t=D({segment:n.segment,q:n.q,page:n.page,perPage:N});return n.page=t.page,t}const p=y({placeholder:"جستجو با نام، شماره تماس، شهر یا ایمیل…",value:n.q,onSearch:t=>{n.q=t,n.page=1,w({q:t||null})}});l.push(p.cleanup);const b=v("div",{class:"admin-status-bar"});b.innerHTML=r`
    <button
      class="chip${n.segment==="all"?" is-active":""}"
      type="button"
      data-segment="all"
    >
      همه مشتریان
      <span class="chip__count">${o(c.length)}</span>
    </button>
    ${h.map(t=>u(r`
        <button
          class="chip${t.id===n.segment?" is-active":""}"
          type="button"
          data-segment="${t.id}"
        >
          ${t.label}
          <span class="chip__count">${o(t.count)}</span>
        </button>
      `))}
  `.toString();const i=v("div");function C(){const t=k();if(!t.items.length){i.innerHTML="",i.append(z("مشتری‌ای با این مشخصات پیدا نشد","بخش‌بندی یا عبارت جستجو را تغییر دهید.")),p.setSummary("");return}const s=t.items.map(e=>({customer:e,...x(e)})),a=Math.max(...s.map(e=>e.spent),1);if(i.innerHTML=r`
      <div class="table-wrap">
        <table class="table table--admin">
          <thead>
            <tr>
              <th scope="col">مشتری</th>
              <th scope="col">تماس</th>
              <th scope="col">شهر</th>
              <th scope="col">بخش</th>
              <th scope="col">سفارش‌ها</th>
              <th scope="col">مجموع خرید</th>
              <th scope="col">عضویت</th>
              <th scope="col" style="width:70px"></th>
            </tr>
          </thead>
          <tbody>
            ${s.map(e=>u(r`
                <tr>
                  <td>
                    <div class="row row--sm">
                      <span class="table-avatar"
                        >${e.customer.name.slice(0,2)}</span
                      >
                      <div>
                        <span class="fw-semibold fs-sm"
                          >${e.customer.name}</span
                        >
                        <span class="fs-xs text-soft d-block"
                          >${e.customer.id}</span
                        >
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="fs-sm">${e.customer.phone}</div>
                    <span class="fs-xs text-soft"
                      >${e.customer.email||""}</span
                    >
                  </td>

                  <td class="fs-sm">${e.customer.city}</td>

                  <td>
                    <span class="badge badge--neutral"
                      >${e.customer.segmentLabel||e.customer.segment}</span
                    >
                  </td>

                  <td class="fw-bold">
                    ${o(e.orders.length)}
                  </td>

                  <td style="min-width:150px">
                    <div class="fw-semibold fs-sm">
                      ${$(e.spent,{withUnit:!1})}
                    </div>
                    ${u(H(e.spent/a*100,"mint"))}
                  </td>

                  <td class="fs-sm">${_(e.customer.joinDate)}</td>

                  <td>
                    <button
                      class="icon-btn"
                      type="button"
                      data-open-customer="${e.customer.id}"
                      data-tip="جزئیات"
                      aria-label="جزئیات ${e.customer.name}"
                    >
                      ${u(E("eye",{size:16}))}
                    </button>
                  </td>
                </tr>
              `))}
          </tbody>
        </table>
      </div>

      <div class="admin-table-foot">
        <span class="fs-xs text-soft"></span>
        <div data-slot="pager"></div>
      </div>
    `.toString(),t.pages>1){const e=A({page:t.page,pages:t.pages,onChange:f=>w({page:String(f)},{resetPage:!1})});U('[data-slot="pager"]',i).append(e.node),l.push(e.cleanup)}p.setSummary(`نمایش ${o(t.items.length)} از ${o(t.total)} مشتری`)}d.append(p.node,b,i),C();const q=j({title:"مدیریت مشتریان",subtitle:"بخش‌بندی مشتریان، مشاهده ارزش خرید و سابقه سفارش‌های هر مشتری.",iconName:"users",stats:T,content:d});return l.push(P(d,"click","[data-segment]",(t,s)=>{t.preventDefault();const a=s.dataset.segment;b.querySelectorAll("[data-segment]").forEach(e=>e.classList.toggle("is-active",e===s)),w({segment:a==="all"?null:a})})),l.push(P(d,"click","[data-open-customer]",(t,s)=>{t.preventDefault();const a=V(s.dataset.openCustomer);a&&I(a,{orders:M(a.id)})})),{node:q.node,title:"مدیریت مشتریان",cleanup:()=>{q.cleanup(),l.forEach(t=>t())}}}export{J as default};

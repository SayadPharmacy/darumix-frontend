import{e as w,h as n,r as b,q as M,t as L,i as E,bH as H,a8 as S}from"./index-c305d6a7.js";function N(o=[],m={}){const{valueKey:r="value",labelKey:i="label",height:p=200,formatValue:l=t=>H(t),formatLabel:d=t=>t instanceof Date?S(t):String(t),tone:a="brand"}=m,c=w("div",{class:"chart chart--bars"});if(!o.length)return c.innerHTML=n`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString(),{node:c,cleanup:()=>{}};const v=o.map(t=>Number(t[r])||0),$=Math.max(...v,1),h=o.map((t,e)=>({value:v[e],label:d(t[i],e),percent:Math.round(v[e]/$*100),original:t}));c.innerHTML=n`
    <div class="chart__plot" style="height:${p}px">
      ${h.map((t,e)=>b(n`
          <div class="chart__col" data-bar="${e}" tabindex="0">
            <span class="chart__value">${l(t.value)}</span>
            <span
              class="chart__bar chart__bar--${a}"
              style="height:${Math.max(2,t.percent)}%"
            ></span>
          </div>
        `))}
    </div>
    <div class="chart__axis">
      ${h.map((t,e)=>b(n`<span
            class="chart__tick${e%2?" chart__tick--muted":""}"
            >${t.label}</span
          >`))}
    </div>
  `.toString();const u=w("div",{class:"chart__tooltip",hidden:!0});c.append(u);const s=M(".chart__plot",c),_=t=>{const e=h[t];if(!e)return;const x=M(`[data-bar="${t}"]`,c);if(!x)return;u.hidden=!1,u.innerHTML=n`
      <span class="chart__tooltip-label">${e.label}</span>
      <span class="chart__tooltip-value">${l(e.value)}</span>
    `.toString();const k=x.getBoundingClientRect(),T=s.getBoundingClientRect();u.style.left=`${k.left-T.left+k.width/2}px`},g=t=>{const e=t.target.closest("[data-bar]");e&&_(Number(e.dataset.bar))},f=t=>{t.target.closest("[data-bar]")&&(u.hidden=!0)};return s.addEventListener("mouseover",g),s.addEventListener("mouseout",f),s.addEventListener("focusin",g),s.addEventListener("focusout",f),{node:c,cleanup:()=>{s.removeEventListener("mouseover",g),s.removeEventListener("mouseout",f),s.removeEventListener("focusin",g),s.removeEventListener("focusout",f)}}}function O(o=[],m={}){const{formatValue:r=a=>L(a),tone:i="brand",showRank:p=!1}=m,l=w("div",{class:"bar-list"}),d=Math.max(...o.map(a=>Number(a.value)||0),1);return l.innerHTML=n`
    ${o.map((a,c)=>b(n`
        <div class="bar-list__row">
          ${p?n`<span class="bar-list__rank"
                >${L(c+1)}</span
              >`:""}
          ${a.icon?n`<span class="bar-list__icon"
                >${b(E(a.icon,{size:16}))}</span
              >`:""}
          <div class="grow">
            <div class="row row--between">
              <span class="fs-sm fw-semibold">${a.label}</span>
              <span class="fs-sm">${r(a.value)}</span>
            </div>
            <div class="meter">
              <div
                class="meter__fill meter__fill--${i}"
                style="width:${Math.round(Number(a.value)/d*100)}%"
              ></div>
            </div>
            ${a.hint?n`<span class="fs-xs text-soft">${a.hint}</span>`:""}
          </div>
        </div>
      `))}
  `.toString(),{node:l,cleanup:()=>{}}}function R(o=[],m={}){const{size:r=180,thickness:i=22,centerLabel:p="",centerValue:l=""}=m,d=w("div",{class:"chart chart--donut"}),a=o.reduce((s,_)=>s+(Number(_.value)||0),0);if(!a)return d.innerHTML=n`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString(),{node:d,cleanup:()=>{}};const c={brand:"#0b6b52",mint:"#12a37b",teal:"#0d6f7d",blue:"#2b6ea8",gold:"#b3873b",neutral:"#8aa79d"},v=(r-i)/2,$=2*Math.PI*v;let h=0;const u=o.map((s,_)=>{const f=(Number(s.value)||0)/a,t=f*$,e={...s,color:c[s.tone]||Object.values(c)[_%6],dash:`${t} ${$-t}`,offset:-h,percent:Math.round(f*100)};return h+=t,e});return d.innerHTML=n`
    <div class="donut">
      <svg
        viewBox="0 0 ${r} ${r}"
        class="donut__svg"
        role="img"
        aria-label="نمودار سهم بخش‌ها"
      >
        <g transform="rotate(-90 ${r/2} ${r/2})">
          ${u.map(s=>b(n`
              <circle
                cx="${r/2}"
                cy="${r/2}"
                r="${v}"
                fill="none"
                stroke="${s.color}"
                stroke-width="${i}"
                stroke-dasharray="${s.dash}"
                stroke-dashoffset="${s.offset}"
                stroke-linecap="butt"
              />
            `))}
        </g>
      </svg>

      <div class="donut__center">
        <span class="donut__value"
          >${l||L(a)}</span
        >
        ${p?n`<span class="donut__label">${p}</span>`:""}
      </div>
    </div>

    <div class="donut__legend">
      ${u.map(s=>b(n`
          <div class="donut__legend-row">
            <span
              class="donut__swatch"
              style="background:${s.color}"
            ></span>
            <span class="fs-sm grow">${s.label}</span>
            <span class="fs-sm fw-semibold"
              >${L(s.percent)}٪</span
            >
          </div>
        `))}
    </div>
  `.toString(),{node:d,cleanup:()=>{}}}function B(o=[],m={}){const{width:r=120,height:i=34,tone:p="brand"}=m,l=w("span",{class:`sparkline sparkline--${p}`});if(o.length<2)return l.innerHTML="",{node:l,cleanup:()=>{}};const d=Math.max(...o),a=Math.min(...o),c=d-a||1,v=o.map(($,h)=>{const u=h/(o.length-1)*r,s=i-($-a)/c*(i-4)-2;return`${u.toFixed(1)},${s.toFixed(1)}`});return l.innerHTML=n`
    <svg
      viewBox="0 0 ${r} ${i}"
      width="${r}"
      height="${i}"
      aria-hidden="true"
    >
      <polyline
        points="${v.join(" ")}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `.toString(),{node:l,cleanup:()=>{}}}export{O as b,R as d,N as r,B as s};

import{e as l,bh as y,b as k,bi as w,h as i,r as s,I as N,_ as H,j as u,i as n,s as c,q as o,aW as r,t as d,o as L}from"./index-c305d6a7.js";import"./data-f43f95cf.js";const M=[{icon:"shieldCheck",title:"اصالت بدون استثنا",text:"همه محصولات از تأمین‌کنندگان رسمی و دارای مجوز تهیه می‌شوند. تاریخ انقضا و شرایط نگهداری هر کالا پیش از ارسال کنترل می‌شود."},{icon:"stethoscope",title:"داروساز در دسترس",text:"تیم داروسازان ما در تمام ساعات کاری پاسخگوی پرسش‌های دارویی شماست؛ از تداخل دارویی تا روش درست مصرف."},{icon:"truck",title:"دسترسی سریع",text:"ارسال همان‌روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴، ارسال رایگان بالای آستانه تعیین‌شده و امکان تحویل حضوری از شعبه."},{icon:"users",title:"شفافیت با مشتری",text:"قیمت‌ها و شرایط ارسال و بازگشت کالا روشن و بدون هزینه پنهان است. هر تغییری در سفارش، به شما اطلاع داده می‌شود."}],g=[{year:"۱۳۹",title:"شروع دارومیکس",text:"با یک داروخانه و یک تیم کوچک داروسازی."},{year:"۱۴۰",title:"راه‌اندازی فروش آنلاین",text:"ارسال به سراسر کشور و افزودن پرداخت آنلاین."},{year:"۱۴۰۱",title:"خدمات نسخه الکترونیکی",text:"ثبت آنلاین نسخه و بررسی داروساز."},{year:"۱۴۰۲",title:"مشاوره دارویی رایگان",text:"رزرو آنلاین زمان مشاوره با داروساز متخصص."},{year:"۱۴۰۳",title:"شعبه‌های بیشتر",text:"گسترش شعبه‌های حضوری و تحویل سریع شهری."}];async function C(){const a=l("div"),v=y(),p=k(),b=w();a.innerHTML=i`
    <div class="shell">
      ${s(N([{label:"خانه",href:"/"},{label:"درباره دارومیکس"}]))}
      ${s(H({title:"درباره دارومیکس",text:"دارومیکس یک داروخانه آنلاین است که خرید دارو، مکمل و محصولات سلامت را ساده، سریع و مطمئن می‌کند. تیم داروسازان ما در تمام مراحل خرید و مصرف در کنار شماست."}))}

      <!-- ===================== Hero band ===================== -->
      <div class="promo-band glass--brand mb-8">
        <div>
          <h2 class="promo-band__title">سلامت شما، مسئولیت ما</h2>
          <p class="promo-band__text">
            از یک داروخانه محلی شروع کردیم و امروز با ده‌ها برند معتبر و هزاران
            محصول سلامت، در خدمت مشتریان سراسر کشور هستیم. باور ما این است که
            دسترسی به دارو و مشاوره درست، نباید سخت باشد.
          </p>
          <div class="row mt-6">
            <a class="btn btn--glass btn--lg" href="${u("/catalog")}">
              ${s(n("bag",{size:18}))} مشاهده محصولات
            </a>
            <a
              class="btn btn--ghost btn--lg"
              href="${u("/contact")}"
              style="color:#f4fffb"
            >
              ${s(n("phone",{size:18}))} تماس با ما
            </a>
          </div>
        </div>
        <div class="promo__art">
          <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <path
              d="M60 96S22 72 22 47a21 21 0 0 1 38-12 21 21 0 0 1 38 12C98 72 60 96 60 96Z"
              stroke="currentColor"
              stroke-width="4.5"
              stroke-linejoin="round"
            />
            <path
              d="M42 58h10l5-11 7 22 5-11h9"
              stroke="currentColor"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- ===================== Stats ===================== -->
      <div class="auto-grid auto-grid--wide mb-8" data-slot="stats"></div>

      <!-- ===================== Values ===================== -->
      <section class="section">
        ${s(c({title:"ارزش‌های ما",subtitle:"چهار اصلی که تصمیم‌های روزمره دارومیکس را شکل می‌دهد.",iconName:"award"}))}
        <div class="auto-grid auto-grid--wide" data-slot="values"></div>
      </section>

      <!-- ===================== Story timeline ===================== -->
      <section class="section">
        ${s(c({title:"مسیر دارومیکس",subtitle:"از یک داروخانه محلی تا خدمات سلامت آنلاین.",iconName:"history"}))}
        <ol class="timeline" data-slot="timeline"></ol>
      </section>

      <!-- ===================== Guarantees ===================== -->
      <section class="section">
        ${s(c({title:"تعهدات ما به شما",subtitle:"چیزهایی که می‌توانید همیشه روی آن‌ها حساب کنید.",iconName:"shieldCheck"}))}
        <div class="glass-2 radius-xl p-6" data-slot="guarantees"></div>
      </section>

      <!-- ===================== Brands ===================== -->
      <section class="section">
        ${s(c({title:"برندهایی که با آن‌ها کار می‌کنیم",subtitle:"همکاری با برندهای شناخته‌شده داخلی و بین‌المللی حوزه سلامت.",iconName:"verified",actionHref:"/catalog",actionLabel:"محصولات"}))}
        <div class="auto-grid auto-grid--tight" data-slot="brands"></div>
      </section>

      <!-- ===================== Demo notice ===================== -->
      <section class="section section--tight">
        <div class="alert alert--info">
          ${s(n("info",{size:18}))}
          <span
            >این یک پروژه نمایشی است. تمام محصولات، برندها، قیمت‌ها و آمار این
            صفحه داده‌های ساختگی هستند و هیچ ادعای تجاری یا پزشکی واقعی
            ندارند.</span
          >
        </div>
      </section>
    </div>
  `.toString();const m=o('[data-slot="stats"]',a);[r({label:"محصول فعال",value:d(v.total),iconName:"bag",tone:"brand",hint:"در دسته‌بندی‌های مختلف سلامت"}),r({label:"برند همکار",value:d(p.length),iconName:"verified",tone:"mint",hint:"داخلی و بین‌المللی"}),r({label:"مقاله سلامت",value:d(b.total),iconName:"bookmark",tone:"gold",hint:"بازبینی‌شده توسط کارشناسان"}),r({label:"رضایت مشتریان",value:`${d("۹۸")}٪`,iconName:"star",tone:"blue",hint:"بر اساس بازخورد نمایشی"})].forEach(t=>m.append(t));const f=o('[data-slot="values"]',a);M.forEach(t=>{const e=l("div",{class:"feature glass radius-lg"});e.innerHTML=i`
      <span class="feature__icon">${s(n(t.icon,{size:22}))}</span>
      <div>
        <h3 class="feature__title">${t.title}</h3>
        <p class="feature__text">${t.text}</p>
      </div>
    `.toString(),f.append(e)});const $=o('[data-slot="timeline"]',a);g.forEach((t,e)=>{const h=l("li",{class:`timeline__item${e===g.length-1?" is-last":""}`});h.innerHTML=i`
      <span class="timeline__dot" aria-hidden="true"></span>
      <span class="timeline__year">${t.year}</span>
      <div class="timeline__body">
        <h3 class="timeline__title">${t.title}</h3>
        <p class="timeline__text">${t.text}</p>
      </div>
    `.toString(),$.append(h)});const _=o('[data-slot="guarantees"]',a),x=["ارسال همان‌روز برای سفارش‌های ثبت‌شده تا ساعت ۱۴","ارسال رایگان بالای آستانه تعیین‌شده در سراسر کشور","تضمین اصالت و تاریخ انقضای معتبر برای همه کالاها","مشاوره رایگان داروساز پیش از خرید دارو","امکان تحویل حضوری از شعبه‌های دارومیکس","بازگشت کالای غیر دارویی تا ۷ روز در صورت باز نشدن بسته‌بندی"];_.innerHTML=i`
    <div class="auto-grid auto-grid--wide">
      ${x.map(t=>s(i`
          <div class="row row--sm">
            <span class="text-success"
              >${s(n("checkCircle",{size:19}))}</span
            >
            <span class="fs-sm">${t}</span>
          </div>
        `))}
    </div>
  `.toString();const S=o('[data-slot="brands"]',a);return p.slice(0,12).forEach(t=>{const e=l("a",{class:"brand-tile glass radius-lg",href:u("/catalog",{brand:t.id})});e.innerHTML=i`
      ${s(L(t))}
      <span>${t.name}</span>
      <span class="fs-xs text-soft">${t.country}</span>
    `.toString(),S.append(e)}),{node:a,title:"درباره دارومیکس",cleanup:()=>{}}}export{C as default};

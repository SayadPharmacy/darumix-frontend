import{e as _,h as d,r as s,I as $,_ as x,i as e,j as p,s as b,q as c,bf as w,w as k,ap as y,A as m,bg as z}from"./index-c305d6a7.js";import"./data-f43f95cf.js";const q=[{id:"br-1",name:"داروخانه مرکزی دارومیکس",city:"تهران",address:"خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲",phone:"۰۲۱-۸۷۶۵۴۳۲",hours:"همه روزه ۸:۰۰ تا ۲۳:۰۰",services:["تحویل حضوری","مشاوره داروساز","کنترل فشار و قند"],isMain:!0},{id:"br-2",name:"شعبه سعادت‌آباد",city:"تهران",address:"بلوار دریا، نبش خیابان مطهری، پلاک ۴۵",phone:"۰۲۱-۲۳۴۵",hours:"همه روزه ۹:۰۰ تا ۲:۰۰",services:["تحویل حضوری","مشاوره داروساز"]},{id:"br-3",name:"شعبه کرج",city:"کرج",address:"میدان طالقانی، ابتدای خیابان شهید بهشتی",phone:"۰۲۶-۳۴۵۶۷",hours:"شنبه تا پنجشنبه ۸:۳۰ تا ۲۱:۳۰",services:["تحویل حضوری","لوازم پزشکی"]}],S=["پیگیری سفارش","مشکل در تحویل کالا","سوال درباره نسخه","درخواست مرجوعی","همکاری و نمایندگی","انتقاد یا پیشنهاد","سایر موارد"];async function A(){const i=_("div"),r=[],t=y();i.innerHTML=d`
    <div class="shell">
      ${s($([{label:"خانه",href:"/"},{label:"تماس و شعبه‌ها"}]))}
      ${s(x({title:"تماس با دارومیکس",text:"کارشناسان ما هر روز از ۸ صبح تا ۱۰ شب پاسخگوی شما هستند. از راه‌های زیر با ما در ارتباط باشید یا پیام خود را ثبت کنید."}))}

      <!-- ===================== Contact channels ===================== -->
      <div class="auto-grid auto-grid--wide mb-8">
        <a class="feature glass radius-lg" href="tel:02188765432">
          <span class="feature__icon">${s(e("phone",{size:22}))}</span>
          <div>
            <h3 class="feature__title">تماس تلفنی</h3>
            <p class="feature__text">۰۲۱-۸۷۶۵۴۳۲ — روزهای کاری ۸ تا ۲</p>
          </div>
        </a>

        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${s(e("message",{size:22}))}</span
          >
          <div>
            <h3 class="feature__title">پشتیبانی آنلاین</h3>
            <p class="feature__text">
              پاسخ‌گویی در بازه‌های کاری از طریق فرم همین صفحه.
            </p>
          </div>
        </div>

        <div class="feature glass radius-lg">
          <span class="feature__icon">${s(e("mail",{size:22}))}</span>
          <div>
            <h3 class="feature__title">ایمیل</h3>
            <p class="feature__text">support@darumix-demo.ir (نمایشی)</p>
          </div>
        </div>

        <div class="feature glass radius-lg">
          <span class="feature__icon"
            >${s(e("stethoscope",{size:22}))}</span
          >
          <div>
            <h3 class="feature__title">مشاوره داروساز</h3>
            <p class="feature__text">
              <a class="fw-bold" href="${p("/consultation")}"
                >رزرو زمان مشاوره</a
              >
            </p>
          </div>
        </div>
      </div>

      <div class="split">
        <!-- ===================== Contact form ===================== -->
        <form class="glass radius-xl contact-form" data-contact-form novalidate>
          <h2 class="mb-4">ارسال پیام</h2>
          <p class="text-muted fs-sm">
            فرم زیر را پر کنید؛ در نسخه واقعی پیام شما به تیم پشتیبانی ارسال و
            با ایمیل یا تلفن پیگیری می‌شود.
          </p>

          <div class="form-grid form-grid--2 mt-4">
            <div class="field">
              <label class="field__label" for="ct-name"
                >نام و نام خانوادگی
                <span class="field__required">*</span></label
              >
              <input
                class="input"
                id="ct-name"
                name="name"
                value="${(t==null?void 0:t.name)||""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-phone"
                >شماره تماس <span class="field__required">*</span></label
              >
              <input
                class="input"
                id="ct-phone"
                name="phone"
                inputmode="tel"
                value="${(t==null?void 0:t.phone)||""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-email">ایمیل (اختیاری)</label>
              <input
                class="input"
                id="ct-email"
                name="email"
                type="email"
                value="${(t==null?void 0:t.email)||""}"
              />
            </div>
            <div class="field">
              <label class="field__label" for="ct-reason">موضوع</label>
              <select class="select" id="ct-reason" name="reason">
                ${S.map(a=>s(d`<option value="${a}">${a}</option>`))}
              </select>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label class="field__label" for="ct-message"
                >متن پیام <span class="field__required">*</span></label
              >
              <textarea
                class="textarea"
                id="ct-message"
                name="message"
                rows="5"
                placeholder="پیام خود را بنویسید…"
              ></textarea>
              <span class="field__error" data-form-error hidden></span>
            </div>
          </div>

          <label class="check mt-4">
            <input type="checkbox" data-consent />
            <span class="check__box">${s(e("check",{size:13}))}</span>
            <span class="check__text"
              >با ثبت پیام، می‌پذیرم اطلاعات وارد‌شده برای پاسخ‌گویی استفاده
              شود.</span
            >
          </label>

          <button class="btn btn--primary btn--lg mt-6" type="submit">
            ${s(e("send",{size:18}))} ارسال پیام
          </button>

          <div class="alert alert--info mt-4">
            ${s(e("lock",{size:18}))}
            <span
              >این فرم نمایشی است و پیام شما به هیچ سروری ارسال نمی‌شود؛ فقط
              به‌صورت اعلان محلی ثبت می‌گردد.</span
            >
          </div>
        </form>

        <!-- ===================== Map placeholder ===================== -->
        <div class="glass radius-xl map-placeholder">
          <div class="map-placeholder__inner">
            <span class="map-placeholder__pin"
              >${s(e("marker",{size:34}))}</span
            >
            <h3 class="mb-2">نقشه تعاملی</h3>
            <p class="text-muted fs-sm mb-0">
              در نسخه واقعی، نقشه شعبه‌ها و مسیریابی اینجا نمایش داده می‌شود.
              مقصد فعلی: داروخانه مرکزی، خیابان ولیعصر، تهران.
            </p>
            <span class="fs-xs text-soft mt-4"
              >عرض جغرافیایی ۳۵٫۷۴۳۱ — طول جغرافیایی ۵۱٫۴۱۰۴</span
            >
          </div>
        </div>
      </div>

      <!-- ===================== Branches ===================== -->
      <section class="section">
        ${s(b({title:"شعبه‌های دارومیکس",subtitle:"می‌توانید سفارش خود را از نزدیک‌ترین شعبه حضوری تحویل بگیرید.",iconName:"store"}))}
        <div class="auto-grid auto-grid--wide" data-slot="branches"></div>
      </section>

      <!-- ===================== Short FAQ ===================== -->
      <section class="section section--tight">
        ${s(b({title:"پرسش‌های سریع",subtitle:"شاید پاسخ سوال شما همین‌جا باشد.",iconName:"help",actionHref:"/faq",actionLabel:"همه سوالات"}))}
        <div data-slot="quick"></div>
      </section>
    </div>
  `.toString();const g=c('[data-slot="branches"]',i);q.forEach(a=>{const n=_("article",{class:"branch glass radius-xl"});n.innerHTML=d`
      <div class="branch__head">
        <span class="branch__icon">${s(e("store",{size:22}))}</span>
        <div>
          <h3 class="branch__title">${a.name}</h3>
          <span class="fs-xs text-soft"
            >${a.city}${a.isMain?" · شعبه مرکزی":""}</span
          >
        </div>
        ${a.isMain?d`<span class="badge badge--brand">اصلی</span>`:""}
      </div>

      <div class="branch__body">
        <div class="row row--sm fs-sm">
          ${s(e("marker",{size:16}))}
          <span>${a.address}</span>
        </div>
        <div class="row row--sm fs-sm">
          ${s(e("phone",{size:16}))}
          <a href="tel:${a.phone}">${a.phone}</a>
        </div>
        <div class="row row--sm fs-sm">
          ${s(e("clock",{size:16}))}
          <span>${a.hours}</span>
        </div>
      </div>

      <div class="chip-row mt-3">
        ${a.services.map(l=>s(d`<span class="chip chip--static">${l}</span>`))}
      </div>

      <a class="btn btn--glass btn--sm mt-4" href="${p("/catalog")}">
        ${s(e("bag",{size:15}))} خرید و تحویل از این شعبه
      </a>
    `.toString(),g.append(n)});const u=w({items:[{id:"q1",title:"چقدر طول می‌کشد تا پیام من پاسخ داده شود؟",content:"<p>پیام‌های ثبت‌شده در ساعات کاری معمولاً کمتر از یک ساعت کاری پاسخ داده می‌شوند. پیام‌های خارج از ساعت کاری، اولین ساعت کاری بعد پیگیری می‌شوند.</p>",open:!0},{id:"q2",title:"آیا می‌توانم سفارشم را حضوری تحویل بگیرم؟",content:"<p>بله. در مرحله انتخاب روش ارسال، «تحویل حضوری از داروخانه» را انتخاب کنید و شعبه مورد نظر را در بخش تماس ببینید.</p>"},{id:"q3",title:"برای مشاوره دارویی چه کنم؟",content:`<p>از صفحه <a href="${p("/consultation")}">مشاوره داروساز</a> زمان رزرو کنید؛ مشاوره در این نسخه نمایشی رایگان است.</p>`}],multiple:!0});return c('[data-slot="quick"]',i).append(u.node),r.push(u.cleanup),r.push(k(i,"submit","[data-contact-form]",a=>{var h;a.preventDefault();const n=c("[data-contact-form]",i),l=c("[data-form-error]",i),f=o=>{var v;return((v=c(`[name="${o}"]`,n))==null?void 0:v.value.trim())||""};if(["name","phone","message"].filter(o=>!f(o)).length){l.hidden=!1,l.textContent="پر کردن فیلدهای ستاره‌دار الزامی است.",m.warn("فرم ناقص است","لطفاً فیلدهای الزامی را کامل کنید.");return}if(!((h=c("[data-consent]",i))!=null&&h.checked)){l.hidden=!1,l.textContent="برای ارسال پیام، پذیرش شرط استفاده الزامی است.",m.warn("پذیرش شرط الزامی است");return}l.hidden=!0,z({type:"system",title:`پیام شما ثبت شد — ${f("reason")}`,text:"کارشناسان دارومیکس در اولین فرصت با شما تماس می‌گیرند.",href:"#/contact"}),n.reset(),m.success("پیام شما ثبت شد","در اولین فرصت کاری با شما تماس می‌گیریم. از همراهی شما سپاسگزاریم.")})),{node:i,title:"تماس و شعبه‌ها",cleanup:()=>r.forEach(a=>a())}}export{A as default};

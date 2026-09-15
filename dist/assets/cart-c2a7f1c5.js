import{e as y,w as f,ab as D,ac as w,ad as q,h as i,r as e,I as _,_ as x,q as v,Q as C,t as k,i as l,j as b,L as p,ae as E,k as L,a5 as P,af as A,Y as M,ag as S,ah as I,A as m,y as T,ai as U,aj as F,D as H,ak as R}from"./index-c305d6a7.js";import"./data-f43f95cf.js";async function N(){const c=y("div"),u=[],h={coupon:null},$=[];function d(){$.splice(0).forEach(a=>a());const t=D(),o=w(),s=q({coupon:h.coupon});if(!t.length){c.innerHTML=i`
        <div class="shell">
          ${e(_([{label:"خانه",href:"/"},{label:"سبد خرید"}]))}
          ${e(x({title:"سبد خرید",text:"سبد خرید شما در حال حاضر خالی است."}))}
          <div data-slot="empty" class="mt-8"></div>
        </div>
      `.toString(),v('[data-slot="empty"]',c).append(C({iconName:"cart",title:"سبد خرید شما خالی است",text:"محصولی را از فروشگاه انتخاب کنید تا اینجا نمایش داده شود. اگر مطمئن نیستید از کجا شروع کنید، پرفروش‌ترین‌ها را ببینید.",action:{label:"شروع خرید",variant:"btn--primary",href:"/catalog"}}).node);return}c.innerHTML=i`
      <div class="shell">
        ${e(_([{label:"خانه",href:"/"},{label:"سبد خرید"}]))}
        ${e(x({title:"سبد خرید",text:`${k(o.lines)} محصول در سبد شما قرار دارد.`}))}

        <div class="cart-layout">
          <!-- ======================= Lines ======================= -->
          <div>
            ${o.requiresPrescription?i`
                  <div class="alert alert--warn">
                    ${e(l("prescription",{size:18}))}
                    <span
                      >در سبد شما داروی نیازمند نسخه وجود دارد. برای تکمیل سفارش
                      لازم است نسخه را ثبت کنید.
                      <a class="fw-bold" href="${b("/prescription")}"
                        >ثبت نسخه</a
                      ></span
                    >
                  </div>
                `:""}

            <div class="stack" data-slot="lines"></div>

            <div class="row row--between mt-6">
              <a class="btn btn--glass btn--sm" href="${b("/catalog")}">
                ${e(l("arrowRight",{size:16}))} ادامه خرید
              </a>
              <button
                class="btn btn--ghost btn--sm text-danger"
                type="button"
                data-clear-cart
              >
                ${e(l("trash",{size:16}))} خالی کردن سبد
              </button>
            </div>
          </div>

          <!-- ======================= Summary ======================= -->
          <aside class="cart-summary glass-2 radius-xl">
            <h2 class="cart-summary__title">خلاصه سفارش</h2>

            <!-- Free-shipping meter -->
            <div class="free-ship">
              ${o.qualifiesFreeShipping?i`
                    <div class="row row--sm text-success">
                      ${e(l("truck",{size:17}))}
                      <span class="fs-sm fw-semibold"
                        >ارسال شما رایگان است</span
                      >
                    </div>
                  `:i`
                    <p class="fs-sm mb-2">
                      تا ارسال رایگان
                      <strong
                        >${p(o.freeShippingGap,{withUnit:!1})}
                        تومان</strong
                      >
                      باقی مانده
                    </p>
                  `}
              ${e(E(o.freeShippingProgress,"brand"))}
            </div>

            <!-- Coupon -->
            <form class="coupon" data-coupon-form novalidate>
              <label class="field__label" for="coupon-input">کد تخفیف</label>
              <div class="row row--nowrap">
                <input
                  class="input"
                  id="coupon-input"
                  name="code"
                  placeholder="مثلاً DARUMIX10"
                  value="${s.couponCode}"
                  autocomplete="off"
                />
                <button class="btn btn--glass" type="submit">
                  ${e(l("tag",{size:16}))} اعمال
                </button>
              </div>
              <p class="field__hint" data-coupon-hint>
                کدهای نمایشی: DARUMIX10، WELCOME50، SALAMAT15، FREESHIP
              </p>
            </form>

            <!-- Totals -->
            <div class="summary-rows">
              <div class="summary-row">
                <span
                  >جمع کالاها (${k(o.units)} عدد)</span
                >
                <span>${p(s.subtotal)}</span>
              </div>

              ${s.savings?i`
                    <div class="summary-row text-success">
                      <span>سود شما از خرید</span>
                      <span>${p(s.savings)}</span>
                    </div>
                  `:""}

              <div class="summary-row">
                <span>هزینه ارسال</span>
                <span>
                  ${s.shippingFree?i`<span class="text-success fw-bold">رایگان</span>`:p(s.shipping)}
                </span>
              </div>

              ${s.discount?i`
                    <div class="summary-row text-success">
                      <span>تخفیف ${s.couponCode}</span>
                      <span>−${p(s.discount)}</span>
                    </div>
                  `:""}

              <div class="summary-row summary-row--total">
                <span>مبلغ قابل پرداخت</span>
                <span>${p(s.total)}</span>
              </div>
            </div>

            <button
              class="btn btn--primary btn--lg btn--block mt-4"
              type="button"
              data-checkout
            >
              ${e(l("creditCard",{size:18}))} ادامه فرآیند خرید
            </button>

            <div class="trust-tile mt-4">
              ${e(l("shieldCheck",{size:16}))}
              <span
                >پرداخت امن؛ در این نسخه نمایشی پرداخت واقعی انجام
                نمی‌شود.</span
              >
            </div>
          </aside>
        </div>
      </div>
    `.toString();const n=v('[data-slot="lines"]',c);t.forEach(a=>{const r=y("article",{class:"cart-line glass radius-lg","data-product-id":a.productId});r.innerHTML=i`
        <a
          class="cart-line__media"
          href="${b(`/product/${a.product.slug}`)}"
          aria-label="${a.product.name}"
        >
          ${e(L(a.product))}
        </a>

        <div class="cart-line__body">
          <span class="p-card__brand">${a.product.brandName}</span>
          <h3 class="cart-line__title">
            <a href="${b(`/product/${a.product.slug}`)}"
              >${a.product.name}</a
            >
          </h3>
          ${a.variant?i`<span class="fs-xs text-soft"
                >بسته‌بندی: ${a.variant}</span
              >`:""}
          ${a.inStock?i`<span class="fs-xs text-success"
                >${e(l("check",{size:12}))} موجود</span
              >`:i`<span class="fs-xs text-danger"
                >ناموجود — لطفاً حذف کنید</span
              >`}
        </div>

        <div class="cart-line__qty" data-slot="qty"></div>

        <div class="cart-line__price">
          <span class="price">
            <span class="price__now"
              >${p(a.lineTotal,{withUnit:!1})}</span
            >
            <span class="price__unit">تومان</span>
          </span>
          ${a.quantity>1?i`<span class="fs-xs text-soft"
                >واحد: ${p(a.unitPrice,{withUnit:!1})}
                تومان</span
              >`:""}
        </div>

        <div class="cart-line__actions">
          <button
            class="icon-btn"
            type="button"
            data-line-wishlist
            data-tip="انتقال به علاقه‌مندی‌ها"
            aria-label="انتقال ${a.product.name} به علاقه‌مندی‌ها"
          >
            ${e(l("heart",{size:17}))}
          </button>
          <button
            class="icon-btn"
            type="button"
            data-line-remove
            data-tip="حذف از سبد"
            aria-label="حذف ${a.product.name} از سبد"
          >
            ${e(l("trash",{size:17}))}
          </button>
        </div>
      `.toString();const g=P({value:a.quantity,min:1,max:a.maxQuantity,size:"sm",onChange:z=>{A(a.productId,z),d()}});v('[data-slot="qty"]',r).append(g.node),$.push(g.cleanup),n.append(r)})}return u.push(f(c,"click","[data-line-remove]",async(t,o)=>{t.preventDefault();const s=o.closest("[data-product-id]"),n=s==null?void 0:s.dataset.productId;if(!n)return;const a=M(n);await S({title:"حذف از سبد خرید",message:`«${(a==null?void 0:a.name)||"این محصول"}» از سبد خرید حذف شود؟`,confirmLabel:"حذف کن",danger:!0})&&(I(n),m.info("از سبد خرید حذف شد",a==null?void 0:a.name),d())})),u.push(f(c,"click","[data-line-wishlist]",(t,o)=>{t.preventDefault();const s=o.closest("[data-product-id]"),n=s==null?void 0:s.dataset.productId;n&&(T(n),I(n),m.success("به علاقه‌مندی‌ها منتقل شد"),d())})),u.push(f(c,"click","[data-clear-cart]",async t=>{t.preventDefault(),await S({title:"خالی کردن سبد خرید",message:"همه کالاهای سبد خرید حذف شوند؟ این کار قابل بازگشت نیست.",confirmLabel:"خالی کن",danger:!0})&&(U(),m.info("سبد خرید خالی شد"),d())})),u.push(f(c,"click","[data-checkout]",t=>{if(t.preventDefault(),F()){m.warn("سبد خرید خالی است");return}H("/checkout")})),u.push(f(c,"submit","[data-coupon-form]",(t,o)=>{t.preventDefault();const s=v('input[name="code"]',o),n=v("[data-coupon-hint]",c),a=(s==null?void 0:s.value.trim())||"";if(!a){h.coupon=null,n&&(n.textContent="کد تخفیف حذف شد."),d();return}const r=R(a,w().subtotal);if(!r.ok){n&&(n.textContent=r.reason),m.error("کد تخفیف پذیرفته نشد",r.reason);return}h.coupon=r.coupon,m.success("کد تخفیف اعمال شد",r.coupon.label),d()})),d(),{node:c,title:"سبد خرید",cleanup:()=>{$.splice(0).forEach(t=>t()),u.forEach(t=>t())}}}export{N as default};

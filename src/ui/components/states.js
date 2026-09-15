/**
 * DARUMIX — full-page state components.
 *
 * The router imports `errorPage` here when a route module fails to load, so
 * this file exists independently of `ui/components/common.js` (which holds the
 * section-level states used by pages).
 */

import { html, raw, el } from "../../core/dom.js";
import { icon } from "../icons.js";
import { navigate } from "../../core/router.js";

/**
 * Centred full-page state.
 * @param {{title?: string, text?: string, iconName?: string, actions?: {label: string, href?: string, onClick?: () => void, variant?: string}[]}} options
 */
export function statePage(options = {}) {
  const {
    title = "چیزی برای نمایش نیست",
    text = "",
    iconName = "info",
    tone = "neutral",
    actions = [],
  } = options;

  const node = el("div", { class: "shell shell--narrow" });
  node.innerHTML = html`
    <div class="state-page state-page--${tone}">
      <span class="state-page__icon">${raw(icon(iconName, { size: 40 }))}</span>
      <h1 class="state-page__title">${title}</h1>
      ${text ? html`<p class="state-page__text">${text}</p>` : ""}
      <div class="state-page__actions" data-slot="actions"></div>
    </div>
  `.toString();

  const slot = node.querySelector('[data-slot="actions"]');

  actions.forEach((action) => {
    if (action.href) {
      const link = el("a", {
        class: `btn ${action.variant || "btn--primary"}`,
        href: action.href,
        text: action.label,
      });
      slot.append(link);
    } else {
      const button = el("button", {
        class: `btn ${action.variant || "btn--glass"}`,
        type: "button",
        text: action.label,
      });
      button.addEventListener("click", () => {
        if (typeof action.onClick === "function") action.onClick();
      });
      slot.append(button);
    }
  });

  return { node };
}

/** Something went wrong loading a route. */
export function errorPage(options = {}) {
  return statePage({
    iconName: "alert",
    tone: "error",
    title: "بارگذاری صفحه ناموفق بود",
    text: "مشکلی در نمایش این بخش پیش آمد. لطفاً صفحه را دوباره بارگذاری کنید.",
    actions: [
      {
        label: "تلاش مجدد",
        variant: "btn--primary",
        onClick: () => window.location.reload(),
      },
      { label: "بازگشت به خانه", variant: "btn--glass", href: "#/" },
    ],
    ...options,
  });
}

/** Success confirmation page (checkout, prescription, consultation). */
export function successPage(options = {}) {
  return statePage({
    iconName: "checkCircle",
    tone: "success",
    title: "با موفقیت انجام شد",
    ...options,
  });
}

/** Generic informational page. */
export function infoPage(options = {}) {
  return statePage({ iconName: "info", tone: "info", ...options });
}

export { navigate };
export default statePage;

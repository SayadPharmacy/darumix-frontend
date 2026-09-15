/**
 * DARUMIX — modal dialogs and toast notifications.
 *
 * Both are global singletons mounted once in main.js and driven by the app
 * event bus, so any component can open a dialog or raise a toast without
 * importing the shell.
 */

import {
  html,
  raw,
  el,
  qs,
  delegate,
  on,
  lockScroll,
  unlockScroll,
  trapFocus,
  nextFrame,
} from "../../core/dom.js";
import { icon } from "../icons.js";
import { appEvents, EVENTS } from "../../core/event-bus.js";

/* ==========================================================================
   Modal
   ========================================================================== */

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {string|HTMLElement} [options.body]
 * @param {string|HTMLElement} [options.footer]
 * @param {'sm'|'md'|'lg'|'xl'} [options.size]
 * @param {boolean} [options.dismissible]  Esc + backdrop close
 * @param {() => void} [options.onClose]
 */
export function modal(options = {}) {
  const {
    title = "",
    subtitle = "",
    body = "",
    footer = "",
    size = "md",
    dismissible = true,
    onClose,
  } = options;

  const backdrop = el("div", {
    class: "modal-backdrop",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title || "پنجره",
  });

  backdrop.innerHTML = html`
    <div class="modal modal--${size}" role="document">
      <header class="modal__header">
        <div class="grow">
          <h2 class="modal__title">${title}</h2>
          ${subtitle ? html`<p class="modal__sub">${subtitle}</p>` : ""}
        </div>
        ${dismissible
          ? html`<button
              class="icon-btn"
              type="button"
              data-modal-close
              aria-label="بستن"
            >
              ${raw(icon("close", { size: 20 }))}
            </button>`
          : ""}
      </header>
      <div class="modal__body" data-slot="body"></div>
      <footer class="modal__footer" data-slot="footer" hidden></footer>
    </div>
  `.toString();

  const bodySlot = qs('[data-slot="body"]', backdrop);
  const footerSlot = qs('[data-slot="footer"]', backdrop);

  function setSlot(slot, content) {
    if (content instanceof HTMLElement) {
      slot.innerHTML = "";
      slot.append(content);
      return;
    }

    slot.innerHTML = content == null ? "" : String(content);
  }

  setSlot(bodySlot, body);

  if (footer) {
    setSlot(footerSlot, footer);
    footerSlot.hidden = false;
  }

  let releaseFocus = () => {};
  let isOpen = false;
  const disposers = [];

  function close() {
    if (!isOpen) return;
    isOpen = false;

    backdrop.classList.remove("is-open");
    unlockScroll();
    releaseFocus();

    window.setTimeout(() => backdrop.remove(), 260);
    if (onClose) onClose();
  }

  disposers.push(
    delegate(backdrop, "click", "[data-modal-close]", (event) => {
      event.preventDefault();
      close();
    }),
  );

  disposers.push(
    on(backdrop, "click", (event) => {
      if (dismissible && event.target === backdrop) close();
    }),
  );

  disposers.push(
    on(window, "keydown", (event) => {
      if (dismissible && event.key === "Escape" && isOpen) close();
    }),
  );

  const instance = {
    node: backdrop,
    body: bodySlot,
    footer: footerSlot,

    open() {
      if (isOpen) return;
      isOpen = true;

      document.body.append(backdrop);
      lockScroll();

      // Two frames: append, then flip the class so the transition animates.
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        releaseFocus = trapFocus(backdrop);
      });
    },

    close,

    setBody: (content) => setSlot(bodySlot, content),

    setFooter(content) {
      if (content == null || content === "") {
        footerSlot.innerHTML = "";
        footerSlot.hidden = true;
        return;
      }

      setSlot(footerSlot, content);
      footerSlot.hidden = false;
    },

    destroy() {
      close();
      disposers.forEach((dispose) => dispose());
    },
  };

  return instance;
}

/**
 * Confirm dialog. Returns a promise resolving to true/false — much simpler
 * than threading callbacks through destructive actions.
 *
 * @param {{title: string, message: string, confirmLabel?: string, cancelLabel?: string, danger?: boolean}} options
 */
export function confirmDialog(options = {}) {
  const {
    title = "تأیید عملیات",
    message = "آیا از انجام این کار مطمئن هستید؟",
    confirmLabel = "تأیید",
    cancelLabel = "انصراف",
    danger = false,
  } = options;

  return new Promise((resolve) => {
    let settled = false;

    const dialog = modal({
      title,
      size: "sm",
      body: html`<p class="mb-0 text-muted">${message}</p>`.toString(),
      footer:
        `<button class="btn btn--ghost" type="button" data-confirm-cancel>${cancelLabel}</button>` +
        `<button class="btn ${danger ? "btn--danger" : "btn--primary"}" type="button" data-confirm-ok>${confirmLabel}</button>`,
      onClose: () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      },
    });

    const finish = (value) => {
      if (settled) return;
      settled = true;
      dialog.close();
      resolve(value);
    };

    dialog.node.addEventListener("click", (event) => {
      if (event.target.closest("[data-confirm-ok]")) {
        event.preventDefault();
        finish(true);
      } else if (event.target.closest("[data-confirm-cancel]")) {
        event.preventDefault();
        finish(false);
      }
    });

    dialog.open();

    // Focus confirm so Enter works immediately for mouse-free flows.
    nextFrame().then(() => qs("[data-confirm-ok]", dialog.node)?.focus());
  });
}

/* ==========================================================================
   Toasts
   ========================================================================== */

const TOAST_ICONS = {
  success: "checkCircle",
  error: "alert",
  warn: "alert",
  info: "info",
};

/** Mount the toast stack once; listens on the bus for `ui:toast`. */
export function toastStack() {
  const node = el("div", {
    class: "toast-stack",
    role: "region",
    "aria-live": "polite",
    "aria-label": "پیام‌های سیستم",
  });

  const active = new Set();

  function dismiss(toast) {
    if (!toast.isConnected) return;

    toast.classList.add("is-leaving");
    active.delete(toast);
    window.setTimeout(() => toast.remove(), 240);
  }

  function show(options = {}) {
    const {
      title = "",
      message = "",
      type = "success",
      duration = 4200,
      action = null,
    } = options;

    // Cap the stack: a burst of messages must never cover the page.
    if (active.size >= 4) dismiss([...active][0]);

    const toast = el("div", { class: `toast toast--${type}`, role: "status" });

    toast.innerHTML = html`
      <span class="toast__icon" aria-hidden="true"
        >${raw(icon(TOAST_ICONS[type] || "info", { size: 18 }))}</span
      >
      <div class="toast__body">
        ${title ? html`<p class="toast__title">${title}</p>` : ""}
        ${message ? html`<p class="toast__msg">${message}</p>` : ""}
        ${action
          ? html`<button
              class="btn btn--soft btn--xs mt-2"
              type="button"
              data-toast-action
            >
              ${action.label}
            </button>`
          : ""}
      </div>
      <button class="toast__close" type="button" aria-label="بستن پیام">
        ${raw(icon("close", { size: 15 }))}
      </button>
      ${duration > 0
        ? html`<span
            class="toast__timer"
            style="animation-duration:${duration}ms"
          ></span>`
        : ""}
    `.toString();

    toast.addEventListener("click", (event) => {
      if (event.target.closest("[data-toast-action]") && action) {
        action.onClick?.();
        dismiss(toast);
        return;
      }

      if (event.target.closest(".toast__close")) dismiss(toast);
    });

    node.append(toast);
    active.add(toast);

    if (duration > 0) {
      window.setTimeout(() => dismiss(toast), duration);
    }

    return toast;
  }

  const dispose = appEvents.on(EVENTS.toast, (payload) => show(payload));

  return {
    node,
    show,
    dismiss,
    clear: () => active.forEach(dismiss),
    cleanup: dispose,
  };
}

/** Convenience wrappers used across pages. */
export const toast = {
  success: (title, message, extra = {}) =>
    appEvents.emit(EVENTS.toast, { type: "success", title, message, ...extra }),
  error: (title, message, extra = {}) =>
    appEvents.emit(EVENTS.toast, { type: "error", title, message, ...extra }),
  warn: (title, message, extra = {}) =>
    appEvents.emit(EVENTS.toast, { type: "warn", title, message, ...extra }),
  info: (title, message, extra = {}) =>
    appEvents.emit(EVENTS.toast, { type: "info", title, message, ...extra }),
};

/* ==========================================================================
   Route progress bar
   ========================================================================== */

export function progressBar() {
  const node = el("div", { class: "progress-bar", "aria-hidden": "true" });

  const disposeStart = appEvents.on(EVENTS.loadingStart, () =>
    node.classList.add("is-active"),
  );
  const disposeEnd = appEvents.on(EVENTS.loadingEnd, () => {
    window.setTimeout(() => node.classList.remove("is-active"), 180);
  });

  return {
    node,
    cleanup: () => {
      disposeStart();
      disposeEnd();
    },
  };
}

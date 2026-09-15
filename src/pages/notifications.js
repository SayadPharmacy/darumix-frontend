/**
 * DARUMIX — notifications centre.
 *
 * Type filtering plus mark-as-read. Seeded demo notifications keep their read
 * state in a separate id list so the fixtures themselves stay immutable (see
 * account.markRead).
 */

import { html, raw, el, qs, delegate } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { to, updateQuery } from "../core/router.js";
import { toPersianDigits, formatRelativeTime } from "../core/format.js";
import {
  breadcrumbs,
  pageIntro,
  emptyState,
  tabs,
} from "../ui/components/common.js";
import { toast, confirmDialog } from "../ui/components/overlays.js";
import { NOTIFICATION_TYPES } from "../data/statuses.js";
import * as account from "../services/account.js";

export default async function notificationsPage({ query = {} } = {}) {
  const node = el("div");
  const disposers = [];

  const activeType = NOTIFICATION_TYPES[query.type] ? query.type : "all";
  const showUnreadOnly = query.unread === "1";

  /**
   * Mark-as-read is local-state work: the cleanest correct refresh is to ask the
   * router to re-render the current route, which re-reads the store and
   * re-applies the read overlay in one pass.
   */
  async function refreshView() {
    const { refresh } = await import("../core/router.js");
    refresh();
  }

  /* -------------------------------------------------------------------------
     Data
     ------------------------------------------------------------------------- */

  const all = account.notifications();
  const readIds = account.readNotificationIds();

  /** Apply the local read-state overlay so demo seeds respect "mark read". */
  const decorated = all.map((entry) => ({
    ...entry,
    read: entry.read || readIds.has(entry.id),
  }));

  const visible = decorated
    .filter((entry) => activeType === "all" || entry.type === activeType)
    .filter((entry) => !showUnreadOnly || !entry.read);

  const unread = decorated.filter((entry) => !entry.read).length;

  /* -------------------------------------------------------------------------
     Shell
     ------------------------------------------------------------------------- */

  node.innerHTML = html`
    <div class="shell">
      ${raw(
        breadcrumbs([
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          { label: "اعلان‌ها" },
        ]),
      )}
      ${raw(
        pageIntro({
          title: "اعلان‌ها",
          text: unread
            ? `${toPersianDigits(unread)} اعلان خوانده‌نشده دارید.`
            : "همه اعلان‌های شما خوانده شده است.",
        }),
      )}

      <div class="glass radius-lg p-6">
        <div data-slot="tabs"></div>

        <div class="row row--between mt-4">
          <label class="switch">
            <input
              type="checkbox"
              data-unread-only
              ${showUnreadOnly ? "checked" : ""}
            />
            <span class="switch__track"></span>
            <span>فقط خوانده‌نشده‌ها</span>
          </label>

          <div class="row row--sm">
            <button
              class="btn btn--glass btn--sm"
              type="button"
              data-mark-all
              ${unread ? "" : "disabled"}
            >
              ${raw(icon("check", { size: 15 }))} خواندن همه
            </button>
            <button
              class="btn btn--ghost btn--sm text-danger"
              type="button"
              data-clear-all
            >
              ${raw(icon("trash", { size: 15 }))} پاک کردن اعلان‌ها
            </button>
          </div>
        </div>
      </div>

      <div class="stack mt-6" data-slot="list"></div>
    </div>
  `.toString();

  /* -------------------------------------------------------------------------
     Type tabs
     ------------------------------------------------------------------------- */

  const typeCounts = Object.entries(NOTIFICATION_TYPES).map(([id, meta]) => ({
    id,
    label: meta.label,
    count: decorated.filter((entry) => entry.type === id).length,
  }));

  const tabBar = tabs({
    items: [
      { id: "all", label: "همه", icon: "bell", count: decorated.length },
      ...typeCounts.filter((entry) => entry.count > 0),
    ],
    active: activeType,
    variant: "pill-tabs",
    onChange: (id) => updateQuery({ type: id === "all" ? null : id }),
  });

  qs('[data-slot="tabs"]', node).append(tabBar.node);
  disposers.push(tabBar.cleanup);

  /* -------------------------------------------------------------------------
     List
     ------------------------------------------------------------------------- */

  const listSlot = qs('[data-slot="list"]', node);

  if (!visible.length) {
    listSlot.append(
      emptyState({
        iconName: "bell",
        title: showUnreadOnly
          ? "اعلان خوانده‌نشده‌ای ندارید"
          : "در این بخش اعلانی نیست",
        text: showUnreadOnly
          ? "همه اعلان‌های شما خوانده شده است. با ثبت سفارش یا نسخه، اعلان جدید دریافت می‌کنید."
          : "با ثبت سفارش، نسخه یا نظر، اعلان‌های مربوطه اینجا نمایش داده می‌شوند.",
        compact: true,
      }).node,
    );
  } else {
    visible.forEach((entry) => {
      const meta = NOTIFICATION_TYPES[entry.type] || NOTIFICATION_TYPES.system;

      const card = el("article", {
        class: `notification-card glass radius-lg${entry.read ? "" : " is-unread"}`,
        "data-notification-id": entry.id,
      });

      card.innerHTML = html`
        <span class="notification-card__icon badge--${meta.tone}">
          ${raw(icon(meta.icon, { size: 19 }))}
        </span>

        <div class="grow">
          <div class="row row--sm">
            <span class="notification-card__title">${entry.title}</span>
            ${entry.read
              ? ""
              : html`<span class="notification-card__new">جدید</span>`}
          </div>

          <p class="notification-card__text mb-0">${entry.text}</p>

          <div class="row row--sm fs-xs text-soft mt-2">
            <span class="badge badge--neutral">${meta.label}</span>
            <span>${formatRelativeTime(entry.createdAt)}</span>
            ${entry.demo ? html`<span>· نمونه نمایشی</span>` : ""}
          </div>
        </div>

        <div class="notification-card__actions">
          ${entry.href
            ? html`
                <a
                  class="btn btn--glass btn--xs"
                  href="${entry.href}"
                  data-open-notification="${entry.id}"
                >
                  مشاهده
                </a>
              `
            : ""}
          ${entry.read
            ? ""
            : html`<button
                class="btn btn--ghost btn--xs"
                type="button"
                data-read="${entry.id}"
              >
                خواندم
              </button>`}
        </div>
      `.toString();

      listSlot.append(card);
    });
  }

  /* -------------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------------- */

  disposers.push(
    delegate(node, "click", "[data-read]", (event, button) => {
      event.preventDefault();
      account.markRead(button.dataset.read);
      refreshView();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-open-notification]", (event, button) => {
      // Mark it read, but let the link navigate normally.
      account.markRead(button.dataset.openNotification);
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-mark-all]", (event) => {
      event.preventDefault();
      account.markAllRead();
      toast.success("همه اعلان‌ها خوانده شد");
      refreshView();
    }),
  );

  disposers.push(
    delegate(node, "click", "[data-clear-all]", async (event) => {
      event.preventDefault();

      const ok = await confirmDialog({
        title: "پاک کردن اعلان‌ها",
        message:
          "همه اعلان‌های شما پاک شوند؟ اعلان‌های نمایشی نیز خوانده‌شده در نظر گرفته می‌شوند.",
        confirmLabel: "پاک کن",
        danger: true,
      });

      if (!ok) return;

      account.markAllRead();
      account.clearNotifications();
      toast.info("اعلان‌ها پاک شدند");
      refreshView();
    }),
  );

  disposers.push(
    delegate(node, "change", "[data-unread-only]", (event, input) => {
      updateQuery({ unread: input.checked ? "1" : null });
    }),
  );

  return {
    node,
    title: "اعلان‌ها",
    cleanup: () => disposers.forEach((dispose) => dispose()),
  };
}

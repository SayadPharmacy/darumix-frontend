/**
 * DARUMIX — chart components.
 *
 * Hand-rolled SVG so the app ships zero chart dependencies. Every helper
 * returns `{ node, cleanup }` to match the component contract used elsewhere.
 */

import { html, raw, el, qs } from "../../core/dom.js";
import { icon } from "../icons.js";
import {
  toPersianDigits,
  formatCompactPrice,
  formatDate,
} from "../../core/format.js";

/**
 * Vertical bar chart with a hover tooltip.
 *
 * @param {Array<object>} data
 * @param {object} [options]
 * @param {string} [options.valueKey]
 * @param {string} [options.labelKey]
 * @param {number} [options.height]
 * @param {(value: number) => string} [options.formatValue]
 * @param {(label: any, index: number) => string} [options.formatLabel]
 * @param {string} [options.tone='brand']
 */
export function revenueChart(data = [], options = {}) {
  const {
    valueKey = "value",
    labelKey = "label",
    height = 200,
    formatValue = (value) => formatCompactPrice(value),
    formatLabel = (label) =>
      label instanceof Date ? formatDate(label) : String(label),
    tone = "brand",
  } = options;

  const node = el("div", { class: "chart chart--bars" });

  if (!data.length) {
    node.innerHTML = html`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString();
    return { node, cleanup: () => {} };
  }

  const values = data.map((entry) => Number(entry[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const bars = data.map((entry, index) => ({
    value: values[index],
    label: formatLabel(entry[labelKey], index),
    percent: Math.round((values[index] / max) * 100),
    original: entry,
  }));

  node.innerHTML = html`
    <div class="chart__plot" style="height:${height}px">
      ${bars.map((bar, index) =>
        raw(html`
          <div class="chart__col" data-bar="${index}" tabindex="0">
            <span class="chart__value">${formatValue(bar.value)}</span>
            <span
              class="chart__bar chart__bar--${tone}"
              style="height:${Math.max(2, bar.percent)}%"
            ></span>
          </div>
        `),
      )}
    </div>
    <div class="chart__axis">
      ${bars.map((bar, index) =>
        raw(
          html`<span
            class="chart__tick${index % 2 ? " chart__tick--muted" : ""}"
            >${bar.label}</span
          >`,
        ),
      )}
    </div>
  `.toString();

  /* Tooltip is a single floating node positioned from the hovered column. */
  const tooltip = el("div", { class: "chart__tooltip", hidden: true });
  node.append(tooltip);

  const plot = qs(".chart__plot", node);

  const showTip = (index) => {
    const bar = bars[index];
    if (!bar) return;

    const column = qs(`[data-bar="${index}"]`, node);
    if (!column) return;

    tooltip.hidden = false;
    tooltip.innerHTML = html`
      <span class="chart__tooltip-label">${bar.label}</span>
      <span class="chart__tooltip-value">${formatValue(bar.value)}</span>
    `.toString();

    const columnRect = column.getBoundingClientRect();
    const plotRect = plot.getBoundingClientRect();
    tooltip.style.left = `${columnRect.left - plotRect.left + columnRect.width / 2}px`;
  };

  const onOver = (event) => {
    const column = event.target.closest("[data-bar]");
    if (column) showTip(Number(column.dataset.bar));
  };

  const onOut = (event) => {
    if (event.target.closest("[data-bar]")) tooltip.hidden = true;
  };

  plot.addEventListener("mouseover", onOver);
  plot.addEventListener("mouseout", onOut);
  plot.addEventListener("focusin", onOver);
  plot.addEventListener("focusout", onOut);

  return {
    node,
    cleanup: () => {
      plot.removeEventListener("mouseover", onOver);
      plot.removeEventListener("mouseout", onOut);
      plot.removeEventListener("focusin", onOver);
      plot.removeEventListener("focusout", onOut);
    },
  };
}

/**
 * Horizontal bar list — good for ranked data (traffic sources, top products).
 *
 * @param {Array<{label: string, value: number, icon?: string, hint?: string}>} data
 */
export function barList(data = [], options = {}) {
  const {
    formatValue = (value) => toPersianDigits(value),
    tone = "brand",
    showRank = false,
  } = options;

  const node = el("div", { class: "bar-list" });
  const max = Math.max(...data.map((entry) => Number(entry.value) || 0), 1);

  node.innerHTML = html`
    ${data.map((entry, index) =>
      raw(html`
        <div class="bar-list__row">
          ${showRank
            ? html`<span class="bar-list__rank"
                >${toPersianDigits(index + 1)}</span
              >`
            : ""}
          ${entry.icon
            ? html`<span class="bar-list__icon"
                >${raw(icon(entry.icon, { size: 16 }))}</span
              >`
            : ""}
          <div class="grow">
            <div class="row row--between">
              <span class="fs-sm fw-semibold">${entry.label}</span>
              <span class="fs-sm">${formatValue(entry.value)}</span>
            </div>
            <div class="meter">
              <div
                class="meter__fill meter__fill--${tone}"
                style="width:${Math.round((Number(entry.value) / max) * 100)}%"
              ></div>
            </div>
            ${entry.hint
              ? html`<span class="fs-xs text-soft">${entry.hint}</span>`
              : ""}
          </div>
        </div>
      `),
    )}
  `.toString();

  return { node, cleanup: () => {} };
}

/**
 * Donut chart for part-of-whole data.
 *
 * @param {Array<{label: string, value: number, tone?: string}>} data
 */
export function donutChart(data = [], options = {}) {
  const {
    size = 180,
    thickness = 22,
    centerLabel = "",
    centerValue = "",
  } = options;

  const node = el("div", { class: "chart chart--donut" });

  const total = data.reduce(
    (sum, entry) => sum + (Number(entry.value) || 0),
    0,
  );

  if (!total) {
    node.innerHTML = html`<p class="text-muted fs-sm mb-0">
      داده‌ای برای نمایش نیست.
    </p>`.toString();
    return { node, cleanup: () => {} };
  }

  const TONE_COLORS = {
    brand: "#0b6b52",
    mint: "#12a37b",
    teal: "#0d6f7d",
    blue: "#2b6ea8",
    gold: "#b3873b",
    neutral: "#8aa79d",
  };

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((entry, index) => {
    const value = Number(entry.value) || 0;
    const fraction = value / total;
    const length = fraction * circumference;

    const segment = {
      ...entry,
      color: TONE_COLORS[entry.tone] || Object.values(TONE_COLORS)[index % 6],
      dash: `${length} ${circumference - length}`,
      offset: -offset,
      percent: Math.round(fraction * 100),
    };

    offset += length;
    return segment;
  });

  node.innerHTML = html`
    <div class="donut">
      <svg
        viewBox="0 0 ${size} ${size}"
        class="donut__svg"
        role="img"
        aria-label="نمودار سهم بخش‌ها"
      >
        <g transform="rotate(-90 ${size / 2} ${size / 2})">
          ${segments.map((segment) =>
            raw(html`
              <circle
                cx="${size / 2}"
                cy="${size / 2}"
                r="${radius}"
                fill="none"
                stroke="${segment.color}"
                stroke-width="${thickness}"
                stroke-dasharray="${segment.dash}"
                stroke-dashoffset="${segment.offset}"
                stroke-linecap="butt"
              />
            `),
          )}
        </g>
      </svg>

      <div class="donut__center">
        <span class="donut__value"
          >${centerValue || toPersianDigits(total)}</span
        >
        ${centerLabel
          ? html`<span class="donut__label">${centerLabel}</span>`
          : ""}
      </div>
    </div>

    <div class="donut__legend">
      ${segments.map((segment) =>
        raw(html`
          <div class="donut__legend-row">
            <span
              class="donut__swatch"
              style="background:${segment.color}"
            ></span>
            <span class="fs-sm grow">${segment.label}</span>
            <span class="fs-sm fw-semibold"
              >${toPersianDigits(segment.percent)}٪</span
            >
          </div>
        `),
      )}
    </div>
  `.toString();

  return { node, cleanup: () => {} };
}

/**
 * Sparkline — a tiny trend line for KPI tiles and tables.
 *
 * @param {number[]} values
 */
export function sparkline(values = [], options = {}) {
  const { width = 120, height = 34, tone = "brand" } = options;
  const node = el("span", { class: `sparkline sparkline--${tone}` });

  if (values.length < 2) {
    node.innerHTML = "";
    return { node, cleanup: () => {} };
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  node.innerHTML = html`
    <svg
      viewBox="0 0 ${width} ${height}"
      width="${width}"
      height="${height}"
      aria-hidden="true"
    >
      <polyline
        points="${points.join(" ")}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `.toString();

  return { node, cleanup: () => {} };
}

export default { revenueChart, barList, donutChart, sparkline };

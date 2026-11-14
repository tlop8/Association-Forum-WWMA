"use strict";

const dashboardChartStates = new WeakMap();

function updateChartDetails(container, preview) {
  const state = dashboardChartStates.get(container);
  const key = preview ?? state.selected;
  const point = state.points.find((item) => item.key === key);
  const detail = container.querySelector(".chart-detail");
  const title = point?.label ?? (state.points.length ? "Explore the chart" : "No data for this view");
  const description = point?.detail ?? (state.points.length
    ? "Hover or focus for details. Select to keep them visible."
    : container.dataset.empty ?? "Try a different quarter, program, or year.");
  if (detail.firstElementChild.textContent !== title) detail.firstElementChild.textContent = title;
  if (detail.lastElementChild.textContent !== description) detail.lastElementChild.textContent = description;
  for (const marker of container.querySelectorAll("[data-chart-key]")) {
    marker.setAttribute("aria-pressed", String(marker.dataset.chartKey === state.selected));
  }
}

function setupChart(container) {
  const state = {points: [], selected: null, signature: ""};
  dashboardChartStates.set(container, state);

  const keyFrom = (event) => event.target.closest("[data-chart-key]")?.dataset.chartKey;
  container.addEventListener("pointerover", (event) => {
    const key = keyFrom(event);
    if (key) updateChartDetails(container, key);
  });
  container.addEventListener("pointerout", (event) => {
    const previous = keyFrom(event);
    const next = event.relatedTarget?.closest?.("[data-chart-key]")?.dataset.chartKey;
    if (previous && previous !== next) updateChartDetails(container, next);
  });
  container.addEventListener("focusin", (event) => {
    const key = keyFrom(event);
    if (key) updateChartDetails(container, key);
  });
  container.addEventListener("focusout", (event) => {
    if (keyFrom(event)) updateChartDetails(container, event.relatedTarget?.dataset?.chartKey);
  });
  function select(key) {
    state.selected = state.selected === key ? null : key;
    updateChartDetails(container);
  }
  container.addEventListener("click", (event) => {
    const key = keyFrom(event);
    if (key) select(key);
  });
  container.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      state.selected = null;
      updateChartDetails(container);
    }
    if (event.target.matches(".chart-slice") && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      select(keyFrom(event));
    }
  });
  return state;
}

function renderInteractiveChart(id, points, markup, animate) {
  const container = document.getElementById(id);
  const state = dashboardChartStates.get(container) ?? setupChart(container);
  const signature = JSON.stringify(points);
  if (state.signature === signature) return;
  const focused = container.contains(document.activeElement) ? document.activeElement : null;
  const focusKey = focused?.dataset.chartKey;
  const focusTag = focused?.localName;
  state.signature = signature;
  state.points = points;
  if (!points.some(({key}) => key === state.selected)) state.selected = null;
  container.innerHTML = `<div class="chart-detail" role="status"><strong></strong><p></p></div>
    <div class="${animate ? "chart-enter" : ""}">${markup}</div>`;
  updateChartDetails(container);
  if (focusKey) {
    const next = container.querySelector(`${focusTag}[data-chart-key="${focusKey}"]`);
    next?.focus({preventScroll: true});
  }
}

function renderDashboardBars(id, points, animate) {
  const max = Math.max(1, ...points.flatMap(({value, target}) => [value, target ?? 0]));
  const markup = points.map(({key, label, caption, value, target, tone = ""}) => {
    const marker = target > 0
      ? `<i class="chart-target" style="left:${Math.min(99.5, target / max * 100)}%"></i>` : "";
    return `<button type="button" class="chart-bar-button" data-chart-key="${key}">
      <span class="bar-caption"><strong>${label}</strong><span class="${tone}">${caption}</span></span>
      <span class="demo-bar-track" aria-hidden="true">
        <span class="interactive-bar ${tone}" style="width:${value / max * 100}%"></span>${marker}
      </span></button>`;
  }).join("");
  renderInteractiveChart(id, points, `<div class="bar-list interactive-bars">${markup}</div>`, animate);
}

function renderRegistrationColumns(points, series, animate) {
  const totalAt = (index) => series.reduce((sum, {values}) => sum + values[index], 0);
  const max = Math.max(1, ...series.flatMap(({id, values}) =>
    values.map((value, index) => value + (id === "meeting" ? points[index].projection : 0))));
  const roughStep = max / 4;
  const unit = 10 ** Math.floor(Math.log10(roughStep));
  const step = [1, 2, 5, 10].map((multiple) => multiple * unit)
    .find((candidate) => candidate >= roughStep && candidate >= 1) ?? 1;
  const top = step * 4;
  const ticks = [4, 3, 2, 1, 0].map((level) =>
    `<span style="--level:${level}">${number(level * step)}</span>`).join("");
  const columns = points.map(({key, label, month, projection}, index) => {
    const recorded = totalAt(index);
    const projectionLabel = projection ? ` plus ${number(projection)} projected` : "";
    const bars = series.map(({id, values, color}) => {
      const forecast = id === "meeting" && projection > 0;
      const value = values[index] + (forecast ? projection : 0);
      return `<i class="${forecast ? "registration-projection" : ""}" style="--share:${value / top * 100}%;--series-color:${color}"></i>`;
    }).join("");
    return `<button type="button" class="registration-chart-month" data-chart-key="${key}" aria-label="${label}: ${number(recorded)} new registrations${projectionLabel}">
      <span class="registration-bar-track" aria-hidden="true"><span class="registration-bar-group">${bars}</span></span>
      <span class="registration-month">${month}</span>
    </button>`;
  }).join("");
  const legend = series.map(({name, values, color}) =>
    `<li><i style="--series-color:${color}" aria-hidden="true"></i><span>${name}</span><strong>${number(values.reduce((sum, value) => sum + value, 0))}</strong></li>`).join("");
  const forecastLegend = points.some(({projection}) => projection > 0)
    ? '<li><i class="registration-projection" aria-hidden="true"></i><span>Projected by December 12</span></li>' : "";
  renderInteractiveChart("registrations-monthly", points, `
    <div class="registration-axis-title">New registrations</div>
    <div class="registration-chart-scroll">
      <div class="registration-plot" style="--months:${points.length};--plot-width:${points.length > 3 && series.length > 1 ? 500 : 0}px">
        <div class="registration-ticks" aria-hidden="true">${ticks}</div>
        <div class="registration-months">${columns}</div>
      </div>
    </div>
    <div class="registration-month-title">Booking month</div>
    <ul class="registration-legend" aria-label="Program registration totals for the displayed period">${legend}${forecastLegend}</ul>`, animate);
}

function pieWedge(start, fraction) {
  const center = 90;
  const radius = 80;
  const point = (turn) => {
    const angle = turn * 2 * Math.PI - Math.PI / 2;
    return `${center + radius * Math.cos(angle)} ${center + radius * Math.sin(angle)}`;
  };
  return `M ${center} ${center} L ${point(start)} A ${radius} ${radius} 0 ${Number(fraction > .5)} 1 ${point(start + fraction)} Z`;
}

function renderDashboardPie(id, points, animate, totalLabel) {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  let position = 0;
  const slices = points.filter(({value}) => value > 0).map(({key, label, caption, value, color}) => {
    const fraction = value / total;
    const attrs = `class="chart-slice" data-chart-key="${key}" role="button" tabindex="0" aria-label="${label}, ${caption}" fill="${color}"`;
    const shape = fraction === 1
      ? `<circle cx="90" cy="90" r="80" ${attrs}></circle>`
      : `<path d="${pieWedge(position, fraction)}" ${attrs}></path>`;
    position += fraction;
    return shape;
  }).join("");
  const legend = points.map(({key, label, caption, color}) =>
    `<button type="button" class="chart-legend-button" data-chart-key="${key}"><i style="background:${color}" aria-hidden="true"></i>
      <span>${label}</span><strong>${caption}</strong></button>`).join("");
  const plot = `${total ? slices : '<circle cx="90" cy="90" r="80" fill="#eaf0f6"></circle>'}
    <g class="pie-center" aria-hidden="true"><circle cx="90" cy="90" r="52" fill="white"></circle>
    <text x="90" y="96" text-anchor="middle">${totalLabel}</text></g>`;
  renderInteractiveChart(id, points, `<div class="pie-layout"><svg viewBox="0 0 180 180" role="group" aria-label="Interactive pie chart">${plot}</svg><div class="pie-legend">${legend}</div></div>`, animate);
}

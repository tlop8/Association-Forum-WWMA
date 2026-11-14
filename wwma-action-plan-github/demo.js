"use strict";

const element = (id) => document.getElementById(id);
const whole = new Intl.NumberFormat("en-US");
const dollars = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 0});
const number = (value) => whole.format(value);
const money = (value) => dollars.format(value);
const percent = (part, total) => total ? `${Math.round(100 * part / total)}%` : "—";
const signedMoney = (value) => `${value > 0 ? "+" : ""}${money(value)}`;
const revenueTone = (delta) => delta > 0 ? "positive" : delta < 0 ? "negative" : "";
const steps = ["quiz", "campaign", "dashboard"];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const displayOrder = ["meeting", "msk", "horse", "heat", "first-aid"];

let currentProgram = programs.find(({id}) => id === campaignEvents[0].id);
let currentStep;
let received = learners.length;
let replayTimer;
let metricsRows = [];
const savedEmails = new Map();
const barHistory = new Map();
const mixYears = {revenue: 2026, attendance: 2026};
const drillKeys = ["revenue", "attendance", "registrations", "membership", "clicks", "grants"];
let activeDrill = "";
let reportQuarter = "all";
let drilldowns = {};
let timelineYear = 2026;
let compareYear = 2025;

function shownLearners(period = "all") {
  return learners.slice(0, received).filter((learner) => period === "all" || learner.period === period);
}

function interestedIn(cohort, programId) {
  return cohort.filter((learner) => learner.topics.includes(programId)).length;
}

function countNeeds(cohort) {
  return memberNeeds.map((need, index) => ({
    ...need,
    count: cohort.filter((learner) => reportedNeed(learner, need, index)).length
  })).sort((left, right) => right.count - left.count);
}

function metrics(records) {
  return records.reduce((sum, record) => {
    for (const field of Object.keys(sum)) sum[field] += Number(record[field]);
    return sum;
  }, {delivered: 0, opened: 0, clicked: 0, registered: 0, attended: 0, refund: 0, revenue: 0});
}

function programRows(cohort, periodsInView) {
  const learnerIds = new Set(cohort.map(({id}) => id));
  const currentActivity = activity.filter((record) => learnerIds.has(record.learner));
  return displayOrder.map((id) => {
    const program = programs.find((item) => item.id === id);
    const [attendancePlan, revenuePlan] = periodsInView.reduce(([seats, budget], period) => [
      seats + plans[period.id][id][0], budget + plans[period.id][id][1]
    ], [0, 0]);
    return {...program, ...metrics(currentActivity.filter((record) => record.program === id)),
      interest: interestedIn(cohort, id), attendancePlan, revenuePlan};
  });
}

function aggregate(rows) {
  const activityTotal = metrics(rows);
  return {...activityTotal,
    capacity: rows.reduce((total, row) => total + (row.capacity ?? 0), 0),
    attendancePlan: rows.reduce((total, row) => total + row.attendancePlan, 0),
    revenuePlan: rows.reduce((total, row) => total + row.revenuePlan, 0)
  };
}

function metric(label, value, caption, tone = "") {
  return `<div class="panel action-kpi"><span>${label}</span><strong class="${tone}">${value}</strong><small>${caption}</small></div>`;
}

function bar(chart, label, caption, value, max, plan) {
  const actual = Math.min(100, 100 * value / max);
  const key = chart + "/" + label;
  const previous = barHistory.get(key) ?? 0;
  barHistory.set(key, actual);
  const planMarker = plan === undefined ? "" :
    `<i class="chart-target" style="left:${Math.min(99.5, 100 * plan / max)}%"></i>`;
  return `<div><div class="bar-caption"><strong>${label}</strong><span>${caption}</span></div>
    <div class="demo-bar-track" aria-hidden="true"><span class="demo-bar" style="--from:${previous}%;width:${actual}%"></span>${planMarker}</div></div>`;
}

function renderSurvey() {
  const role = element("survey-audience").value;
  const cohort = shownLearners().filter((learner) => role === "all" || learner.role === role);
  const needs = countNeeds(cohort);
  const topics = programs.map((program) => ({...program, count: interestedIn(cohort, program.id)}))
    .sort((left, right) => right.count - left.count);
  element("survey-status").textContent = received === learners.length
    ? "All 500 fictional submissions received."
    : `Receiving demo submissions · ${received} of ${learners.length}`;
  element("survey-kpis").innerHTML = [
    metric("Responses", number(cohort.length), role === "all" ? "Cowboys and cowgirls" : `From ${role.toLowerCase()} respondents`),
    metric("Top interest", number(topics[0].count), topics[0].topic),
    metric("Top reported need", number(needs[0].count), needs[0].label)
  ].join("");
  const max = Math.max(1, cohort.length);
  element("survey-topics").innerHTML = topics.map((topic) =>
    bar("survey-topics", topic.topic, `${number(topic.count)} · ${percent(topic.count, cohort.length)}`, topic.count, max)).join("");
  element("survey-needs").innerHTML = needs.map((need) =>
    bar("survey-needs", need.label, `${number(need.count)} · ${percent(need.count, cohort.length)}`, need.count, max)).join("");
  element("member-quote").innerHTML = `<p>“${needs[0].quote}”</p><cite>Illustrative member comment</cite>`;
}

function renderMarketing() {
  const cohort = shownLearners();
  const rows = programRows(cohort, periods);
  element("event-priorities").innerHTML = campaignEvents.map(({id, date}) => {
    const row = rows.find((program) => program.id === id);
    const {action, lead} = strategy[id];
    const evidence = row.id === "meeting"
      ? `${number(row.interest)} interested · ${number(annualMeeting.memberRegistrations)} member registrations`
      : `${number(row.interest)} interested · ${row.attended} attended · ${money(row.revenue)} net`;
    return `<button type="button" class="priority-row" data-event="${id}" aria-pressed="${id === currentProgram.id}">
      <span><strong>${row.name}</strong><small class="campaign-date">${date}</small><small>${action} · ${lead}</small><small>${evidence}</small></span><span aria-hidden="true">→</span></button>`;
  }).join("");
  element("sponsor-matches").innerHTML = countNeeds(cohort).map((need) => `
    <div class="sponsor-match"><div><p class="eyebrow">${number(need.count)} reported · ${need.label}</p><h4>${need.sponsor}</h4></div>
      <p>${need.product}</p><small>${need.activation}</small></div>`).join("");
}

function emailFor(program, count) {
  const plan = strategy[program.id];
  const cost = program.price ? `In-person registration is ${money(program.price)}.` : "Registration is free.";
  const copy = {
    meeting: "Meet other WWMA members and faculty for practical sessions on ranch health and peer learning. Complimentary stabling is available for your horse while you attend.",
    msk: "Join us for a hands-on lab on handling tack, feed, and gear. Bring your questions about saddle fit and staying comfortable on long rides.",
    horse: "Practice daily horse checks and safe handling in a hands-on setting, and learn what details to share when calling an equine veterinarian.",
    heat: "Learn how to plan water breaks, shade, and a refill station before a hot shift. Join live or catch the replay.",
    "first-aid": "Make a first-aid plan for remote rides, including your emergency contact plan and how to describe your location. Join live or catch the replay."
  };
  return `Subject: ${plan.subject}\n\nHowdy,\n\nIn our fictional learner survey, ${number(count)} members selected ${program.topic.toLowerCase()}. That’s why we’re featuring ${program.name}.\n\n${copy[program.id]} ${cost}\n\nLearn more and register: [Add event link]\n\nWWMA\n\nFictional WWMA promotion draft`;
}

function updateCampaign() {
  const cohort = shownLearners();
  const count = interestedIn(cohort, currentProgram.id);
  element("campaign-rationale").textContent = strategy[currentProgram.id].message;
  element("campaign-date").textContent = campaignDate(currentProgram.id);
  element("campaign-email").value = savedEmails.get(currentProgram.id) ?? emailFor(currentProgram, count);
}

function selectProgram(id, scroll = false) {
  const selected = programs.find((program) => program.id === id);
  if (!selected) return;
  currentProgram = selected;
  element("shared-program").value = id;
  element("email-status").textContent = "";
  renderMarketing();
  updateCampaign();
  renderEventPoster(selected);
  if (scroll) {
    element("shared-program").scrollIntoView({block: "center"});
    element("shared-program").focus({preventScroll: true});
  }
}

function optionsForPrograms() {
  const select = element("program-filter");
  const selected = select.value;
  const format = element("format-filter").value;
  select.replaceChildren(new Option("All programs", "all"), ...programs
    .filter((program) => format === "all" || program.format === format)
    .map((program) => new Option(program.name, program.id)));
  if ([...select.options].some((option) => option.value === selected)) select.value = selected;
}

function executiveRows(year, quarter) {
  const demoPeriods = periods.filter((period) => quarter === "all" || period.id.endsWith(quarter));
  const demoCohort = shownLearners().filter((learner) => demoPeriods.some(({id}) => id === learner.period));
  const current = year === 2026;
  const surveyRows = current ? programRows(demoCohort, demoPeriods) : [];
  const includeMeeting = quarter === "all" || quarter === annualMeeting.quarter;
  const meetingEmail = {delivered: 0, opened: 0, clicked: 0};
  if (current) {
    for (const [campaignQuarter, counts] of Object.entries(annualMeetingCampaign)) {
      if (quarter !== "all" && quarter !== campaignQuarter) continue;
      for (const field of Object.keys(meetingEmail)) meetingEmail[field] += counts[field];
    }
  }
  return displayOrder.map((id) => {
    const program = programs.find((item) => item.id === id);
    const historical = Object.entries(historicalOperations[year])
      .filter(([key]) => key === quarter || quarter === "all").map(([, entries]) => entries[id]).filter(Boolean);
    const [booked, checkedIn, net, seatPlan, budget] = historical.reduce((totals, values) =>
      totals.map((total, index) => total + values[index]), [0, 0, 0, 0, 0]);
    const survey = surveyRows.find((row) => row.id === id);
    const schedule = Object.entries(executiveSchedule[year])
      .filter(([key]) => key === quarter || quarter === "all").map(([, entries]) => entries[id]).filter(Boolean);
    const row = {
      ...program, ...metrics(survey ? [survey] : []),
      capacity: schedule.reduce((total, entry) => total + entry[1], 0), date: schedule[0]?.[0], sessions: schedule.length,
      venue: programVenues[id], attendancePlan: seatPlan + (survey?.attendancePlan ?? 0),
      revenuePlan: budget + (survey?.revenuePlan ?? 0), scheduled: schedule.length > 0,
      upcoming: false
    };
    row.registered += booked;
    row.attended += checkedIn;
    row.revenue += net;
    if (current && id === "meeting") {
      Object.assign(row, {
        ...meetingEmail,
        scheduled: includeMeeting, upcoming: includeMeeting,
        registered: includeMeeting ? annualMeeting.memberRegistrations + annualMeeting.guestRegistrations : 0,
        attended: null, attendancePlan: includeMeeting ? annualMeeting.memberGoal : 0,
        revenue: includeMeeting ? annualMeeting.memberRegistrations * annualMeeting.memberPrice +
          annualMeeting.guestRegistrations * annualMeeting.guestPrice : 0,
        revenuePlan: includeMeeting ? annualMeeting.memberGoal * annualMeeting.memberPrice : 0,
        refund: 0
      });
    }
    return row;
  });
}

function capacitySummary(row) {
  return row.capacity ? `${number(row.registered)} / ${number(row.capacity)}` : "—";
}

function programAction(row) {
  if (row.upcoming && annualMeeting.memberRegistrations < annualMeeting.memberGoal) {
    return `Recruit ${number(annualMeeting.memberGoal - annualMeeting.memberRegistrations)} more members to reach the attendance goal.`;
  }
  if (row.registered >= row.capacity && row.capacity > 0) return "Review the waitlist and plan extra capacity for the next session.";
  if (row.capacity > 0 && row.registered / row.capacity < .7) return "Review low seat fill and adjust outreach for the next session.";
  if (!row.upcoming && row.attendancePlan > 0 && row.attended / row.attendancePlan < .9) return "Review check-ins below 90% of plan and improve reminders.";
  if (row.revenuePlan > 0 && row.revenue < row.revenuePlan * .9) return "Review revenue below 90% of plan.";
  return "";
}

function actionMap(quarter) {
  const flags = new Map();
  for (const {id} of executiveQuarters.filter(({id}) => quarter === "all" || id === quarter)) {
    for (const row of executiveRows(2026, id).filter(({scheduled}) => scheduled)) {
      const action = programAction(row);
      if (action) flags.set(row.id, [...(flags.get(row.id) ?? []), {quarter: id, action}]);
    }
  }
  return flags;
}

function flagMarkup(flags = []) {
  return flags.length ? `<span class="status-pill needs-action">Needs action</span>
    <ul class="ceo-flag-list">${flags.map(({quarter, action}) => `<li><b>${quarter}:</b> ${action}</li>`).join("")}</ul>` :
    '<span class="status-pill on-track">On track</span>';
}

function registrationDate(row) {
  const [month, days] = row.date.split(" ");
  return `${calendarMonths.find((name) => name.startsWith(month))} ${days}, 2026`;
}

function registrationSessionDetails(sessions) {
  return `<ul class="registration-sessions">${sessions.map((session) => {
    const action = programAction(session);
    return `<li>
      <span class="registration-session-date">${registrationDate(session)}</span>
      <span class="status-pill ${action ? "needs-action" : "on-track"}">${action ? "Needs action" : "On track"}</span>
      ${action ? `<small>${action}</small>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

function membershipFor(quarter) {
  const rows = quarter === "all" ? Object.values(membershipByQuarter) : [membershipByQuarter[quarter]];
  return {
    active: rows.at(-1).active,
    renewed: rows.reduce((total, row) => total + row.renewed, 0),
    eligible: rows.reduce((total, row) => total + row.eligible, 0),
    joined: rows.reduce((total, row) => total + row.joined, 0)
  };
}

function executiveDrilldown(rows, membership, grantTotal, quarter) {
  const scheduled = rows.filter((row) => row.scheduled);
  const programList = (describe, programs = scheduled) => `<ul class="ceo-detail-list">${programs.map((row) =>
    `<li><strong>${row.name}</strong><div>${describe(row)}</div></li>`).join("")}</ul>`;
  const registrationSessions = activeDrill === "registrations" && quarter === "all"
    ? executiveQuarters.flatMap(({id}) => executiveRows(2026, id).filter(({scheduled}) => scheduled))
    : scheduled;
  return {
    revenue: ["Net registration revenue", "Compare the same reporting period across years. Net revenue counts registration payments less refunds, including payments for upcoming events.", ""],
    attendance: ["Actual attendance", "Check-ins from completed sessions in the selected quarter.",
      programList((row) => row.upcoming ? `Upcoming · ${annualMeeting.dates}` :
        `${number(row.attended)} check-ins · ${percent(row.attended, row.registered)} of registrations`)],
    registrations: ["Registrations by program", "",
      activeDrill === "registrations" ? programList((row) => `<b>${capacitySummary(row)}</b> booked · ${percent(row.registered, row.capacity)} filled
        ${row.upcoming ? `<br>${number(annualMeeting.memberRegistrations)} members · ${number(annualMeeting.guestRegistrations)} non-members` : ""}
        ${registrationSessionDetails(registrationSessions.filter(({id}) => id === row.id))}`) : ""],
    membership: ["Membership and retention", `${percent(membership.renewed, membership.eligible)} renewal rate for ${quarter === "all" ? "2026 year to date" : quarter + " 2026"}.`,
      `<ul class="ceo-detail-list"><li><strong>Active members</strong><span>${number(membership.active)}</span></li>
      <li><strong>Renewals</strong><span>${number(membership.renewed)} of ${number(membership.eligible)} due to renew</span></li>
      <li><strong>Not yet renewed</strong><span>${number(membership.eligible - membership.renewed)} of those due</span></li>
      <li><strong>New members</strong><span>${number(membership.joined)} joined</span></li>
      <li><strong>Annual meeting bookings (Q4)</strong><span>${number(annualMeeting.memberRegistrations)} members (${percent(annualMeeting.memberRegistrations, annualMeeting.memberRegistrations + annualMeeting.guestRegistrations)}) · ${number(annualMeeting.guestRegistrations)} non-members</span></li></ul>`],
    clicks: ["Campaign engagement", "Email activity by program for the selected period. Counts include repeat sends.",
      programList((row) => row.delivered
        ? `${number(row.delivered)} delivered · ${number(row.opened)} opened (${percent(row.opened, row.delivered)}) · ${number(row.clicked)} clicked (${percent(row.clicked, row.delivered)})`
        : "No campaign records in this period", rows.filter((row) => row.scheduled || row.delivered))],
    grants: ["2026 research grants", `${money(grantTotal)} awarded of ${money(grantBudget)} for the year · ${money(grantBudget - grantTotal)} remaining`,
      `<progress value="${grantTotal}" max="${grantBudget}" aria-label="Research grant budget awarded"></progress>
      ${quarter === "all" ? "" : `<p class="ceo-grant-period"><strong>${quarter} awards:</strong> ${money(researchGrants.filter((grant) => grant.quarter === quarter).reduce((sum, grant) => sum + grant.amount, 0))}</p>`}
      <ul class="ceo-detail-list">${researchGrants.filter((grant) => quarter === "all" || grant.quarter === quarter).map((grant) => `<li><strong>${grant.project}</strong><span>${grant.quarter} · ${money(grant.amount)}</span></li>`).join("")}</ul>`]
  };
}

function showDrilldown() {
  const panel = element("ceo-drilldown");
  panel.hidden = !activeDrill;
  element("ceo-overview-body").hidden = Boolean(activeDrill);
  element("revenue-focus").hidden = activeDrill !== "revenue";
  element("registrations-focus").hidden = activeDrill !== "registrations";
  if (!activeDrill) return;
  const [title, summary, details] = drilldowns[activeDrill];
  element("drill-title").textContent = title;
  element("drill-content").innerHTML = (summary ? `<p>${summary}</p>` : "") + details;
  if (activeDrill === "revenue") renderRevenueTimeline();
  if (activeDrill === "registrations") renderMonthlyRegistrations();
}

function renderMonthlyRegistrations() {
  const isYtd = reportQuarter === "all";
  const startMonth = isYtd ? 0 : executiveQuarters.findIndex(({id}) => id === reportQuarter) * 3;
  const endMonth = isYtd ? calendarMonths.length : startMonth + 3;
  const months = calendarMonths.slice(startMonth, endMonth);
  const bookings = new Map(displayOrder.map((id) => [id, Array(calendarMonths.length).fill(0)]));
  const projectedBookings = Array(calendarMonths.length).fill(0);
  const previousEventMonths = new Map();
  const selected = element("registrations-trend-program").value;
  const sessions = executiveQuarters.flatMap(({id}) => executiveRows(2026, id).filter(({scheduled}) => scheduled));
  const programSessions = sessions.filter(({id}) => id === selected);
  const sessionControl = element("registrations-trend-session");
  const chosenDate = sessionControl.value;
  element("registrations-session-filter").hidden = programSessions.length < 2;
  sessionControl.replaceChildren(new Option("All sessions", ""), ...programSessions.map((row) => new Option(registrationDate(row), row.date)));
  if (programSessions.some(({date}) => date === chosenDate)) sessionControl.value = chosenDate;
  for (const row of sessions) {
    const eventMonth = calendarMonths.findIndex((month) => month.startsWith(row.date.split(" ")[0]));
    const previousEvent = previousEventMonths.get(row.id);
    previousEventMonths.set(row.id, eventMonth);
    if (selected !== "all" && (row.id !== selected || (sessionControl.value && row.date !== sessionControl.value))) continue;
    const isMeeting = row.id === "meeting";
    const lastMonth = Math.min(eventMonth, registrationsSnapshotMonth);
    const leadMonths = isMeeting ? annualMeeting.marketingLeadMonths : 2;
    let firstMonth = Math.max(0, eventMonth - leadMonths);
    if (previousEvent !== undefined && eventMonth - previousEvent >= 3) {
      firstMonth = Math.max(firstMonth, previousEvent + 2);
    }
    const bookingMonths = lastMonth - firstMonth + 1;
    const monthlyBookings = bookings.get(row.id);
    // Spread each session's bookings over its registration window and reconcile to the recorded total.
    let allocated = 0;
    for (let index = 1; index <= bookingMonths; index++) {
      const share = index * (index + 3) / (bookingMonths * (bookingMonths + 3));
      const total = Math.round(row.registered * share);
      monthlyBookings[firstMonth + index - 1] += total - allocated;
      allocated = total;
    }
    if (isMeeting && eventMonth > registrationsSnapshotMonth) {
      projectedBookings[eventMonth] = Math.max(0, Math.min(annualMeeting.projectedRegistrations, row.capacity) - row.registered);
    }
  }
  const colors = ["#354fad", "#14724f", "#973964", "#ac441c", "#097483"];
  const series = displayOrder.map((id, index) => {
    const {name} = programs.find((program) => program.id === id);
    return {id, name, color: colors[index], values: bookings.get(id).slice(startMonth, endMonth)};
  }).filter(({id}) => selected === "all" || id === selected);
  const points = months.map((month, index) => {
    const projection = series.some(({id}) => id === "meeting") ? projectedBookings[startMonth + index] : 0;
    const detail = series.map(({name, values}) => `${name}: ${number(values[index])}`).join(" · ");
    const projectionNote = projection
      ? ` · Annual Meeting: ${number(annualMeeting.projectedRegistrations)} projected by opening day (December 12), including ${number(projection)} additional bookings` : "";
    return {key: month, label: `${month} 2026`, month: month.slice(0, 3), projection, detail: detail + projectionNote};
  });
  element("registrations-month-heading").textContent = isYtd ? "YTD registrations by month" : `${reportQuarter} registrations by month`;
  renderRegistrationColumns(points, series, received === learners.length);
}

function renderRevenueTimeline() {
  const isYtd = reportQuarter === "all";
  const years = compareYear ? [timelineYear, compareYear] : [timelineYear];
  const series = years.map((year) => ({
    year, rows: executiveRows(year, reportQuarter).filter(({scheduled}) => scheduled)
  }));
  const rows = series.flatMap((item) => item.rows);
  const shownPrograms = new Set(rows.map(({id}) => id));
  const totals = series.map((item) => aggregate(item.rows));
  const yearTitle = (year) => isYtd ? `${year}${year === 2026 ? " YTD" : ""}` : `${reportQuarter} ${year}`;
  element("revenue-program-heading").textContent = isYtd ? "Revenue by program" : "Event timeline";
  const delta = compareYear ? totals[0].revenue - totals[1].revenue : 0;
  element("revenue-totals").innerHTML = totals.map(({revenue, registered, capacity}, index) =>
    `<div><span>${yearTitle(years[index])} net revenue</span><strong>${money(revenue)}</strong>
    <small>${percent(registered, capacity)} booked · ${number(registered)} / ${number(capacity)} spots</small></div>`).join("") +
    (compareYear ? `<div><span>${timelineYear} vs. ${compareYear}</span><strong class="${revenueTone(delta)}">${signedMoney(delta)}</strong><small>Difference in net revenue</small></div>` : "");
  const revenuePlanRatios = rows.filter(({revenuePlan}) => revenuePlan > 0)
    .map(({revenue, revenuePlan}) => revenue / revenuePlan);
  const planScale = Math.max(1.25, ...revenuePlanRatios);
  const planMarker = 100 / planScale;
  const points = [];
  let groups;
  if (isYtd) {
    groups = [
      ["Annual Meeting", "Annual meeting"],
      ["Lab Courses", "Hands-on course"],
      ["Webinars", "Webinar"]
    ].map(([title, format]) => ({
      title,
      programIds: displayOrder.filter((id) => shownPrograms.has(id) && programs.find((program) => program.id === id).format === format)
    }));
  } else {
    const {id, months} = executiveQuarters.find((quarter) => quarter.id === reportQuarter);
    const firstDates = executiveSchedule[timelineYear][id];
    const secondDates = compareYear ? executiveSchedule[compareYear][id] : {};
    const dateOrder = (programId) => {
      const [month, day] = (firstDates[programId] ?? secondDates[programId])[0].split(" ");
      return ("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ").indexOf(month) * 32) + parseInt(day, 10);
    };
    groups = [{title: id, subtitle: months, programIds: [...shownPrograms].sort((a, b) => dateOrder(a) - dateOrder(b))}];
  }
  const markup = groups.filter(({programIds}) => programIds.length).map(({title, subtitle, programIds}) =>
    `<section class="timeline-group" aria-label="${title}${subtitle ? ` ${subtitle}` : ""}"><h5>${title}${subtitle ? ` <span>${subtitle}</span>` : ""}</h5>
      ${programIds.map((programId) => {
        const program = programs.find(({id}) => id === programId);
        return `<div class="timeline-event"><h6>${program.name} <span>${programVenues[programId]}</span></h6>
          ${series.map(({year, rows}) => {
            const row = rows.find(({id}) => id === programId);
            if (!row) return `<div class="timeline-unscheduled"><b>${year}</b> ${isYtd ? "Not scheduled this year" : "Not scheduled this quarter"}</div>`;
            const key = `${year}-${reportQuarter}-${row.id}`;
            const showDate = !isYtd || row.id === "meeting";
            const periodLabel = showDate ? `${row.date}, ${year}` : yearTitle(year);
            const sessionLabel = !showDate ? `${row.sessions} session${row.sessions === 1 ? "" : "s"}` : "";
            const filled = Math.min(100, row.registered / row.capacity * 100);
            const unfilled = Math.max(0, row.capacity - row.registered);
            const fillLabel = percent(row.registered, row.capacity);
            const gap = row.revenue - row.revenuePlan;
            const tone = revenueTone(gap);
            const perSpot = money(row.revenue / row.capacity);
            const revenueDetail = row.revenuePlan
              ? `${money(row.revenue)} net, ${percent(row.revenue, row.revenuePlan)} of the ${money(row.revenuePlan)} plan (${signedMoney(gap)}) · ${perSpot} net per available spot`
              : `${money(row.revenue)} net · ${row.price === 0 ? "Free event" : "No revenue target"}`;
            points.push({key, label: `${row.name} · ${periodLabel}`, detail:
              `${row.venue} · ${fillLabel} booked (${number(row.registered)} of ${number(row.capacity)}, ${number(unfilled)} unfilled) · ${revenueDetail}${row.upcoming ? " · Upcoming; check-ins pending" : ""}.`});
            return `<button type="button" class="chart-bar-button timeline-row" data-chart-key="${key}">
              <span class="timeline-date"><b>${showDate ? year : yearTitle(year)}</b> ${showDate ? row.date : sessionLabel}${row.upcoming ? "<small>Upcoming</small>" : ""}</span>
              <span class="timeline-metric timeline-capacity"><span><b>${fillLabel} booked</b><span>${capacitySummary(row)} spots</span></span>
                <span class="demo-bar-track timeline-seats" aria-hidden="true"><span class="interactive-bar" style="width:${filled}%"></span></span></span>
              <span class="timeline-metric timeline-revenue"><span><b>${money(row.revenue)} net</b>
                <span class="${tone}">${row.revenuePlan ? `${percent(row.revenue, row.revenuePlan)} of plan` : row.price === 0 ? "Free event" : "No target"}</span></span>
                ${row.revenuePlan ? `<span class="demo-bar-track" aria-hidden="true">
                  <span class="interactive-bar ${tone}" style="width:${row.revenue / row.revenuePlan / planScale * 100}%"></span>
                  <i class="chart-target" style="left:${planMarker}%"></i></span>` : ""}</span>
            </button>`;
          }).join("")}</div>`;
      }).join("")}</section>`
  ).join("");
  renderInteractiveChart("revenue-timeline", points, markup, received === learners.length);
}

function renderDashboard() {
  const period = reportQuarter;
  const quarterLabel = executiveQuarters.find(({id}) => id === period);
  element("ceo-period-caption").textContent = quarterLabel ? quarterLabel.months : "All quarters";
  for (const button of element("period-filter").children) button.setAttribute("aria-pressed", String(button.dataset.quarter === period));
  const format = element("format-filter").value;
  const selected = element("program-filter").value;
  const periodRows = executiveRows(2026, period);
  const matchesProgram = (row) =>
    (format === "all" || row.format === format) && (selected === "all" || row.id === selected);
  const filterRows = (rows) => rows.filter((row) => row.scheduled && matchesProgram(row));
  const annual = periodRows.find(({id}) => id === "meeting");
  const labs = aggregate(periodRows.filter(({format}) => format === "Hands-on course"));
  const webinars = aggregate(periodRows.filter(({format}) => format === "Webinar"));
  metricsRows = filterRows(periodRows);
  const campaign = aggregate(periodRows.filter(matchesProgram));
  const org = aggregate(periodRows);
  const variance = org.revenue - org.revenuePlan;
  const membership = membershipFor(period);
  const grantTotal = researchGrants.reduce((total, grant) => total + grant.amount, 0);
  const flags = actionMap(period);
  drilldowns = executiveDrilldown(periodRows, membership, grantTotal, period);
  showDrilldown();
  if (activeDrill) return;
  element("health-summary").textContent = annual.upcoming
    ? `${number(annualMeeting.memberRegistrations)} members booked for December. ${number(annualMeeting.memberGoal - annualMeeting.memberRegistrations)} more to reach the member registration milestone.`
    : `${percent(membership.renewed, membership.eligible)} membership retention · ${signedMoney(variance)} net revenue vs. plan.`;
  element("dashboard-status").textContent = received === learners.length
    ? "Current demo snapshot · 500 of 500 submissions processed"
    : `Updating dashboard · ${received} of ${learners.length} submissions processed`;
  const focusDetail = element("dashboard-kpis").contains(document.activeElement) ? document.activeElement.dataset.detail : null;
  const quarterNames = period === "all" ? "2026 year to date" : period + " 2026";
  element("dashboard-kpis").innerHTML = [
    ["revenue", "$", "Net revenue", money(org.revenue), `${signedMoney(variance)} vs. plan`, revenueTone(variance)],
    ["attendance", "✓", "Actual attendance", number(org.attended), "Completed event check-ins"],
    ["registrations", "▤", "Registrations / capacity", null,
      flags.size ? `${flags.size} program${flags.size === 1 ? " needs" : "s need"} action` : "No action flagged",
      flags.size ? "negative" : ""],
    ["membership", "◫", "Membership retention", percent(membership.renewed, membership.eligible), `${number(membership.active)} active members`],
    ["clicks", "↗", "Campaign clicks", number(org.clicked), org.delivered ? `${percent(org.clicked, org.delivered)} of emails delivered` : "No campaign records"],
    ["grants", "◇", "Research grants awarded", money(grantTotal), `${percent(grantTotal, grantBudget)} of ${money(grantBudget)} · 2026`]
  ].map(([key, symbol, label, value, caption, tone = ""]) =>
    `<button type="button" class="panel action-kpi executive-kpi kpi-${key}" data-detail="${key}" aria-controls="ceo-drilldown">
      <i aria-hidden="true">${symbol}</i>${value === null ? "" : `<strong class="${tone}">${value}</strong>`}<span>${label}</span><small class="${tone}">${caption}</small>
    </button>`).join("");
  if (focusDetail) element("dashboard-kpis").querySelector(`[data-detail="${focusDetail}"]`)?.focus({preventScroll: true});
  const meetingCard = annual.upcoming
    ? `<p><strong>${number(annualMeeting.memberRegistrations)}</strong> member registrations / ${number(annualMeeting.memberGoal)} member attendance goal</p>
       <progress value="${annualMeeting.memberRegistrations}" max="${annualMeeting.memberGoal}" aria-label="Member registrations toward the annual meeting attendance goal"></progress>
       <small>${number(annualMeeting.guestRegistrations)} non-member registrations · ${annualMeeting.dates} · ${capacitySummary(annual)} total spots booked</small>
       <small class="ceo-upcoming-detail">Actual attendance pending · <b class="${revenueTone(annual.revenue - annual.revenuePlan)}">${money(annual.revenue)} net bookings</b></small>`
    : `<p>Scheduled for ${annualMeeting.dates}. Select Q4 to view bookings.</p><small>Actual attendance pending</small>`;
  element("priority-kpis").innerHTML = `<article class="panel action-card priority-card">
    <div><h3>Annual meeting</h3><span class="status-pill scheduled">Upcoming</span></div>${meetingCard}</article>
    <article class="panel action-card priority-card">
    <div><h3>Hands-on labs</h3></div>
    <p><strong>${number(labs.registered)}</strong> registered out of ${number(labs.capacity)} total spots</p>
    <p>${number(labs.attended)} checked in / ${number(labs.attendancePlan)} planned</p>
    <small>${quarterNames} · <b class="${revenueTone(labs.revenue - labs.revenuePlan)}">${money(labs.revenue)} net</b> / ${money(labs.revenuePlan)} planned</small>
    </article>`;

  const animate = received === learners.length;
  const comparison = (row, field, plan, show, unit) =>
    `${show(row[field])} ${unit} against ${show(row[plan])} planned. ${percent(row[field], row[plan]) === "—" ? "No planned target." : percent(row[field], row[plan]) + " of plan."}`;
  renderDashboardBars("revenue-chart", metricsRows.map((row) => ({
    key: row.id, label: row.name, value: row.revenue, target: row.revenuePlan,
    caption: `${money(row.revenue)} / ${money(row.revenuePlan)}`, tone: revenueTone(row.revenue - row.revenuePlan),
    detail: `${comparison(row, "revenue", "revenuePlan", money, "net")} Variance ${signedMoney(row.revenue - row.revenuePlan)}. ${money(row.refund)} refunded.`
  })), animate);
  renderDashboardBars("attendance-chart", metricsRows.filter((row) => !row.upcoming).map((row) => ({
    key: row.id, label: row.name, value: row.attended, target: row.attendancePlan,
    caption: `${row.attended} / ${row.attendancePlan}`,
    detail: `${comparison(row, "attended", "attendancePlan", number, "attended")} ${row.registered} registrations, ${percent(row.attended, row.registered)} attendance rate.`
  })), animate);
  renderDashboardBars("engagement-chart", ["Delivered", "Opened", "Clicked"].map((label) => {
    const key = label.toLowerCase();
    const definition = {delivered: "emails delivered", opened: "emails opened", clicked: "emails with a click"};
    return {key, label, value: campaign[key], caption: `${number(campaign[key])} · ${percent(campaign[key], campaign.delivered)}`,
      detail: `${number(campaign[key])} ${definition[key]} across the selected programs.${campaign.delivered ? ` ${percent(campaign[key], campaign.delivered)} of delivered emails.` : ""}`};
  }), animate);
  const formats = [
    ["meeting", "Annual meeting", "Annual meeting", "#355bd4"],
    ["labs", "Hands-on labs", "Hands-on course", "#24a276"],
    ["webinars", "Webinars", "Webinar", "#ec9f3b"]
  ];
  for (const kind of ["revenue", "attendance"]) {
    const year = mixYears[kind];
    const field = kind === "attendance" ? "attended" : "revenue";
    const display = kind === "attendance" ? number : money;
    const yearRows = filterRows(year === 2026 ? periodRows : executiveRows(year, period))
      .filter((row) => field !== "attended" || !row.upcoming);
    const total = aggregate(yearRows)[field];
    const grouped = formats.filter(([, , type]) => yearRows.some((row) => row.format === type))
      .map(([key, label, type, color]) => {
        const group = aggregate(yearRows.filter((row) => row.format === type));
        const value = group[field];
        return {key, label, color, value, caption: display(value),
          detail: `${year} · ${display(value)} ${kind === "attendance" ? "check-ins" : "net"} · ${percent(value, total)} of selected ${kind}.`};
      });
    for (const button of element(kind + "-year").children) button.setAttribute("aria-pressed", String(Number(button.dataset.year) === year));
    renderDashboardPie(kind + "-mix", grouped, animate, display(total));
  }

  element("executive-notes").innerHTML = [
    `Membership renewed ${number(membership.renewed)} of ${number(membership.eligible)} members due to renew (${percent(membership.renewed, membership.eligible)}).`,
    annual.upcoming ? `${percent(annualMeeting.memberRegistrations, annualMeeting.memberGoal)} of the 2,000-member goal is covered by member bookings. Check-ins begin on December 12.` : `Free webinars drew ${number(webinars.attended)} verified check-ins.`,
    `${money(grantBudget - grantTotal)} remains unawarded in the 2026 research grant budget.`
  ].map((note) => `<li>${note}</li>`).join("");
  element("metrics-table").innerHTML = metricsRows.map((row) => `<tr>
    <td><a href="#campaign/${row.id}">${row.name}</a><small>${row.format}${row.sessions === 1 ? ` · ${row.date}, 2026` : ""}</small></td><td><strong>${capacitySummary(row)}</strong><small>${percent(row.registered, row.capacity)} filled</small></td>
      <td>${row.upcoming ? '<span class="status-pill scheduled">Upcoming</span><small>Check-ins pending</small>' : `${number(row.attended)}<small>${number(row.attendancePlan)} planned</small>`}</td><td><b class="${revenueTone(row.revenue - row.revenuePlan)}">${money(row.revenue)}</b> / ${money(row.revenuePlan)}</td>
    <td class="${revenueTone(row.revenue - row.revenuePlan)}">${signedMoney(row.revenue - row.revenuePlan)}</td>
    <td>${flagMarkup(flags.get(row.id))}<small>${row.owner}${flags.has(row.id) ? "" : ` · ${row.next}`}</small></td></tr>`).join("");
  element("dashboard-export-status").textContent = "";
  element("dashboard-empty").hidden = metricsRows.length > 0;
}

function replay() {
  clearInterval(replayTimer);
  received = reducedMotion.matches ? learners.length : learners.length - 50;
  renderSurvey();
  renderDashboard();
  if (received === learners.length) return;
  replayTimer = setInterval(() => {
    received = Math.min(learners.length, received + 5);
    renderSurvey();
    renderDashboard();
    if (received === learners.length) {
      clearInterval(replayTimer);
      renderMarketing();
      updateCampaign();
    }
  }, 300);
}

function showStep(focus = true) {
  const [hash, eventId] = location.hash.slice(1).split("/");
  if (hash === "workshop-main") return;
  const step = steps.includes(hash) ? hash : "quiz";
  const previous = currentStep;
  currentStep = step;
  document.body.classList.toggle("ceo-mode", step === "dashboard");
  for (const name of steps) element(`view-${name}`).hidden = name !== step;
  for (const link of document.querySelectorAll("[data-step]")) {
    if (link.dataset.step === step) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  }
  if (step === "campaign") selectProgram(eventId || currentProgram.id);
  const executiveSection = ["programs", "engagement"].includes(eventId) ? eventId : "overview";
  const previousDrill = activeDrill;
  if (step === "dashboard") {
    activeDrill = drillKeys.includes(eventId) ? eventId : "";
    renderDashboard();
    for (const link of document.querySelectorAll("[data-ceo-section]")) {
      if (!activeDrill && link.dataset.ceoSection === executiveSection) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  if (!previous && step !== "campaign") replay();
  if (focus) {
    if (step === "dashboard" && activeDrill) {
      element("ceo-drilldown").focus();
      return;
    }
    if (step === "dashboard" && previous === "dashboard" && previousDrill && executiveSection === "overview") {
      element("dashboard-kpis").querySelector(`[data-detail="${previousDrill}"]`)?.focus();
      return;
    }
    const heading = step === "dashboard" && executiveSection !== "overview"
      ? element(`ceo-${executiveSection}`) : element(`view-${step}`).querySelector("h2");
    heading.tabIndex = -1;
    heading.focus();
  }
}

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

element("survey-audience").addEventListener("change", renderSurvey);
element("replay-survey").addEventListener("click", replay);
element("replay-dashboard").addEventListener("click", replay);
element("shared-program").addEventListener("change", (event) => selectProgram(event.target.value));
element("event-priorities").addEventListener("click", (event) => {
  const button = event.target.closest("[data-event]");
  if (button) selectProgram(button.dataset.event, true);
});
element("campaign-email").addEventListener("input", (event) => savedEmails.set(currentProgram.id, event.target.value));
element("copy-email").addEventListener("click", async () => {
  const draft = element("campaign-email");
  try {
    await navigator.clipboard.writeText(draft.value);
    element("email-status").textContent = "Email copied.";
  } catch {
    draft.select();
    element("email-status").textContent = "Text selected. Use your device’s Copy command.";
  }
});
element("save-email").addEventListener("click", () => download(`wwma-${currentProgram.id}-email.txt`, element("campaign-email").value, "text/plain;charset=utf-8"));
element("poster-format").addEventListener("change", () => renderEventPoster(currentProgram));
element("download-poster").addEventListener("click", () => downloadEventPoster(currentProgram.id));
element("format-filter").addEventListener("change", () => {
  optionsForPrograms();
  renderDashboard();
});
for (const kind of ["revenue", "attendance"]) {
  const control = element(kind + "-year");
  control.innerHTML = executiveYears.map((year) =>
    `<button type="button" data-year="${year}" aria-pressed="${year === mixYears[kind]}">${year}${year === 2026 ? " YTD" : ""}</button>`).join("");
  control.addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    mixYears[kind] = Number(button.dataset.year);
    renderDashboard();
  });
}
element("dashboard-kpis").addEventListener("click", (event) => {
  const tile = event.target.closest("[data-detail]");
  if (!tile) return;
  location.hash = `dashboard/${tile.dataset.detail}`;
});
element("close-drill").addEventListener("click", () => {
  location.hash = "dashboard";
});
element("period-filter").addEventListener("click", (event) => {
  const button = event.target.closest("[data-quarter]");
  if (!button || button.dataset.quarter === reportQuarter) return;
  reportQuarter = button.dataset.quarter;
  renderDashboard();
});
const registrationTrendProgram = element("registrations-trend-program");
registrationTrendProgram.append(...displayOrder.map((id) => new Option(programs.find((program) => program.id === id).name, id)));
registrationTrendProgram.addEventListener("change", renderMonthlyRegistrations);
element("registrations-trend-session").addEventListener("change", renderMonthlyRegistrations);
const primaryYearControl = element("revenue-primary-year");
const compareYearControl = element("revenue-compare-year");
const yearOption = (year) => new Option(`${year}${year === 2026 ? " YTD" : ""}`, year);
function updateCompareYearControl() {
  compareYearControl.replaceChildren(new Option("No comparison", ""), ...executiveYears.filter((year) => year !== timelineYear).reverse().map(yearOption));
  compareYearControl.value = compareYear || "";
}
primaryYearControl.replaceChildren(...[...executiveYears].reverse().map(yearOption));
updateCompareYearControl();
primaryYearControl.addEventListener("change", () => {
  const previousYear = timelineYear;
  timelineYear = Number(primaryYearControl.value);
  if (timelineYear === compareYear) compareYear = previousYear;
  updateCompareYearControl();
  renderRevenueTimeline();
});
compareYearControl.addEventListener("change", () => {
  compareYear = Number(compareYearControl.value);
  renderRevenueTimeline();
});
element("program-filter").addEventListener("change", renderDashboard);
element("export-metrics").addEventListener("click", () => {
  const period = reportQuarter === "all" ? "2026 YTD" : `2026 ${reportQuarter}`;
  const flags = actionMap(reportQuarter);
  const rows = [[
    "Period", "Program", "Format", "Delivered", "Opened", "Clicked", "Registered", "Capacity", "Attended",
    "Attendance plan", "Refunds USD", "Net revenue USD", "Revenue plan USD", "Revenue variance USD", "Owner", "Event status", "Action"
  ], ...metricsRows.map((row) => [
    period, row.name, row.format, row.delivered, row.opened, row.clicked, row.registered, row.capacity,
    row.attended ?? "", row.attendancePlan, row.refund, row.revenue, row.revenuePlan, row.revenue - row.revenuePlan,
    row.owner, row.upcoming ? "Upcoming" : "Completed", (flags.get(row.id) ?? []).map(({quarter, action}) => `${quarter}: ${action}`).join(" · ")
  ])];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  download("wwma-fictional-metrics.csv", csv, "text/csv;charset=utf-8");
  element("dashboard-export-status").textContent = "Exported the current view.";
});
window.addEventListener("hashchange", () => showStep());
element("view-dashboard").querySelector(".ceo-nav").addEventListener("click", (event) => {
  const link = event.target.closest("[data-ceo-section]");
  if (link && link.hash === location.hash) {
    event.preventDefault();
    showStep();
  }
});

element("shared-program").replaceChildren(...campaignEvents.map(({id}) => new Option(programs.find((program) => program.id === id).name, id)));
element("period-filter").innerHTML = [{id: "all", name: "YTD", months: "All quarters"}, ...executiveQuarters].map(({id, name, months}) =>
  `<button type="button" data-quarter="${id}" aria-label="${name ?? id}, ${months}">${name ?? id}</button>`).join("");
optionsForPrograms();
renderSurvey();
showStep(false);

"use strict";

const profileQuestions = [
  { key: "role", label: "Role", prompt: "Which best describes you?",
    choices: {
      cowboy: "Cowboy", cowgirl: "Cowgirl", crew: "Ranch or rodeo crew",
      newcomer: "I’m exploring ranch life", private: "Prefer not to say"
    } },
  { key: "experience", label: "Experience", prompt: "How long have you been riding or doing ranch or rodeo work?",
    choices: {
      new: "Just getting started", early: "Less than a year", working: "1–5 years", veteran: "More than 5 years"
    } },
  { key: "format", label: "Formats", prompt: "How do you prefer to learn about life in the Wild West?", multiple: true, exclusive: "flexible",
    choices: {
      webinar: "Webinar with an expert", lab: "Hands-on lab", meeting: "Annual meeting or conference",
      guide: "Self-paced lessons or field guides", flexible: "I’m open to any format"
    } },
  { key: "barriers", label: "Challenges", prompt: "What makes it hardest to learn?", multiple: true, exclusive: "none",
    choices: {
      time: "Long shifts or an unpredictable schedule", travel: "Long horse rides to get to training",
      internet: "Unreliable internet", cost: "Course or travel costs",
      relevance: "Hard to find training that fits ranch work", none: "No major barriers"
    } },
  { key: "topic", label: "Topics", prompt: "What would you like to learn about?", multiple: true, exclusive: "any",
    choices: {
      msk: "Preventing back and joint strain", heat: "Hydration and heat safety", horse: "Horse care and safe handling",
      injury: "Riding injuries and first aid", livestock: "Cattle handling injuries and animal-borne illness",
      hearing: "Hearing protection around equipment", breathing: "Breathing health around dust and smoke",
      sun: "Sun exposure and skin health", stress: "Stress and mental health",
      any: "A little of everything"
    } }
];

const programs = [
  {
    id: "heat-webinar", format: "webinar", type: "Webinar", title: "Heat on the Range",
    time: "35 minutes · Live or replay · Free", faculty: "Dr. June Mercer · Rural physician and rancher",
    details: "Discuss a hot-shift case and plan water access, breaks, and shade for a ranch crew. An audio replay and downloadable transcript are included.",
    topics: ["heat"], levels: ["new", "early", "working", "veteran"], barriers: ["time", "travel", "cost", "relevance"]
  },
  {
    id: "msk-lab", format: "lab", type: "Hands-on lab", title: "Ranch MSK Skills Lab",
    time: "Half day · In person · Paid", faculty: "Dr. Eli Navarro · Sports medicine physician and rodeo rider",
    details: "Practice moving tack and feed, setting up a work area, and adapting common ranch tasks to reduce strain. Stations include a coached practice round.",
    topics: ["msk", "injury"], levels: ["early", "working", "veteran"], barriers: ["internet", "relevance"]
  },
  {
    id: "annual-meeting", format: "meeting", type: "Annual meeting", title: "Frontier Medicine Roundup",
    time: "Two days · Paid in person · Free selected replays",
    faculty: "Ruth Calder, working cowgirl and ranch foreperson · Sam Ortega, cowboy and wilderness medic · Dr. Mara Bell, cowgirl and equine veterinarian",
    details: "Join a cowgirl-led cattle handling workshop, a trail emergency roundtable with a working cowboy, or a horse-care Q&A. Other sessions cover hydration, back and joint care, equipment noise, dust and smoke, sun exposure, and ranch stress. The demo agenda includes beginner sessions, peer roundtables, and a free replay and printable notes for the opening panel on ranch health.",
    amenity: "Complimentary stabling for your horse while you attend.",
    topics: ["horse", "injury", "msk", "heat", "livestock", "hearing", "breathing", "sun", "stress"],
    levels: ["new", "early", "working", "veteran"], barriers: ["relevance"]
  },
  {
    id: "ranch-field-guide", format: "guide", type: "Self-paced field guide", title: "Ranch Health Field Guide",
    time: "10-minute chapters · Downloadable format · Free", faculty: "Ruth Calder · Ranch foreperson, with WWMA faculty",
    details: "Short chapters on planning water stops, moving gear, and preparing a first-aid kit. The demo curriculum is designed as a printable field guide for offline use.",
    topics: ["heat", "msk", "injury"], levels: ["new", "early"], barriers: ["time", "travel", "internet", "cost", "relevance"]
  },
  {
    id: "horse-care-lab", format: "lab", type: "Hands-on lab", title: "Horse Care at the Hitching Rail",
    time: "90 minutes · In person · Paid", faculty: "Dr. Mara Bell · Equine veterinarian and horse trainer",
    details: "Practice approaching and handling horses safely and learn what information an equine veterinarian needs when you call. The session starts with a demonstration.",
    topics: ["horse"], levels: ["new", "early", "working"], barriers: ["internet", "relevance"]
  },
  {
    id: "rider-first-aid-webinar", format: "webinar", type: "Webinar", title: "First Aid Off the Saddle",
    time: "40 minutes · Live or replay · Free", faculty: "Sam Ortega · Wilderness medic and trail guide",
    details: "Talk through a fall on a remote trail and practice giving a clear handoff to emergency responders. Replay and transcript are included in the fictional course plan.",
    topics: ["injury"], levels: ["new", "early", "working", "veteran"], barriers: ["time", "travel", "cost", "relevance"]
  },
  {
    id: "horse-care-guide", format: "guide", type: "Self-paced field guide", title: "Everyday Horse Care",
    time: "10-minute chapters · Downloadable format · Free", faculty: "Dr. Mara Bell · Equine veterinarian and horse trainer",
    details: "Use a printable guide to work through daily horse checks, safe handling, and when to contact an equine veterinarian.",
    topics: ["horse"], levels: ["new", "early", "working"], barriers: ["time", "travel", "internet", "cost", "relevance"]
  },
  {
    id: "cattle-safety-lab", format: "lab", type: "Hands-on lab", title: "Safer Work at the Cattle Chute",
    time: "90 minutes · In person · Paid", faculty: "Ruth Calder · Working cowgirl and ranch foreperson",
    details: "Walk through gate and escape-route planning, discuss crush and kick injuries, and practice reporting what happened after an animal injury or exposure. The lab includes a case on asking about calf contact when a ranch worker reports gastrointestinal symptoms.",
    topics: ["livestock", "injury"], levels: ["early", "working", "veteran"], barriers: ["internet", "relevance"]
  },
  {
    id: "barn-exposure-guide", format: "guide", type: "Self-paced field guide", title: "Dust, Noise, and Sun on the Ranch",
    time: "10-minute chapters · Downloadable format · Free", faculty: "Dr. June Mercer · Rural physician and rancher",
    details: "Learn to spot noisy equipment, dusty feed tasks, wildfire smoke exposure, and long days in direct sun. A checklist prompts learners to note symptoms and job tasks before discussing hearing checks, breathing symptoms, or skin concerns with a clinician.",
    topics: ["breathing", "hearing", "sun"], levels: ["new", "early", "working", "veteran"],
    barriers: ["time", "travel", "internet", "cost", "relevance"]
  },
  {
    id: "ranch-stress-webinar", format: "webinar", type: "Webinar", title: "Checking In on the Crew",
    time: "35 minutes · Live or replay · Free", faculty: "Nora Vale · Cowgirl and rural mental health counselor",
    details: "Talk through stress, isolation, and burnout during a busy season. Practice a supportive check-in and explore how a crew member might find confidential help. The course plan includes a replay and transcript.",
    topics: ["stress"], levels: ["new", "early", "working", "veteran"], barriers: ["time", "travel", "cost", "relevance"]
  }
];

const barrierBenefits = {
  time: "short or flexible sessions", travel: "no travel required", internet: "works offline or in person",
  cost: "free to attend or use", relevance: "examples from ranch work"
};

const topicFocus = {
  msk: "back and joint care", heat: "hydration and heat safety",
  horse: "horse care and safe handling", injury: "riding injuries and first aid",
  livestock: "livestock safety and animal-borne illness", hearing: "hearing protection",
  breathing: "breathing health around dust and smoke", sun: "sun and skin protection", stress: "stress and mental health"
};

const get = (id) => document.getElementById(id);
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const pageNames = {
  home: "Wild West Medical Association",
  education: "Learner Quiz",
  programs: "Frontier Programs",
  marketing: "Marketing Corral",
  research: "Research Roundup",
  "trail-map": "Department Trail Map"
};
let activePage;

function route(focus = true) {
  const hash = location.hash.slice(1);
  if (hash === "main") return;
  const program = programs.find(({id}) => id === hash);
  const quizLink = hash === "quiz-start" || hash === "quiz";
  const page = program ? "programs" : quizLink ? "education" : Object.hasOwn(pageNames, hash) ? hash : "home";
  const pageChanged = page !== activePage;
  activePage = page;
  for (const name of Object.keys(pageNames)) get(`page-${name}`).hidden = name !== page;
  get("masthead").hidden = page === "home";
  if (page === "programs") {
    get("back-to-quiz").textContent = position === profileQuestions.length ? "← Back to my matches" : "← Back to the quiz";
  }
  document.title = `${pageNames[page]} · WWMA Field Office`;
  if (program) {
    const card = get(program.id);
    card.open = true;
    card.querySelector("summary").focus({preventScroll: true});
    card.scrollIntoView({block: "start"});
  } else if (quizLink) {
    const card = get("quiz-start");
    card.focus({preventScroll: true});
    card.scrollIntoView({block: "start"});
  } else if (focus && pageChanged) {
    const heading = get(`page-${page}`).querySelector("h1");
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
    window.scrollTo(0, 0);
  }
}

get("program-list").innerHTML = programs.map(({id, type, title, time, faculty, details, amenity}) => `
  <details class="panel program-card" id="${id}">
    <summary><span><span class="eyebrow">${type}</span><span class="program-title">${title}</span></span><span class="program-time">${time}</span></summary>
    <div class="program-detail"><p><strong>${faculty}</strong></p><p>${details}</p>${amenity ? `<p><strong>${amenity}</strong></p>` : ""}</div>
  </details>`).join("");

const quiz = get("quiz");
let position = 0;
let answers = {};

function updateProgress() {
  const total = profileQuestions.length;
  const finished = position === total;
  get("quiz-progress").innerHTML = `
    <div class="progress-label"><strong>${finished ? "Profile complete" : `Question ${position + 1} of ${total}`}</strong></div>
    <progress value="${finished ? total : position}" max="${total}" aria-label="Learner quiz progress"></progress>`;
}

function renderQuestion(focus = false) {
  const question = profileQuestions[position];
  const saved = answers[question.key];
  const checked = question.multiple ? saved ?? [] : [saved];
  const lastQuestion = position === profileQuestions.length - 1;
  updateProgress();
  quiz.innerHTML = `
    <form id="profile-form">
      <fieldset class="profile-field">
        <legend class="question" id="question" tabindex="-1">${question.prompt}</legend>
        ${question.multiple ? '<p class="choice-instruction">Select all that apply.</p>' : ""}
        <div class="choices${question.key === "topic" ? " topic-choices" : ""}">
          ${Object.entries(question.choices).map(([value, label]) => `
            <label class="choice"><input type="${question.multiple ? "checkbox" : "radio"}" name="response"
              value="${value}" ${checked.includes(value) ? "checked" : ""}><span>${label}</span></label>`).join("")}
        </div>
      </fieldset>
      <div class="quiz-actions">
        ${position > 0 ? '<button type="button" class="button secondary" id="back">Back</button>' : ""}
        <button type="submit" class="button primary" id="next" ${checked.some(Boolean) ? "" : "disabled"}>
          ${lastQuestion ? "Find my courses" : "Continue"} ${icon("arrow")}
        </button>
      </div>
    </form>`;
  if (focus) get("question").focus();
}

function saveResponse(form, changed) {
  const question = profileQuestions[position];
  if (question.exclusive && changed?.checked) {
    if (changed.value === question.exclusive) {
      for (const input of form.elements.response) if (input !== changed) input.checked = false;
    } else {
      form.querySelector(`[value="${question.exclusive}"]`).checked = false;
    }
  }
  const selected = new FormData(form).getAll("response");
  answers[question.key] = question.multiple ? selected : selected[0];
  get("next").disabled = selected.length === 0;
}

function recommendation(program) {
  const matchedTopics = answers.topic.filter((topic) => program.topics.includes(topic));
  const broadMatch = answers.topic.includes("any") && program.topics.length > 1;
  const formatMatch = answers.format.includes(program.format);
  const experienceMatch = program.levels.includes(answers.experience);
  const matchedBarriers = answers.barriers.filter((barrier) => program.barriers.includes(barrier));
  const unmetBarriers = answers.barriers.filter((barrier) => barrier !== "none" && !program.barriers.includes(barrier));
  const accessBarriers = ["travel", "internet", "cost"];
  const accessPenalty = unmetBarriers.filter((barrier) => accessBarriers.includes(barrier)).length;
  const topicScore = matchedTopics.length ? 8 + Math.min(matchedTopics.length - 1, 3) : 0;
  const score = topicScore + (broadMatch ? Math.min(program.topics.length, 4) : 0) +
    (formatMatch ? 4 : 0) + (experienceMatch ? 2 : 0) + matchedBarriers.length * 2 - accessPenalty * 4;
  const reasons = [
    matchedTopics.length && `Covers ${matchedTopics.map((topic) => topicFocus[topic]).join(", ")}`,
    broadMatch && "Covers several ranch health topics",
    formatMatch && "Matches your preferred format",
    experienceMatch && "Fits your experience level",
    ...matchedBarriers.map((barrier) => barrierBenefits[barrier])
  ].filter(Boolean);
  const tradeoffs = unmetBarriers.filter((barrier) => accessBarriers.includes(barrier)).map((barrier) => ({
    travel: program.format === "meeting" ? "Travel for in-person sessions" : "Requires travel",
    internet: program.format === "meeting" ? "Internet for replays" : "Requires internet access",
    cost: program.format === "meeting" ? "In-person registration is paid" : "Has a course fee"
  })[barrier]);
  return {program, score, reasons, tradeoffs};
}

function renderResult() {
  updateProgress();
  const ranked = programs.map(recommendation).sort((left, right) => right.score - left.score);
  const recommendations = ranked.slice(0, 3);
  const annualMeeting = ranked.find(({program}) => program.format === "meeting");
  if (!recommendations.includes(annualMeeting)) recommendations[2] = annualMeeting;
  quiz.innerHTML = `
    <div class="profile-result">
      <h2 id="result-title" tabindex="-1">Your WWMA course matches</h2>
      <p class="result-intro">Explore your fictional course matches and meet other cowboys and cowgirls at the annual meeting.</p>
      <ol class="course-matches">
        ${recommendations.map(({program, reasons, tradeoffs}, index) => `
          <li>
            <p class="eyebrow">${index === 0 ? "Top match · " : ""}${program.type}</p>
            <h3><a href="#${program.id}">${program.title}</a></h3>
            <p class="program-time">${program.time}</p>
            ${program.format === "meeting" ? '<p class="match-reasons">Learn with expert cowboys and cowgirls.</p>' : ""}
            ${program.amenity ? `<p class="match-reasons">${program.amenity}</p>` : ""}
            ${reasons.length ? `<p class="match-reasons">${reasons.join(" · ")}</p>` : ""}
            ${tradeoffs.length ? `<p class="match-reasons">${tradeoffs.join(" · ")}</p>` : ""}
          </li>`).join("")}
      </ol>
      <details class="answer-review"><summary>Your learner profile</summary>
        <dl class="profile-summary">
          ${profileQuestions.map(({key, label, choices, multiple}) => {
            const value = multiple ? answers[key].map((item) => choices[item]).join(", ") : choices[answers[key]];
            return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
          }).join("")}
        </dl>
      </details>
      <div class="quiz-actions">
        <button type="button" class="button secondary" id="edit-profile">Edit answers</button>
        <button type="button" class="button secondary" id="retake">${icon("return")} Start over</button>
        <a class="button primary" href="#programs">View all courses ${icon("arrow")}</a>
      </div>
    </div>`;
  get("result-title").focus();
}

quiz.addEventListener("change", (event) => {
  if (event.target.name === "response") saveResponse(event.target.form, event.target);
});

quiz.addEventListener("submit", (event) => {
  event.preventDefault();
  saveResponse(event.target);
  if (get("next").disabled) return;
  position += 1;
  if (position === profileQuestions.length) renderResult();
  else renderQuestion(true);
});

quiz.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.id === "back") {
    position -= 1;
    renderQuestion(true);
  }
  if (button.id === "retake" || button.id === "edit-profile") {
    if (button.id === "retake") answers = {};
    position = 0;
    renderQuestion(true);
  }
});

const draft = get("draft");
const draftTopic = get("draft-topic");
const draftFormat = get("draft-format");
const draftStatus = get("draft-status");
let draftChanged = false;
let generatedFormat = "newsletter";

programs.forEach(({title, id}) => draftTopic.add(new Option(title, id)));

function generateDraft(announce = false) {
  const format = draftFormat.value;
  const western = get("draft-tone").value === "western";
  const course = programs.find(({id}) => id === draftTopic.value);
  const headline = course?.title ?? (western ? "Find Your Learning Trail" : "Find Your Next WWMA Course");
  const invitation = course
    ? [`${course.title} is a sample WWMA ${course.type.toLowerCase()}.`, course.details, course.amenity].filter(Boolean).join(" ")
    : "Tell WWMA how you like to learn and what gets in the way. Five short questions will match you with fictional courses for ranch and rodeo life.";
  const cta = course ? "See the course preview in Frontier Programs." : "Try the Learner Quiz in the WWMA Field Office.";
  const demo = "Fictional WWMA program preview.";
  const drafts = {
    newsletter: `${headline}\n\n${invitation} ${cta}\n\n${demo}`,
    email: `Subject: ${headline}\n\n${western ? "Howdy, trail crew!" : "Hello, WWMA members,"}\n\n${invitation}\n\n${cta}\n\n${western ? "See you on the trail," : "Thank you,"}\nWWMA Education\n\n${demo}`,
    social: `${headline} • ${course ? course.time : "Five questions, course matches in minutes."} ${cta} #WWMA\n\n${demo}`
  };
  if (draftChanged && draft.value !== drafts[format] && !window.confirm("Replace your edited draft with a new draft?")) return;
  draft.value = drafts[format];
  draftChanged = false;
  generatedFormat = format;
  if (announce) draftStatus.textContent = "Draft generated. You can edit or export the text.";
}

get("draft-form").addEventListener("submit", (event) => {
  event.preventDefault();
  generateDraft(true);
});
draft.addEventListener("input", () => {
  draftChanged = true;
  draftStatus.textContent = "";
});
get("copy-draft").addEventListener("click", async () => {
  if (!draft.value.trim()) {
    draftStatus.textContent = "Add text before copying.";
    return;
  }
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(draft.value);
    else {
      draft.select();
      if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
    }
    draftStatus.textContent = "Draft copied to your clipboard.";
  } catch {
    draft.select();
    draftStatus.textContent = "Text selected. Use your device’s Copy command.";
  }
});
get("download-draft").addEventListener("click", () => {
  if (!draft.value.trim()) {
    draftStatus.textContent = "Add text before downloading.";
    return;
  }
  const url = URL.createObjectURL(new Blob([draft.value], {type: "text/plain;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = `wwma-${generatedFormat}-demo.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  draftStatus.textContent = "Text export requested.";
});

const cohorts = {
  new: {size: 50, barriers: [30, 21, 18, 23, 15]},
  experienced: {size: 70, barriers: [48, 27, 19, 29, 33]}
};
const researchBarriers = [
  {key: "time", program: "heat-webinar", opportunity: "Offer short webinars with a replay so members can learn around long or unpredictable shifts."},
  {key: "travel", program: "rider-first-aid-webinar", opportunity: "Offer remote sessions to members who live far from in-person training."},
  {key: "internet", program: "ranch-field-guide", opportunity: "Offer printable material that members can use offline."},
  {key: "cost", program: "horse-care-guide", opportunity: "Offer free introductory courses and field guides."},
  {key: "relevance", program: "msk-lab", opportunity: "Ask ranchers and rodeo riders to teach with examples from their own work."}
];
const barrierLabels = profileQuestions.find(({key}) => key === "barriers").choices;
let selectedBarrier;

function sampleData() {
  const choice = get("cohort").value;
  if (choice !== "all") return cohorts[choice];
  return {
    size: cohorts.new.size + cohorts.experienced.size,
    barriers: researchBarriers.map((_, index) => cohorts.new.barriers[index] + cohorts.experienced.barriers[index])
  };
}

function renderResearch() {
  const {size, barriers} = sampleData();
  const highest = barriers.indexOf(Math.max(...barriers));
  const pct = (count) => `${Math.round(100 * count / size)}%`;
  selectedBarrier = highest;
  get("metrics").innerHTML = [
    [size, "Fictional profiles"],
    [pct(barriers[highest]), `Most reported barrier · ${barrierLabels[researchBarriers[highest].key]}`]
  ].map(([value, label]) => `<div class="panel metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  get("chart").innerHTML = researchBarriers.map(({key}, index) => `
    <button class="chart-row" type="button" data-barrier="${index}" aria-pressed="false">
      <span>${barrierLabels[key]}</span><span>${pct(barriers[index])}</span>
      <span class="bar-track" aria-hidden="true"><span class="bar" style="width:${pct(barriers[index])}"></span></span>
    </button>
  `).join("");
  showInsight();
}

function showInsight() {
  for (const row of get("chart").querySelectorAll("button")) {
    row.setAttribute("aria-pressed", Number(row.dataset.barrier) === selectedBarrier);
  }
  const {key, opportunity, program} = researchBarriers[selectedBarrier];
  const {size, barriers} = sampleData();
  get("insight").innerHTML = `
    <h2>${barrierLabels[key]}</h2>
    <p>${barriers[selectedBarrier]} of ${size} fictional profiles reported this challenge.</p>
    <p>${opportunity}</p>
    <div class="insight-actions"><a class="button secondary" href="#${program}">View program ${icon("arrow")}</a>
    <a class="button secondary" href="#marketing" id="outreach-link">Draft outreach</a></div>`;
  get("outreach-link").addEventListener("click", () => {
    draftTopic.value = program;
    if (!draftChanged) generateDraft();
    draftStatus.textContent = draftChanged ? "Course selected. Generate a draft when you’re ready to replace your edits." : "Draft prefilled from the fictional research dashboard.";
  });
}
get("cohort").addEventListener("change", renderResearch);
get("chart").addEventListener("click", (event) => {
  const row = event.target.closest("[data-barrier]");
  if (!row) return;
  selectedBarrier = Number(row.dataset.barrier);
  showInsight();
});

const departments = [
  {name: "Education", icon: "book", step: "Design courses for ranch life",
    text: "Use the learning interests and barriers to plan webinars, hands-on labs, and annual meeting sessions with ranch experts.",
    page: "programs", label: "View the course catalog"},
  {name: "Research", icon: "chart", step: "Understand learning barriers",
    text: "Compare fictional learning barriers by experience level. Use the results to explore ideas such as shorter sessions and material people can use offline.",
    page: "research", label: "Explore demo results"},
  {name: "Marketing", icon: "megaphone", step: "Draft timely outreach",
    text: "Use the sample course catalog to draft outreach that explains what members will learn and how they can take part.",
    page: "marketing", label: "Open the draft builder"},
  {name: "Membership", icon: "users", step: "Connect members with training",
    text: "Invite new members to try the learner quiz and use their course matches to explore a path that fits their schedule and access.",
    page: "programs", label: "Browse member programs"}
];
get("department-route").innerHTML = departments.map(({name, icon: symbol}, index) =>
  `<li><button type="button" data-department="${index}" aria-pressed="false">${icon(symbol)}<span>${name}</span></button></li>`
).join("");

function showDepartment(index) {
  for (const button of get("department-route").querySelectorAll("button")) {
    button.setAttribute("aria-pressed", Number(button.dataset.department) === index);
  }
  const {name, step, text, page, label} = departments[index];
  get("department-detail").innerHTML = `
    <span class="topic-label">${name}</span><h3>${step}</h3><p>${text}</p>
    <a class="button secondary" href="#${page}">${label} ${icon("arrow")}</a>`;
}
get("department-route").addEventListener("click", (event) => {
  const button = event.target.closest("[data-department]");
  if (button) showDepartment(Number(button.dataset.department));
});

renderQuestion();
generateDraft();
renderResearch();
showDepartment(0);
route(false);
window.addEventListener("hashchange", () => route());

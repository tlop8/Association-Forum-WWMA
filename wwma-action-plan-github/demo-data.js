"use strict";

const periods = [
  { id: "2026-Q3", name: "Q3 2026", dates: "Jul–Sep", count: 250 },
  { id: "2026-Q4", name: "Q4 2026", dates: "Oct–Dec", count: 250 }
];

const programs = [
  {
    id: "heat", name: "Heat on the Range", topic: "Heat safety", format: "Webinar", price: 0,
    owner: "Education", next: "Keep the hydration checklist in the replay follow-up.",
    lesson: "A ranch crew has four hours of work ahead in the heat. Plan water access, breaks, and shade before the work starts.",
    takeaway: "Set out cool drinking water close to the crew, schedule regular water breaks, and identify a shaded place to rest.",
    questions: [
      ["Where should the crew keep its drinking water?", ["At the far end of the property", "Close to where the crew is working", "At the barn for the end of the shift"], 1, "Water close to the work makes it easier to drink regularly."],
      ["When should crew members drink water?", ["Regularly throughout the job", "Only once they feel thirsty", "Only after work"], 0, "Plan regular water breaks even before people feel thirsty."],
      ["Where should the crew take a rest break on a hot day?", ["In direct sun beside the equipment", "Wherever the next task begins", "In shade or a cooler area"], 2, "A shaded or cooler area helps the crew recover during the break."]
    ]
  },
  {
    id: "msk", name: "Ranch MSK Skills Lab", topic: "Back and joint care", format: "Hands-on course", price: 85,
    owner: "Education", next: "Review turnout and compare it with demand for a second lab.",
    lesson: "A ranch crew moves feed sacks several times each morning. Look at how the crew can change the setup before anyone lifts.",
    takeaway: "Bring a cart close, split heavy loads where possible, and keep loads close to the body during lifts.",
    questions: [
      ["Which change reduces the amount of carrying?", ["Place the cart near the sacks", "Move the sacks farther from the cart", "Make everyone carry two sacks"], 0, "A nearby cart shortens the distance the crew has to carry each load."],
      ["What can the crew do before moving a heavy load?", ["Lift as fast as possible", "Split the load or get suitable mechanical help", "Hold it farther away to see the path"], 1, "Reducing the weight moved at one time lowers the demands on the worker."],
      ["Where should a manageable load be during a lift?", ["At arm’s length", "Above shoulder height if possible", "Close to the body"], 2, "Keeping the load close reduces the leverage it places on the back."]
    ]
  },
  {
    id: "horse", name: "Horse Care at the Hitching Rail", topic: "Horse care", format: "Hands-on course", price: 65,
    owner: "Education", next: "Use the hands-on session to rehearse the veterinary handoff.",
    lesson: "A normally calm horse starts pawing, repeatedly looks at its flank, and refuses feed. The crew needs a clear plan for contacting its veterinarian.",
    takeaway: "Call an equine veterinarian promptly when you suspect colic. Share when the signs started and follow their instructions.",
    questions: [
      ["Who should the crew call about suspected colic?", ["An equine veterinarian", "The feed store", "The next clinic on the event calendar"], 0, "Colic signs can have different causes. An equine veterinarian can advise the crew on what to do."],
      ["What information helps when you call?", ["Only the horse’s name", "What the horse is doing and when it started", "How far the horse rode last month"], 1, "Describe the signs and when they began so the veterinarian can assess urgency."],
      ["What should you do while arranging help if the horse is thrashing?", ["Crowd around it to hold it still", "Ask a bystander to mount it", "Keep people clear and follow veterinary instructions"], 2, "Protect the crew from injury and follow the veterinarian’s directions."]
    ]
  },
  {
    id: "first-aid", name: "First Aid Off the Saddle", topic: "Riding injuries and first aid", format: "Webinar", price: 0,
    owner: "Education", next: "Share the emergency-location worksheet before the next session.",
    lesson: "Your group is preparing for a remote ride with patchy cell coverage. Make a plan the whole group can follow if someone gets hurt.",
    takeaway: "Agree on a way to call for help, know how to describe your location, and identify who will meet responders.",
    questions: [
      ["What should the group check before heading out?", ["Whether everyone knows the name of the horse", "Whether it has a reliable way to call for help", "Whether the trip has a group photo"], 1, "Know where your devices work and plan a backup where coverage is limited."],
      ["Which detail helps responders locate the group?", ["Location coordinates or a marked trail access point", "The group’s favorite trail nickname", "The brand of the first-aid kit"], 0, "An accurate location and an access point can help responders find the group."],
      ["What should the group agree on in advance?", ["Who will post the story later", "Which horse will carry the most gear", "Who calls for help and who can meet responders"], 2, "Assigning roles in advance helps the group coordinate when time matters."]
    ]
  },
  {
    id: "meeting", name: "Frontier Medicine Roundup", topic: "Ranch health and peer learning", format: "Annual meeting", price: 145,
    owner: "Membership", next: "Confirm horse stabling and promote the remaining member registrations.",
    lesson: "At the annual meeting, cowboy and cowgirl faculty share cases on heat safety, horse care, and working with equipment. Pick a practice to teach back to your crew.",
    takeaway: "Use a short hands-on demonstration and ask a crew member to explain or show how they would apply it on their ranch.",
    questions: [
      ["How can you check that someone can use a new technique?", ["Ask them to explain or show it", "Count the slides they watched", "Ask if they liked the room"], 0, "A demonstration or explanation lets you see what the learner understood."],
      ["Which example will help a ranch crew apply the lesson?", ["An unrelated office scenario", "A familiar task such as moving tack or feed", "A list of terms without a scenario"], 1, "A familiar task makes it easier to connect the lesson to work."],
      ["What makes the lesson easier to share after the meeting?", ["A longer sign-in sheet", "An extra name tag", "A short checklist the crew can use in the field"], 2, "A practical checklist gives learners something they can reuse with their crew."]
    ]
  }
];

function demoRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const random = demoRandom(500);
const preferredTopics = ["heat", "msk", "horse", "first-aid", "meeting"];
const learners = periods.flatMap((period, wave) => Array.from({ length: period.count }, (_, index) => {
  const interest = random();
  const topic = preferredTopics[interest < .36 ? 0 : interest < .59 ? 1 : interest < .76 ? 2 : interest < .91 ? 3 : 4];
  const alternatives = preferredTopics.filter((item) => item !== topic);
  const topics = [topic];
  if (random() < .61) topics.push(alternatives[Math.floor(random() * alternatives.length)]);
  return {
    id: `WWMA-${String(wave * period.count + index + 1).padStart(3, "0")}`,
    role: random() < .52 ? "Cowgirl" : "Cowboy",
    period: period.id,
    topics,
    barrier: ["Schedule", "Distance", "Cost", "Internet", "None"][Math.floor(random() * 5)]
  };
}));

const activity = learners.flatMap((learner) => programs.flatMap((program) => {
  const fourthQuarter = learner.period === "2026-Q4";
  const interested = learner.topics.includes(program.id);
  const delivered = random() < (interested ? .94 : .32);
  const opened = delivered && random() < (interested ? .77 : .32);
  const clicked = opened && random() < (interested ? .65 : .21);
  const registered = random() < (clicked ? .69 : interested ? .15 : .024);
  const attended = registered && random() < (fourthQuarter ? .83 : .72);
  if (!delivered && !registered) return [];
  const refunded = program.price && registered && !attended && random() < .45;
  // Keep the same seeded campaign activity. Annual meeting bookings come from the separate event snapshot.
  const linkedProgram = program.id !== "meeting";
  if (!linkedProgram && !delivered) return [];
  return [{
    learner: learner.id, period: learner.period, program: program.id, delivered, opened, clicked,
    registered: linkedProgram && registered, attended: linkedProgram && attended,
    refund: linkedProgram && refunded ? program.price : 0,
    revenue: linkedProgram && registered && !refunded ? program.price : 0
  }];
}));

const plans = {
  "2026-Q3": { heat: [42, 0], msk: [44, 3740], horse: [45, 2925], "first-aid": [33, 0], meeting: [0, 0] },
  "2026-Q4": { heat: [56, 0], msk: [44, 3910], horse: [44, 2860], "first-aid": [40, 0], meeting: [0, 0] }
};

const memberNeeds = [
  {
    id: "saddle", label: "Saddle fit and riding comfort", program: "msk", threshold: .48,
    sponsor: "Copper Draw Saddlery", product: "Comfort-focused trail saddles and fitting support",
    activation: "Offer a saddle-fit demonstration at the lab and a fitting station at the annual meeting.",
    quote: "After a long ride, my saddle is the first thing I want to change."
  },
  {
    id: "water", label: "Keeping drinking water cold", program: "heat", threshold: .55,
    sponsor: "Mesa Chill Outfitters", product: "Durable insulated water bottles for ranch work",
    activation: "Supply refill stations at the annual meeting and a bottle giveaway tied to the heat webinar.",
    quote: "By midday, the water in my bottle is already warm."
  },
  {
    id: "kit", label: "Trail-ready first-aid supplies", program: "first-aid", threshold: .42,
    sponsor: "Switchback Supply Works", product: "Compact first-aid organizers for saddlebags",
    activation: "Provide sample kit organizers for a webinar walkthrough or a meeting demonstration.",
    quote: "I’d like a kit that stays organized in my saddlebag."
  }
];

function reportedNeed(learner, need, index) {
  const responseNumber = Number(learner.id.slice(-3));
  const signal = ((responseNumber * (73 + 19 * index) + 17 * index) % 503) / 503;
  return signal < (learner.topics.includes(need.program) ? need.threshold : .10);
}

const strategy = {
  meeting: { lead: "Membership + Marketing", action: "Start the registration push", message: "Lead with practical sessions, networking with other WWMA members and faculty, and complimentary horse stabling.", subject: "Join us at the Frontier Medicine Roundup" },
  msk: { lead: "Education + Marketing", action: "Fill the hands-on lab", message: "Lead with a saddle-fit demonstration and practical ways to handle gear and feed.", subject: "Get hands-on at the Ranch MSK Skills Lab" },
  horse: { lead: "Education + Marketing", action: "Cross-promote the horse-care lab", message: "Offer a hands-on option for members who want more confidence around the hitching rail.", subject: "Practice horse care at the Hitching Rail" },
  heat: { lead: "Marketing", action: "Use the free webinar to build reach", message: "Invite members to learn how to plan water breaks, shade, and a refill station.", subject: "Keep your crew cool on the range" },
  "first-aid": { lead: "Education + Marketing", action: "Promote the free trail webinar", message: "Give trail riders a practical reason to make a plan before their next ride.", subject: "Put a first-aid plan in your saddlebag" }
};

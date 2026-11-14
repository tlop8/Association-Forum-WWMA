"use strict";

const executiveYears = [2024, 2025, 2026];
const executiveQuarters = [
  {id: "Q1", months: "Jan–Mar"},
  {id: "Q2", months: "Apr–Jun"},
  {id: "Q3", months: "Jul–Sep"},
  {id: "Q4", months: "Oct–Dec"}
];
// Each schedule entry contains a date label and total registration capacity.
const executiveSchedule = {
  2024: {
    Q1: {msk: ["Feb 17", 132], heat: ["Mar 14", 260]},
    Q2: {horse: ["Apr 20", 140], "first-aid": ["Jun 13", 225]},
    Q3: {msk: ["Jul 20", 155], heat: ["Aug 15", 325]},
    Q4: {horse: ["Oct 12", 170], "first-aid": ["Nov 14", 250], meeting: ["Dec 7–8", 1800]}
  },
  2025: {
    Q1: {msk: ["Feb 15", 190], heat: ["Mar 13", 360]},
    Q2: {horse: ["Apr 19", 185], "first-aid": ["Jun 12", 285]},
    Q3: {msk: ["Jul 19", 208], heat: ["Aug 14", 410]},
    Q4: {horse: ["Oct 18", 220], "first-aid": ["Nov 6", 350], meeting: ["Dec 6–7", 2050]}
  },
  2026: {
    Q1: {msk: ["Feb 21", 225], horse: ["Mar 7", 120], heat: ["Mar 19", 400]},
    Q2: {horse: ["Apr 18", 230], msk: ["May 16", 140], "first-aid": ["Jun 11", 420]},
    Q3: {msk: ["Jul 18", 55], heat: ["Aug 13", 75], horse: ["Aug 22", 56], "first-aid": ["Sep 10", 60]},
    Q4: {msk: ["Oct 3", 48], heat: ["Oct 8", 90], horse: ["Oct 17", 52], "first-aid": ["Nov 5", 65], meeting: ["Dec 12–13", 2250]}
  }
};

const campaignYear = 2026;
const campaignQuarter = "Q4";
const registrationsSnapshotMonth = 10; // November, zero-based.
const calendarMonths = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const campaignEvents = Object.entries(executiveSchedule[campaignYear][campaignQuarter]).map(([id, [date]]) => {
  const [shortMonth, days] = date.split(" ");
  const monthIndex = calendarMonths.findIndex((month) => month.startsWith(shortMonth));
  const startDay = Number(days.split("–")[0]);
  const month = String(monthIndex + 1).padStart(2, "0");
  const day = String(startDay).padStart(2, "0");
  return {id, date: `${calendarMonths[monthIndex]} ${days}, ${campaignYear}`, startsOn: `${campaignYear}-${month}-${day}`};
}).sort((left, right) => left.startsOn.localeCompare(right.startsOn));
const campaignDate = (programId) => campaignEvents.find(({id}) => id === programId).date;

const annualMeeting = {
  quarter: campaignQuarter, dates: campaignDate("meeting"), memberGoal: 2000,
  memberRegistrations: 1640, guestRegistrations: 180, memberPrice: 145, guestPrice: 195,
  marketingLeadMonths: 7, projectedRegistrations: 2060
};

// Campaign-wide email activity through the November snapshot, including repeat sends.
const annualMeetingCampaign = {
  Q2: {delivered: 4800, opened: 2330, clicked: 640},
  Q3: {delivered: 9400, opened: 4720, clicked: 1530},
  Q4: {delivered: 6900, opened: 3490, clicked: 1190}
};

const programVenues = {
  meeting: "Cheyenne, WY", msk: "Fort Collins, CO", horse: "Laramie, WY", heat: "Online", "first-aid": "Online"
};

// Each program tuple contains registrations, attendance, net USD, planned attendance, and planned USD.
const historicalOperations = {
  2024: {
    Q1: {heat: [212, 148, 0, 155, 0], msk: [116, 98, 9690, 110, 10200]},
    Q2: {horse: [123, 104, 7800, 100, 7800], "first-aid": [189, 142, 0, 150, 0]},
    Q3: {heat: [276, 194, 0, 190, 0], msk: [131, 116, 10880, 120, 11050]},
    Q4: {meeting: [1550, 1370, 224750, 1440, 232000], horse: [155, 134, 9815, 128, 9750], "first-aid": [201, 162, 0, 165, 0]}
  },
  2025: {
    Q1: {heat: [316, 227, 0, 215, 0], msk: [174, 151, 14620, 150, 14875]},
    Q2: {horse: [165, 146, 10660, 142, 10400], "first-aid": [244, 201, 0, 195, 0]},
    Q3: {heat: [360, 282, 0, 270, 0], msk: [192, 179, 16150, 170, 15725]},
    Q4: {meeting: [1805, 1625, 260420, 1650, 263000], horse: [204, 185, 13130, 178, 13000], "first-aid": [317, 260, 0, 250, 0]}
  },
  2026: {
    Q1: {heat: [340, 268, 0, 250, 0], msk: [211, 192, 17850, 205, 18700], horse: [64, 57, 4030, 85, 6500]},
    Q2: {horse: [155, 139, 9750, 190, 13975], msk: [89, 78, 7310, 110, 10200], "first-aid": [327, 257, 0, 250, 0]}
  }
};

const membershipByQuarter = {
  Q1: {active: 3840, eligible: 780, renewed: 694, joined: 242},
  Q2: {active: 3995, eligible: 910, renewed: 819, joined: 246},
  Q3: {active: 4145, eligible: 1000, renewed: 912, joined: 238},
  Q4: {active: 4230, eligible: 710, renewed: 642, joined: 153}
};
const grantBudget = 150000;
const researchGrants = [
  {quarter: "Q1", project: "Ranch Heat Exposure Study", amount: 27500},
  {quarter: "Q2", project: "Saddle Fit and Rider Comfort", amount: 32000},
  {quarter: "Q3", project: "Rural First-Aid Access", amount: 24500},
  {quarter: "Q4", project: "Stock Handling and Injury Prevention", amount: 28500}
];

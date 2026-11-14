# Wild West Medical Association

WWMA is a fictional professional association. Its Frontier Field Office is a static, browser-only demonstration.

## Run locally

Open `index.html` in a modern browser. No installation or build is required. For a localhost preview, run this command from this folder and open [http://127.0.0.1:8000](http://127.0.0.1:8000).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

## Explore the Field Office

- Select **Start the quiz** on the welcome page to begin. The **Learner Quiz** asks five questions about role, experience, learning format, barriers, and interests. Select multiple formats, barriers, and topics. Results include three fictional course matches, including the WWMA annual meeting, with reasons and access tradeoffs.
- **Programs** previews fictional webinars, hands-on labs, field guides, and an annual meeting with agendas and fictional faculty. Topics include heat, joint strain, first aid, horse and cattle handling, animal-borne illness, hearing, dust and smoke, skin health, and stress.
- **Marketing Corral** (`#marketing`) builds editable outreach drafts for the learner quiz and sample courses. Copy or download text locally.
- **Research Roundup** (`#research`) filters fictional aggregate learning barriers by experience level and links each barrier to a program idea.
- **Department Trail Map** (`#trail-map`) shows how the teams use learner insights to plan education and outreach.

The app asks only for categorical preferences. It keeps answers and drafts in the current tab’s memory, which clears when refreshed. The dashboard uses two fixed fictional cohorts. Learners could select multiple barriers, so percentages do not sum to 100. Live quiz answers are independent of the dashboard.

## Artwork

`assets/frontier-ride.jpg` was created with the built-in image generation tool. The prompt called for a sepia, dry-paper engraving of a cowboy riding through the Southwestern desert, with layered mesas, a saguaro, a pale sun, and room for overlaid text.

## Association Action Plan

Open `demo.html` or select **Association Action Plan** in the learner quiz footer.

1. **Member Quiz Results** shows 500 hypothetical submissions. Filter the audience, replay the last 50 submissions, and download the response CSV.
2. **Marketing Plan** shows the fictional 2026 fall events in chronological order. Select an event for its editable promotion email and dated square or portrait PNG. Sponsor matches use hypothetical reports of saddle discomfort, warm drinking water, and first-aid kit needs.
3. **CEO Dashboard** opens with a Q1–Q4 switcher and six cards that lead to focused detail views. Program performance shows bookings, capacity, check-ins, and action flags. The annual meeting's venue has 2,250 bookable spots and a separate 2,000-member attendance goal; check-ins remain pending until the fictional event. In the revenue view, compare any two years from 2024–2026 by booked share of capacity and net revenue against each paid event’s own plan. YTD groups programs under Annual Meeting, Lab Courses, and Webinars and combines all sessions of each program into one row per year. Select a row to see net revenue per available spot. The Registrations view compares simulated new bookings by month with side-by-side bars. Each session stops adding registrations in its event month. The Annual Meeting campaign starts in May and includes a separately marked December projection. The grants view shows the $150,000 annual budget and lists awards for the selected quarter. The overview mix charts keep independent year selectors. Hover or focus on a chart item for details, select it to pin them, or export program metrics as CSV.

The 500 fictional response profiles and linked campaign, attendance, and payment activity are generated deterministically in `demo-data.js`. The CSV includes the same profile IDs, interests, barriers, and reported needs. Each learner may select several topics and register for several events. Attendance counts seats. Net revenue counts paid registration fees less refunds in USD. Free webinars generate no ticket revenue. The dashboard replay updates the count by adding the final 50 fictional profiles and their associated activity. Quiz answers entered by a visitor stay in that browser tab.

The event illustrations in `assets/action-plan-event-art.jpg` were generated with the built-in image tool. The prompt requested simple vintage Western screenprints, one main object per panel, with bold blocks of color and no lettering. The separate illustration in `assets/horse-care-poster-art.jpg` was generated with the same tool using the original horse tile as a reference. The prompt called for a beige, right-facing horse with a bridle and woodcut details on a deep blue-green field, with the neck extending into the lower half for overlaid white text. The app adds white titles, price details, and WWMA branding to the preview and exported PNGs.

The built-in image tool also created `assets/heat-on-the-range-poster-art.jpg`. The prompt used the original Heat on the Range tile as a reference and asked for a vintage canteen, a golden sun, and green saguaro cacti against a burnt terracotta desert, with space for the white poster title.

To update the existing GitHub Pages project, upload the package contents to the repository’s published `wwma-github/` folder. Open `demo.html` under the same published path.

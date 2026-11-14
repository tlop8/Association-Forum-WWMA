# Wild West Medical Association

WWMA is a fictional professional association. Its Frontier Field Office is a static, browser-only demonstration.

## Run locally

Open `index.html` in a modern browser. No installation or build is required. For a localhost preview, run this command from this folder and open [http://127.0.0.1:8000](http://127.0.0.1:8000).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

## Upload to GitHub

Create an empty GitHub repository. Extract the archive and put its contents at the repository root so that `index.html`, `.nojekyll`, and `assets/` sit alongside `README.md`. Include the dotfiles.

For a command-line upload, run the following from the extracted folder after replacing `YOUR-OWNER` and `YOUR-REPOSITORY`.

```sh
git init -b main
git add .
git commit -m "Add WWMA learner quiz"
git remote add origin https://github.com/YOUR-OWNER/YOUR-REPOSITORY.git
git push -u origin main
```

## Publish with GitHub Pages

In **Settings → Pages**, set **Source** to **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub displays the site URL there once deployment finishes. If you used another branch, select it instead of **main**. The app uses relative paths, and `.nojekyll` lets Pages serve the static files directly. Check the site's visibility before enabling Pages.

[GitHub Pages publishing setup](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Explore the Field Office

- Select **Start the quiz** on the welcome page to begin. The **Learner Quiz** asks five questions about role, experience, learning format, barriers, and interests. Select multiple formats, barriers, and topics. Results include three fictional course matches, including the WWMA annual meeting, with reasons and access tradeoffs.
- **Programs** previews fictional webinars, hands-on labs, field guides, and an annual meeting with agendas and fictional faculty. Topics include heat, joint strain, first aid, horse and cattle handling, animal-borne illness, hearing, dust and smoke, skin health, and stress.
- **Marketing Corral** (`#marketing`) builds editable outreach drafts for the learner quiz and sample courses. Copy or download text locally.
- **Research Roundup** (`#research`) filters fictional aggregate learning barriers by experience level and links each barrier to a program idea.
- **Department Trail Map** (`#trail-map`) shows how the teams use learner insights to plan education and outreach.

The app asks only for categorical preferences. It keeps answers and drafts in the current tab’s memory, which clears when refreshed. The dashboard uses two fixed fictional cohorts. Learners could select multiple barriers, so percentages do not sum to 100. Live quiz answers are independent of the dashboard.

## Artwork

`assets/frontier-ride.jpg` was created with the built-in image generation tool. The prompt called for a sepia, dry-paper engraving of a cowboy riding through the Southwestern desert, with layered mesas, a saguaro, a pale sun, and room for overlaid text.

Font license notices are included in `assets/`.

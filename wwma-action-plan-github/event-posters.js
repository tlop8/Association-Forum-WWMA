"use strict";

const posterDesigns = {
  heat: { artwork: "assets/heat-on-the-range-poster-art.jpg", background: "#82331e", line: "Water, rest, and shade for your crew.", tag: "Free webinar · Live or replay" },
  msk: { cell: 1, background: "#364933", line: "Work smarter with tack, feed, and gear.", tag: "Hands-on course · $85" },
  horse: { artwork: "assets/horse-care-poster-art.jpg", background: "#0e4144", line: "Daily horse care and confident handling.", tag: "Hands-on course · $65" },
  "first-aid": { cell: 3, background: "#1d334c", line: "Make a first-aid plan for remote rides.", tag: "Free webinar · Live or replay" },
  meeting: { cell: 4, background: "#743522", line: "Meet other WWMA members and faculty. Complimentary horse stabling.", tag: "Two days · $145 in person" }
};

function loadPosterImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = path;
  });
}

let posterAssets;
const posterArtwork = new Map();
let posterRequest = 0;

function loadEventArtwork(path) {
  if (!posterArtwork.has(path)) {
    const image = loadPosterImage(path).catch((error) => {
      posterArtwork.delete(path);
      throw error;
    });
    posterArtwork.set(path, image);
  }
  return posterArtwork.get(path);
}

function posterTextLines(context, text, width) {
  const lines = [""];
  for (const word of text.split(" ")) {
    const last = lines.length - 1;
    const combined = lines[last] ? lines[last] + " " + word : word;
    if (lines[last] && context.measureText(combined).width > width) lines.push(word);
    else lines[last] = combined;
  }
  return lines;
}

function drawPosterArtwork(ctx, art, design, width, height, square) {
  const artTop = square ? 28 : 40;
  const artBottom = height - (square ? 115 : 155);
  ctx.fillStyle = design.background;
  ctx.fillRect(0, 0, width, height);
  if (design.artwork) {
    ctx.drawImage(art, 0, artTop, width, artBottom - artTop);
  } else {
    const cellWidth = art.naturalWidth / 3;
    const cellHeight = art.naturalHeight / 2;
    const sourceX = (design.cell % 3) * cellWidth + 4;
    const sourceY = Math.floor(design.cell / 3) * cellHeight + 4;
    ctx.drawImage(art, sourceX, sourceY, cellWidth - 8, cellHeight - 8, 0, artTop, width, artBottom - artTop);
  }

  const lowerBlend = ctx.createLinearGradient(0, height * .52, 0, artBottom);
  lowerBlend.addColorStop(0, design.background + "00");
  lowerBlend.addColorStop(.6, design.background + "60");
  lowerBlend.addColorStop(1, design.background);
  ctx.fillStyle = lowerBlend;
  ctx.fillRect(0, height * .52, width, height - height * .52);

  const upperBlend = ctx.createLinearGradient(0, artTop, 0, artTop + 206);
  upperBlend.addColorStop(0, design.background);
  upperBlend.addColorStop(.36, design.background + "c0");
  upperBlend.addColorStop(1, design.background + "00");
  ctx.fillStyle = upperBlend;
  ctx.fillRect(0, artTop, width, 206);
}

async function renderEventPoster(program) {
  const request = ++posterRequest;
  const design = posterDesigns[program.id];
  const date = campaignDate(program.id);
  const canvas = document.getElementById("event-poster");
  const status = document.getElementById("poster-status");
  const downloadButton = document.getElementById("download-poster");
  const square = document.getElementById("poster-format").value === "square";
  const height = square ? 1080 : 1350;
  const width = 1080;
  canvas.setAttribute("aria-label", `${program.name} promotional poster. ${date}. ${design.line} ${design.tag}. Fictional WWMA event.`);
  downloadButton.disabled = true;
  status.textContent = "Preparing poster…";

  try {
    posterAssets ??= Promise.all([
      loadPosterImage("assets/action-plan-event-art.jpg"),
      loadPosterImage("assets/badge.svg"),
      document.fonts.load('68px Rye'),
      document.fonts.load('700 28px "DM Sans"')
    ]).catch((error) => {
      posterAssets = null;
      throw error;
    });
    const [art, badge] = await posterAssets;
    const artwork = design.artwork ? await loadEventArtwork(design.artwork) : art;
    if (request !== posterRequest) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    drawPosterArtwork(ctx, artwork, design, width, height, square);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#000a";
    ctx.shadowBlur = 11;
    ctx.shadowOffsetY = 3;
    const wordmark = "WWMA";
    const fullName = "Wild West Medical Association";
    const wordmarkFont = '34px Rye';
    const fullNameFont = '700 25px "DM Sans"';
    const badgeWidth = 57;
    const brandGap = 20;
    ctx.font = wordmarkFont;
    const wordmarkWidth = ctx.measureText(wordmark).width;
    ctx.font = fullNameFont;
    const brandWidth = badgeWidth + wordmarkWidth + ctx.measureText(fullName).width + brandGap * 3;
    const badgeX = (width - brandWidth) / 2;
    const wordmarkX = badgeX + badgeWidth + brandGap;
    const dividerX = wordmarkX + wordmarkWidth + brandGap;

    ctx.save();
    ctx.shadowColor = "transparent";
    ctx.drawImage(badge, badgeX, 35, badgeWidth, 61);
    ctx.restore();
    ctx.font = wordmarkFont;
    ctx.fillText(wordmark, wordmarkX, 77);
    ctx.strokeStyle = "#ffffffbf";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dividerX, 50);
    ctx.lineTo(dividerX, 83);
    ctx.stroke();
    ctx.font = fullNameFont;
    ctx.fillText(fullName, dividerX + brandGap, 76);
    ctx.textAlign = "center";

    ctx.font = '700 31px "DM Sans"';
    const description = posterTextLines(ctx, design.line, 870);
    const offerY = height - (square ? 118 : 147);
    const dateY = offerY - 41;
    const descriptionTop = dateY - 49 - (description.length - 1) * 37;
    const titleBottom = descriptionTop - (square ? 49 : 59);
    ctx.font = `${square ? 67 : 78}px Rye`;
    const title = posterTextLines(ctx, program.name, 922);
    const titleLeading = square ? 72 : 84;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = design.background + "d9";
    title.forEach((line, index) => {
      const baseline = titleBottom - (title.length - 1 - index) * titleLeading;
      ctx.strokeText(line, width / 2, baseline);
      ctx.fillText(line, width / 2, baseline);
    });

    ctx.font = '700 31px "DM Sans"';
    description.forEach((line, index) => ctx.fillText(line, width / 2, descriptionTop + index * 37));
    ctx.font = '700 37px "DM Sans"';
    ctx.fillText(date, width / 2, dateY);
    ctx.font = '700 27px "DM Sans"';
    ctx.fillText(design.tag.toUpperCase(), width / 2, offerY);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "#ffffff6b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(460, height - 84);
    ctx.lineTo(620, height - 84);
    ctx.stroke();
    ctx.font = '700 22px "DM Sans"';
    ctx.fillText("FICTIONAL WWMA EVENT", width / 2, height - 45);

    downloadButton.disabled = false;
    status.textContent = "";
  } catch {
    if (request === posterRequest) status.textContent = "Poster artwork could not load. Reload the workshop to try again.";
  }
}

function downloadEventPoster(programId) {
  const canvas = document.getElementById("event-poster");
  const format = document.getElementById("poster-format").value;
  const {startsOn} = campaignEvents.find(({id}) => id === programId);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${startsOn}-wwma-${programId}-${format}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById("poster-status").textContent = "PNG ready.";
  }, "image/png");
}

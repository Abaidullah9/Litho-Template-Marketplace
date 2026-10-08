/**
 * Brand asset generator for the Litho Template Marketplace.
 *
 * Renders the LITHO wordmark (and derived artwork) from a compact 6x7
 * blocky pixel font so the imagery matches the site's pixel aesthetic.
 * Outputs:
 *   site/assets/img/litho-wordmark.png   (656x192, transparent, brand orange)
 *   site/assets/img/litho-wordmark.svg   (same geometry, single-color fill)
 *   site/assets/img/readme-tagline.png   (1320x72 dark banner)
 *   site/assets/img/litho-template-marketplace-preview.png (1179x961 card)
 *   preview.png                           (1153x699 README hero card)
 *
 * Usage: node scripts/generate-brand-assets.mjs
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const BRAND_ORANGE = "#de6124";
const BRAND_ACCENT = "#ff5a36";
const BRAND_GREEN = "#9ece6a";
const DARK_BG = "#111111";
const CARD_BG = "#0b0b0d";
const LIGHT_TEXT = "#e6e6e9";

/** 6-wide x 7-tall blocky glyphs, stroke thickness 2. */
const FONT = {
  A: [".XXXX.", "XX..XX", "XX..XX", "XXXXXX", "XX..XX", "XX..XX", "XX..XX"],
  B: ["XXXXX.", "XX..XX", "XX..XX", "XXXXX.", "XX..XX", "XX..XX", "XXXXX."],
  C: [".XXXXX", "XX....", "XX....", "XX....", "XX....", "XX....", ".XXXXX"],
  D: ["XXXXX.", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XXXXX."],
  E: ["XXXXXX", "XX....", "XX....", "XXXXX.", "XX....", "XX....", "XXXXXX"],
  F: ["XXXXXX", "XX....", "XX....", "XXXXX.", "XX....", "XX....", "XX...."],
  G: [".XXXXX", "XX....", "XX....", "XX.XXX", "XX..XX", "XX..XX", ".XXXXX"],
  H: ["XX..XX", "XX..XX", "XX..XX", "XXXXXX", "XX..XX", "XX..XX", "XX..XX"],
  I: ["XXXXXX", "..XX..", "..XX..", "..XX..", "..XX..", "..XX..", "XXXXXX"],
  J: ["..XXXX", "...XX.", "...XX.", "...XX.", "...XX.", "XX.XX.", "XXXX.."],
  K: ["XX..XX", "XX.XX.", "XXXX..", "XXX...", "XXXX..", "XX.XX.", "XX..XX"],
  L: ["XX....", "XX....", "XX....", "XX....", "XX....", "XX....", "XXXXXX"],
  M: ["XX...X", "XXX.XX", "XXXXXX", "X.XX.X", "XX..XX", "XX..XX", "XX..XX"],
  N: ["XX...X", "XXX..X", "XXXX.X", "XX.XXX", "XX..XX", "XX...X", "XX...X"],
  O: [".XXXX.", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  P: ["XXXXX.", "XX..XX", "XX..XX", "XXXXX.", "XX....", "XX....", "XX...."],
  Q: [".XXXX.", "XX..XX", "XX..XX", "XX..XX", "XX.XXX", ".XXXX.", "....XX"],
  R: ["XXXXX.", "XX..XX", "XX..XX", "XXXXX.", "XX.XX.", "XX..XX", "XX..XX"],
  S: [".XXXXX", "XX....", "XX....", ".XXXX.", "....XX", "....XX", "XXXXX."],
  T: ["XXXXXX", "..XX..", "..XX..", "..XX..", "..XX..", "..XX..", "..XX.."],
  U: ["XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  V: ["XX..XX", "XX..XX", "XX..XX", "XX..XX", "XX..XX", ".XXXX.", "..XX.."],
  W: ["XX...X", "XX...X", "XX.X.X", "XX.X.X", "X.X.X.", "X.X.X.", "X...X."],
  X: ["XX..XX", "XX..XX", ".XXXX.", "..XX..", ".XXXX.", "XX..XX", "XX..XX"],
  Y: ["XX..XX", "XX..XX", ".XXXX.", "..XX..", "..XX..", "..XX..", "..XX.."],
  Z: ["XXXXXX", "....XX", "...XX.", "..XX..", ".XX...", "XX....", "XXXXXX"],
  0: [".XXXX.", "XX..XX", "XX.XXX", "XXX.XX", "XX..XX", "XX..XX", ".XXXX."],
  1: ["..XX..", ".XXX..", "..XX..", "..XX..", "..XX..", "..XX..", ".XXXX."],
  2: [".XXXX.", "XX..XX", "....XX", "...XX.", "..XX..", ".XX...", "XXXXXX"],
  3: ["XXXXX.", "....XX", "....XX", ".XXXX.", "....XX", "....XX", "XXXXX."],
  4: ["...XX.", "..XXX.", ".XXXX.", "XX.XX.", "XXXXXX", "...XX.", "...XX."],
  5: ["XXXXXX", "XX....", "XXXXX.", "....XX", "....XX", "XX..XX", ".XXXX."],
  6: ["..XXXX", ".XX...", "XX....", "XXXXX.", "XX..XX", "XX..XX", ".XXXX."],
  7: ["XXXXXX", "....XX", "...XX.", "..XX..", ".XX...", ".XX...", ".XX..."],
  8: [".XXXX.", "XX..XX", "XX..XX", ".XXXX.", "XX..XX", "XX..XX", ".XXXX."],
  9: [".XXXX.", "XX..XX", "XX..XX", ".XXXX.", "....XX", "...XX.", "XXXX.."],
  ".": ["......", "......", "......", "......", "......", ".XX...", ".XX..."],
  ",": ["......", "......", "......", "......", "......", ".XX...", "XX...."],
  "-": ["......", "......", "......", "XXXXXX", "......", "......", "......"],
};

const GLYPH_COLS = 6;
const GLYPH_ROWS = 7;

/** Display-grid wordmark glyphs: 14x18 cells, stroke 3, drawn on the exact
 *  8px header grid (656x192 = 82x24 cells at 8px) so the pixelated CSS
 *  downscale stays crisp. */
const WORDMARK_W = 14;
const WORDMARK_H = 18;
const WORDMARK = {
  L: (x, y) => x <= 2 || y >= 15,
  I: (x, y) => y <= 2 || y >= 15 || (x >= 5 && x <= 8),
  T: (x, y) => y <= 2 || (x >= 5 && x <= 8),
  H: (x, y) => x <= 2 || x >= 11 || (y >= 7 && y <= 10),
  O: (x, y) => x <= 2 || x >= 11 || y <= 2 || y >= 15,
};

function wordmarkLayout(text) {
  const rects = [];
  let x = 0;
  for (const ch of text) {
    if (ch === " ") {
      x += 4;
      continue;
    }
    const glyph = WORDMARK[ch];
    if (!glyph) throw new Error(`no wordmark glyph for ${JSON.stringify(ch)}`);
    for (let row = 0; row < WORDMARK_H; row++) {
      for (let col = 0; col < WORDMARK_W; col++) {
        if (glyph(col, row)) rects.push([x + col, row]);
      }
    }
    x += WORDMARK_W + 2;
  }
  return { rects, widthUnits: Math.max(0, x - 2), heightUnits: WORDMARK_H };
}

function wordmarkSvg({ fill = BRAND_ORANGE, bg = null, padTo = null }) {
  const laid = wordmarkLayout("LITHO");
  const cell = 8;
  const width = laid.widthUnits * cell;
  const height = laid.heightUnits * cell;
  let inner;
  if (padTo) {
    // Center on the final canvas, snapped to the 8px display grid.
    const x0 = Math.round((padTo.width - width) / 8) * 8;
    const y0 = Math.round((padTo.height - height) / 8) * 8;
    const bgRect = bg ? `<rect x="0" y="0" width="${padTo.width}" height="${padTo.height}" fill="${bg}"/>` : "";
    inner = bgRect + `<g transform="translate(${x0} ${y0})" shape-rendering="crispEdges">` + laid.rects
      .map(([cx, cy]) => `<rect x="${cx * cell}" y="${cy * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`)
      .join("") + "</g>";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${padTo.width} ${padTo.height}" width="${padTo.width}" height="${padTo.height}">${inner}</svg>`;
  }
  const bgRect = bg ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>` : "";
  const rects = laid.rects
    .map(([cx, cy]) => `<rect x="${cx * cell}" y="${cy * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${bgRect}<g shape-rendering="crispEdges">${rects}</g></svg>`;
}

/** Lay out text as { rects, widthUnits, heightUnits } in unit grid cells. */
function layout(text, { letterGapUnits = 2, spaceUnits = 4 } = {}) {
  const rects = [];
  let x = 0;
  for (const ch of text) {
    if (ch === " ") {
      x += spaceUnits;
      continue;
    }
    const glyph = FONT[ch];
    if (!glyph) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    for (let row = 0; row < GLYPH_ROWS; row++) {
      for (let col = 0; col < GLYPH_COLS; col++) {
        if (glyph[row][col] === "X") rects.push([x + col, row]);
      }
    }
    x += GLYPH_COLS + letterGapUnits;
  }
  return { rects, widthUnits: Math.max(0, x - letterGapUnits), heightUnits: GLYPH_ROWS };
}

/** Render laid-out text to an SVG fragment of <rect> elements. */
function svgRects(layout_, { x0, y0, cellW, cellH, fill }) {
  return layout_.rects
    .map(([cx, cy]) =>
      `<rect x="${x0 + cx * cellW}" y="${y0 + cy * cellH}" width="${cellW}" height="${cellH}"/>`)
    .join("")
    .replace(/\/>/g, ` fill="${fill}"/>`);
}

/** Pad an SVG to an exact canvas size, centered (optionally offset). */
function padSvg(inner, { width, height, fill = "none" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" fill="${fill}"/>${inner}</svg>`;
}

const root = resolve(import.meta.dirname, "..");
const img = (name) => resolve(root, "site/assets/img", name);

// ---------------------------------------------------------------------------
// 1. Wordmark: 656x192 transparent PNG + single-color SVG
// ---------------------------------------------------------------------------
{
  const svg = wordmarkSvg({ fill: BRAND_ORANGE, padTo: { width: 656, height: 192 } });
  await sharp(Buffer.from(svg)).png().toFile(img("litho-wordmark.png"));
  // The SVG is also used as a CSS mask (alpha matters, color free) — keep the
  // original single-color fill for continuity.
  writeFileSync(img("litho-wordmark.svg"), wordmarkSvg({ fill: BRAND_GREEN, padTo: { width: 656, height: 192 } }));
  console.log("wrote litho-wordmark.png + .svg");
}

// ---------------------------------------------------------------------------
// 2. README tagline banner: 1320x72 dark, orange pixel text
// ---------------------------------------------------------------------------
{
  const text = "BROWSE AND DISCOVER COMMUNITY PLUGINS FOR LITHO AT LITHOPLUGINS.COM";
  const laid = layout(text, { letterGapUnits: 1, spaceUnits: 3 });
  const cellW = 2.5;
  const cellH = 7;
  const textW = laid.widthUnits * cellW;
  const x0 = (1320 - textW) / 2;
  const y0 = (72 - laid.heightUnits * cellH) / 2;
  const inner = `<g shape-rendering="crispEdges">${svgRects(laid, { x0, y0, cellW, cellH, fill: BRAND_ACCENT })}</g>`;
  const svg = padSvg(inner, { width: 1320, height: 72, fill: DARK_BG });
  await sharp(Buffer.from(svg)).png().toFile(img("readme-tagline.png"));
  console.log("wrote readme-tagline.png");
}

// ---------------------------------------------------------------------------
// 3. Social preview card: 1179x961 dark with wordmark + subtitle
// ---------------------------------------------------------------------------
{
  const word = layout("LITHO");
  const wordCell = 26;
  const wordW = word.widthUnits * wordCell;
  const wordInner = svgRects(word, { x0: (1179 - wordW) / 2, y0: 260, cellW: wordCell, cellH: wordCell, fill: BRAND_ORANGE });

  const sub = layout("TEMPLATE MARKETPLACE", { letterGapUnits: 1, spaceUnits: 3 });
  const subCell = 8;
  const subW = sub.widthUnits * subCell;
  const subInner = svgRects(sub, { x0: (1179 - subW) / 2, y0: 560, cellW: subCell, cellH: subCell, fill: LIGHT_TEXT });

  const rule = `<rect x="${(1179 - 320) / 2}" y="680" width="320" height="6" fill="${BRAND_ACCENT}"/>`;
  const stats = layout("4892 TEMPLATES - 15 CATEGORIES", { letterGapUnits: 1, spaceUnits: 3 });
  const statsCell = 5;
  const statsW = stats.widthUnits * statsCell;
  const statsInner = svgRects(stats, { x0: (1179 - statsW) / 2, y0: 740, cellW: statsCell, cellH: statsCell, fill: "#9a9aa2" });

  const svg = padSvg(wordInner + subInner + rule + statsInner, { width: 1179, height: 961, fill: CARD_BG });
  await sharp(Buffer.from(svg)).png().toFile(img("litho-template-marketplace-preview.png"));
  console.log("wrote litho-template-marketplace-preview.png");
}

// ---------------------------------------------------------------------------
// 4. README hero preview: 1153x699 marketplace card (repo root preview.png)
//    Regenerated from source so it can never go stale against the live site.
// ---------------------------------------------------------------------------
{
  const W = 1153;
  const H = 699;
  const M = 72;
  const PANEL = "#12151a";
  const LINE = "#262a30";
  const MUTED = "#9a9aa2";
  const HERO_BG = "#0c0e10";
  const parts = [];

  const text = (str, { x, y, cell, fill, maxX = Infinity }) => {
    const laid = layout(str, { letterGapUnits: 1, spaceUnits: 2 });
    const width = laid.widthUnits * cell;
    if (Math.round(x + width) > maxX) {
      throw new Error(`brand preview text overflows: ${JSON.stringify(str)} ends at ${Math.round(x + width)}, limit ${maxX}`);
    }
    return svgRects(laid, { x0: Math.round(x), y0: Math.round(y), cellW: cell, cellH: cell, fill });
  };
  const textWidth = (str, cell) => layout(str, { letterGapUnits: 1, spaceUnits: 2 }).widthUnits * cell;

  const wordmarkCells = (x, y, cell, fill) => {
    const laid = wordmarkLayout("LITHO");
    return `<g shape-rendering="crispEdges">` + laid.rects
      .map(([cx, cy]) => `<rect x="${x + cx * cell}" y="${y + cy * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`)
      .join("") + `</g>`;
  };

  const chip = (label, x, y, { cell = 2.5, padX = 18, h = 40, bgFill, textFill }) => {
    const laid = layout(label, { letterGapUnits: 1, spaceUnits: 2 });
    const tw = laid.widthUnits * cell;
    const w = Math.round(tw + padX * 2);
    return {
      width: w,
      svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bgFill}"/>` + svgRects(laid, {
        x0: Math.round(x + (w - tw) / 2),
        y0: Math.round(y + (h - GLYPH_ROWS * cell) / 2),
        cellW: cell,
        cellH: cell,
        fill: textFill,
      }),
    };
  };

  // Header strip: LITHO wordmark + product name + catalogue size.
  parts.push(`<rect x="0" y="0" width="${W}" height="66" fill="#101317"/>`);
  parts.push(`<rect x="0" y="65" width="${W}" height="1" fill="${LINE}"/>`);
  parts.push(wordmarkCells(M, 6, 3, BRAND_ORANGE));
  parts.push(text("TEMPLATE MARKETPLACE", { x: M + 78 * 3 + 18, y: 23, cell: 3, fill: LIGHT_TEXT }));
  parts.push(text("4892 TEMPLATES", { x: W - M - textWidth("4892 TEMPLATES", 2.5), y: 24, cell: 2.5, fill: MUTED }));

  // Hero: eyebrow, two-line headline and a hatched art panel on the right.
  const artX = 760;
  const artY = 128;
  const artW = W - M - artX;
  const artH = 148;
  const textMaxX = artX - 40;
  parts.push(text("CURATED REGISTRY", { x: M, y: 100, cell: 3, fill: BRAND_ACCENT, maxX: textMaxX }));
  parts.push(text("DISCOVER", { x: M, y: 128, cell: 9, fill: LIGHT_TEXT, maxX: textMaxX }));
  parts.push(text("TEMPLATES", { x: M, y: 200, cell: 9, fill: LIGHT_TEXT, maxX: textMaxX }));
  parts.push(text("ACADEMIC AND TECHNICAL TEMPLATES FOR THESES,", { x: M, y: 286, cell: 2.75, fill: MUTED, maxX: W - M }));
  parts.push(text("PAPERS, REPORTS AND CVS.", { x: M, y: 308, cell: 2.75, fill: MUTED, maxX: W - M }));

  parts.push(`<defs><pattern id="heroHatch" width="14" height="14" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">` +
    `<line x1="0" y1="0" x2="0" y2="14" stroke="#23282f" stroke-width="2"/></pattern></defs>`);
  parts.push(`<rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${PANEL}" stroke="${LINE}"/>`);
  parts.push(`<rect x="${artX + 1}" y="${artY + 1}" width="${artW - 2}" height="${artH - 2}" fill="url(#heroHatch)" opacity="0.55"/>`);
  parts.push(`<rect x="${artX + 24}" y="${artY + 34}" width="${artW - 48}" height="3" fill="${BRAND_ACCENT}"/>`);
  parts.push(`<rect x="${artX + 24}" y="${artY + 74}" width="${Math.round((artW - 48) * 0.6)}" height="3" fill="${LINE}"/>`);
  parts.push(`<rect x="${artX + 24}" y="${artY + 104}" width="${Math.round((artW - 48) * 0.35)}" height="3" fill="${LINE}"/>`);

  // Primary/secondary actions.
  let chipX = M;
  const actions = [
    ["BROWSE TEMPLATES", true],
    ["READ THE GUIDELINES", false],
    ["SUBMIT A TEMPLATE", true],
  ];
  for (const [label, primary] of actions) {
    const drawn = chip(label, chipX, 348, primary
      ? { bgFill: BRAND_ACCENT, textFill: HERO_BG }
      : { bgFill: PANEL, textFill: LIGHT_TEXT });
    parts.push(drawn.svg);
    chipX += drawn.width + 12;
  }

  // Catalogue strip: three on-brand card placeholders.
  parts.push(text("RECENTLY ADDED", { x: M, y: 418, cell: 3, fill: MUTED }));
  parts.push(`<rect x="${M + textWidth("RECENTLY ADDED", 3) + 24}" y="428" width="${W - 2 * M - textWidth("RECENTLY ADDED", 3) - 24}" height="1" fill="${LINE}"/>`);

  const cards = [
    { title: "THESIS", tags: ["LATEX", "REPORT"] },
    { title: "JOURNAL PAPER", tags: ["TWO COLUMN", "BIBTEX"] },
    { title: "RESUME", tags: ["ONE PAGE", "MODERN"] },
  ];
  const cardW = 325;
  const cardGap = 17;
  const cardH = 232;
  const cardY = 448;
  cards.forEach((card, index) => {
    const x = M + index * (cardW + cardGap);
    parts.push(`<rect x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${PANEL}" stroke="${LINE}"/>`);
    parts.push(`<rect x="${x + 1}" y="${cardY + 1}" width="${cardW - 2}" height="128" fill="url(#heroHatch)" opacity="0.4"/>`);
    parts.push(text(card.title, { x: x + 16, y: cardY + 146, cell: 3, fill: LIGHT_TEXT, maxX: x + cardW - 16 }));
    let tagX = x + 16;
    for (const tag of card.tags) {
      const drawn = chip(tag, tagX, cardY + 186, { cell: 2, padX: 10, h: 26, bgFill: "#171b21", textFill: MUTED });
      parts.push(drawn.svg);
      tagX += drawn.width + 8;
    }
  });

  const svg = padSvg(parts.join(""), { width: W, height: H, fill: HERO_BG });
  await sharp(Buffer.from(svg)).png().toFile(resolve(root, "preview.png"));
  console.log("wrote preview.png (README hero)");
}

console.log("brand assets regenerated.");

/**
 * Build step (docs/12 S5): a 1200 × 630 link-preview card for every
 * public page that has no image of its own, written to dist/og/. Called
 * by prerender.js, which points each page's og:image at its card.
 *
 * satori lays the card out as SVG and resvg turns it into a PNG; both run
 * only here, at build time. Fonts are the TTF copies in og-fonts/ (OFL,
 * licences alongside): the site's woff2 files can't be read by satori,
 * and Noto Sans Bengali covers Bangla post titles.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = join(HERE, "og-fonts");

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const COLORS = {
  canvas: "#0e0e10",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  faint: "#52525b",
  accent: "#a3e635",
};

let fonts;
function loadFonts() {
  fonts ??= [
    ["Geist", "Geist-Regular.ttf", 400],
    ["Geist", "Geist-SemiBold.ttf", 600],
    ["Noto Sans Bengali", "NotoSansBengali-Regular.ttf", 400],
    ["Noto Sans Bengali", "NotoSansBengali-SemiBold.ttf", 600],
  ].map(([name, file, weight]) => ({
    name,
    data: readFileSync(join(FONT_DIR, file)),
    weight,
    style: "normal",
  }));
  return fonts;
}

/** A satori element: the same shape React elements have. */
function h(type, style, ...children) {
  return {
    type,
    props: { style, children: children.flat().filter((c) => c != null) },
  };
}

function titleSize(title) {
  if (title.length > 70) return 50;
  if (title.length > 38) return 60;
  return 74;
}

const PADDING_X = 72;
const PADDING_Y = 64;
const CONTENT_WIDTH = OG_WIDTH - 2 * PADDING_X;
const FOOTER_HEIGHT = 30;

/**
 * The card for one page: name and role at the top, the page's title and
 * description in the middle, the site address at the bottom. Text only:
 * neither satori nor resvg can read the WebP project covers.
 * @param {{ eyebrow?: string, title: string, description?: string, host: string }} card
 */
function cardElement({ eyebrow, title, description, host }) {
  return h(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      padding: `${PADDING_Y}px ${PADDING_X}px`,
      backgroundColor: COLORS.canvas,
      backgroundImage:
        "radial-gradient(circle at 92% 0%, rgba(163, 230, 53, 0.22), transparent 55%)",
      fontFamily: "Geist, Noto Sans Bengali",
      color: COLORS.text,
    },
    h(
      "div",
      { display: "flex", alignItems: "center", gap: 18 },
      h(
        "div",
        {
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: COLORS.accent,
          color: COLORS.canvas,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          fontWeight: 600,
        },
        "J",
      ),
      h("div", { fontSize: 30, fontWeight: 600 }, "Jahid Hasan"),
      h(
        "div",
        { fontSize: 26, color: COLORS.muted },
        "· Frontend Developer & Junior Software Engineer",
      ),
    ),
    h(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flexGrow: 1,
        width: CONTENT_WIDTH,
        paddingBottom: 48,
        gap: 20,
      },
      eyebrow
        ? h(
            "div",
            {
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.accent,
            },
            eyebrow,
          )
        : null,
      h(
        "div",
        {
          display: "block",
          width: CONTENT_WIDTH,
          fontSize: titleSize(title),
          fontWeight: 600,
          lineHeight: 1.12,
          letterSpacing: -1.5,
          color: COLORS.text,
          lineClamp: 3,
        },
        title,
      ),
      description
        ? h(
            "div",
            {
              display: "block",
              width: CONTENT_WIDTH,
              fontSize: 28,
              lineHeight: 1.4,
              color: COLORS.muted,
              lineClamp: 2,
            },
            description,
          )
        : null,
    ),
    h(
      "div",
      // Pinned from the top: a flowed footer, or one set with `bottom`,
      // lands off the card in satori (it over-measures clamped text).
      {
        position: "absolute",
        left: PADDING_X,
        top: OG_HEIGHT - PADDING_Y - FOOTER_HEIGHT,
        height: FOOTER_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 20,
      },
      h("div", {
        width: 96,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
      }),
      h("div", { fontSize: 24, color: COLORS.faint }, host),
    ),
  );
}

/**
 * @param {Parameters<typeof cardElement>[0]} card
 * @returns {Promise<Buffer>} PNG
 */
export async function renderOgImage(card) {
  const svg = await satori(cardElement(card), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: loadFonts(),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } })
    .render()
    .asPng();
}

/**
 * What a page's card says. Titles drop the " — Jahid Hasan" suffix, which
 * the card already shows at the top.
 * @param {{ path: string, title: string, description: string }} route
 */
export function cardFor(route) {
  const title = route.title.replace(/\s+—\s+Jahid Hasan$/, "");
  let eyebrow;
  if (route.path.startsWith("/work/")) {
    // "Sarabo — Case study": the eyebrow already says it.
    return {
      eyebrow: "Case study",
      title: title.replace(/\s+—\s+Case study$/i, ""),
      description: route.description,
    };
  }
  if (route.path.startsWith("/writing/")) eyebrow = "Writing";
  return { eyebrow, title, description: route.description };
}

/** dist/og/work/sarabo.png → "/og/work/sarabo.png" */
export function ogImagePath(path) {
  return `/og${path === "/" ? "/home" : path}.png`;
}

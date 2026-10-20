import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolveSiteUrl } from "./scripts/site-url.js";
import { withDefaultSettings } from "../server/src/schemas/settings-defaults.js";

// Forward the resolved base URL (explicit VITE_SITE_URL, else Vercel's
// production URL, else the dev origin) to the client so site.js and
// usePageMeta build correct absolute canonical/OG URLs on any deployment.
process.env.VITE_SITE_URL = resolveSiteUrl();

// Preview deployments must never be indexed; production must never carry
// the noindex tag. VERCEL_ENV is set by Vercel builds only.
function previewNoindexPlugin() {
  return {
    name: "preview-noindex",
    transformIndexHtml(html) {
      if (process.env.VERCEL_ENV !== "preview") return html;
      return html.replace(
        "</title>",
        '</title>\n    <meta name="robots" content="noindex" />',
      );
    },
  };
}

// The first-paint script in index.html needs the site's default theme,
// accent, and font (Site settings) before any JavaScript bundle loads.
function siteDefaultsPlugin() {
  return {
    name: "site-defaults",
    transformIndexHtml(html) {
      const content = JSON.parse(
        readFileSync(
          new URL("./src/generated/content.json", import.meta.url),
          "utf8",
        ),
      );
      const settings = withDefaultSettings(content.settings);
      const { theme, accent, font } = settings.appearance;
      return html
        .replace("__SITE_INTRO__", settings.intro.enabled ? "on" : "off")
        .replace("__SITE_THEME__", theme)
        .replace("__SITE_ACCENT__", accent)
        .replace("__SITE_FONT__", font);
    },
  };
}

// The Latin Geist files are needed for the first paint; found late (through
// the stylesheet), they swap in after the text is laid out and shift it.
const PRELOADED_FONTS = [
  /geist-latin-wght-normal-.*\.woff2$/,
  /geist-mono-latin-wght-normal-.*\.woff2$/,
];

function preloadFontsPlugin() {
  return {
    name: "preload-fonts",
    transformIndexHtml(html, context) {
      if (!context.bundle) return html;
      const files = Object.keys(context.bundle);
      return PRELOADED_FONTS.flatMap((pattern) =>
        files.filter((file) => pattern.test(file)),
      ).map((file) => ({
        tag: "link",
        attrs: {
          rel: "preload",
          href: `/${file}`,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
        injectTo: "head",
      }));
    },
  };
}

/**
 * The Content-Security-Policy for the built site, as a <meta> tag so the
 * inline first-paint script can be allowed by its hash (its text changes
 * with Site settings). Images come from the site and Vercel Blob uploads;
 * the admin's GitHub avatar and Blob uploads, and the contact form's
 * Web3Forms request, are the only other hosts. Inline styles stay allowed:
 * Motion and React set them while animating.
 */
function contentSecurityPolicyPlugin() {
  let apiOrigin = "";
  return {
    name: "content-security-policy",
    apply: "build",
    configResolved(config) {
      // Same default as API_BASE_URL in src/lib/api.js. In production the
      // API is on the site's own origin (an empty base URL).
      const base = config.env.VITE_API_BASE_URL ?? "http://localhost:5000";
      apiOrigin = URL.canParse(base) ? new URL(base).origin : "";
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
          // Browsers hash the parsed text, where CRLF (a Windows checkout)
          // is already LF.
          ([, code]) =>
            `'sha256-${createHash("sha256")
              .update(code.replace(/\r\n?/g, "\n"))
              .digest("base64")}'`,
        );
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(" ")}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://avatars.githubusercontent.com",
          "font-src 'self'",
          `connect-src 'self' ${apiOrigin} https://api.web3forms.com https://vercel.com https://*.public.blob.vercel-storage.com`.replace(
            "  ",
            " ",
          ),
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-src 'none'",
        ].join("; ");
        return [
          {
            tag: "meta",
            attrs: { "http-equiv": "Content-Security-Policy", content: policy },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    previewNoindexPlugin(),
    siteDefaultsPlugin(),
    preloadFontsPlugin(),
    contentSecurityPolicyPlugin(),
  ],
  build: isSsrBuild
    ? // The prerender bundle (src/entry-server.jsx) runs once in Node at
      // build time; dependencies stay external and nothing is split.
      {}
    : {
        rollupOptions: {
          output: {
            // Split the two big, rarely-changing vendor groups out of the
            // main chunk: app-code deploys then invalidate a much smaller
            // file, and no single chunk exceeds Rollup's 500 kB warning line.
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              motion: ["motion"],
            },
          },
        },
      },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
}));

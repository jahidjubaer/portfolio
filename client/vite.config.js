import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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
      const { theme, accent, font } = withDefaultSettings(
        content.settings,
      ).appearance;
      return html
        .replace("__SITE_THEME__", theme)
        .replace("__SITE_ACCENT__", accent)
        .replace("__SITE_FONT__", font);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    previewNoindexPlugin(),
    siteDefaultsPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split the two big, rarely-changing vendor groups out of the main
        // chunk: app-code deploys then invalidate a much smaller file, and
        // no single chunk exceeds Rollup's 500 kB warning line.
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
});

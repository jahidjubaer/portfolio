import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolveSiteUrl } from "./scripts/site-url.js";

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

export default defineConfig({
  plugins: [react(), tailwindcss(), previewNoindexPlugin()],
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

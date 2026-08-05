import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "build/",
      ".react-router/",
      "node_modules/",
      "coverage/",
      "playwright-report/",
      "test-results/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "playwright.config.ts", "vitest.config.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Route modules intentionally export `meta`/`loader`/`action` alongside
    // the default component — this is React Router's framework convention,
    // not a fast-refresh hazard.
    files: ["app/routes/**/*.tsx", "app/root.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);

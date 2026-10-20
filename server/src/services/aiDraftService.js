import { generateText, Output } from "ai";
import { z } from "zod";
import { env } from "../config/env.js";
import { fetchRepoContext } from "./githubApi.js";

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function isAiConfigured() {
  return Boolean(env.aiGatewayApiKey || env.onVercel);
}

// CLAUDE.md content rules, restated for the model: nothing that isn't in
// the repository, and no inflated framing.
const INSTRUCTIONS = `You draft portfolio content for Jahid Hasan, a junior frontend developer (React) who is growing into full-stack work and exploring AI/ML.
You get facts from one or more of his public GitHub repositories (a project can have several, e.g. a client and a server). Write only what those facts support.
Rules:
- Never invent users, clients, metrics, performance numbers, results, team size, dates, or awards.
- Do not call him senior, expert, or an established AI/ML engineer. No hype words ("cutting-edge", "revolutionary", "seamless").
- Name only technologies that appear in the manifests, languages, file names, or README.
- Plain, specific English. First person ("I built…") where a sentence needs a subject.
- When the repository doesn't say something a reader would expect (the problem it solves, his role, screenshots, a live link), list it in missingContent as a short instruction to Jahid instead of guessing.`;

/** The repo facts as one prompt, largest parts trimmed first. */
function describeRepo(repo) {
  const languages = Object.entries(repo.languages)
    .map(([name, bytes]) => `${name} (${bytes} bytes)`)
    .join(", ");
  return [
    `Repository: ${repo.name} (${repo.url})`,
    `Description: ${repo.description ?? "none"}`,
    `Topics: ${repo.topics.join(", ") || "none"}`,
    `Homepage: ${repo.homepage ?? "none"}`,
    `Created: ${repo.createdAt}; last push: ${repo.pushedAt}`,
    `Languages: ${languages || "unknown"}`,
    `Files (${repo.fileCount} total, first ${repo.files.length}):\n${repo.files.join("\n")}`,
    ...repo.manifests.map((m) => `--- ${m.path} ---\n${m.text}`),
    `Recent commit messages:\n${repo.commitMessages.join("\n") || "none"}`,
    `--- README ---\n${repo.readme ?? "(no README)"}`,
  ].join("\n\n");
}

const projectDraftSchema = z.object({
  title: z.string().describe("Human-readable project name"),
  summary: z
    .string()
    .describe("One or two sentences: what it is and what it does"),
  projectType: z
    .string()
    .describe(
      'Short label, e.g. "Full-stack web app", "React SPA", "CLI tool"',
    ),
  stack: z.array(z.string()).describe("Technologies actually used"),
  capabilities: z
    .array(z.string())
    .describe("3-6 concrete features, each a short phrase"),
  caseStudy: z
    .array(z.object({ heading: z.string(), body: z.string() }))
    .describe(
      "2-4 short Markdown sections: Overview, What I built, Technical decisions. Only facts from the repo.",
    ),
  seoTitle: z.string().describe("Under 60 characters"),
  seoDescription: z.string().describe("Under 160 characters"),
  missingContent: z.array(z.string()),
});

const learningDraftSchema = z.object({
  title: z.string().describe('The topic, e.g. "Problem solving with C++"'),
  summary: z
    .string()
    .describe("What was learned, from the topics the repo covers"),
  practice: z
    .string()
    .describe("How it was practised, from the repo's structure"),
  status: z
    .enum(["learning", "applied", "exploring"])
    .describe(
      "learning = still studying, applied = used in real work, exploring = early. Base it on activity and depth.",
    ),
  missingContent: z.array(z.string()),
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function requireAi() {
  if (!isAiConfigured()) {
    throw httpError(
      503,
      "AI drafting isn't configured. Set AI_GATEWAY_API_KEY locally (on Vercel it works without one).",
    );
  }
}

async function draft(schema, prompt) {
  try {
    const { output } = await generateText({
      model: env.aiModel,
      instructions: INSTRUCTIONS,
      prompt,
      output: Output.object({ schema }),
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(60_000),
    });
    return output;
  } catch (error) {
    const status = error.statusCode ?? error.status;
    if (status === 429) {
      throw httpError(
        429,
        "The AI service is busy or the free credit is used up. Try again later.",
      );
    }
    if (status === 401 || status === 403) {
      throw httpError(502, "AI Gateway rejected the credentials.");
    }
    throw httpError(502, "The AI draft failed. Try again in a moment.");
  }
}

// More repos than this makes the prompt too long for a useful draft.
export const MAX_DRAFT_REPOS = 4;

/** The prompt for one project made of one or more repos. */
export function projectPrompt(repos) {
  if (repos.length === 1) {
    return `Draft a portfolio project entry from this repository.\n\n${describeRepo(repos[0])}`;
  }
  const names = repos.map((repo) => repo.name).join(", ");
  return [
    `Draft ONE portfolio project entry for a single project whose code is split across ${repos.length} repositories (${names}), for example a client and a server. Describe the project as a whole; say which part lives in which repository where it helps.`,
    ...repos.map(
      (repo, index) =>
        `===== Repository ${index + 1} of ${repos.length} =====\n${describeRepo(repo)}`,
    ),
  ].join("\n\n");
}

/**
 * Project fields drafted from one or more repos (e.g. client + server).
 * Nothing is saved: the admin form shows the draft for Jahid to check
 * and edit.
 * @param {string[]} repoNames
 */
export async function draftProjectFromRepos(repoNames) {
  requireAi();
  const repos = await Promise.all(repoNames.map(fetchRepoContext));
  const result = await draft(projectDraftSchema, projectPrompt(repos));
  return {
    title: result.title,
    summary: result.summary,
    projectType: result.projectType,
    stack: result.stack,
    capabilities: result.capabilities,
    caseStudy: result.caseStudy.length
      ? {
          sections: result.caseStudy.map((section, index) => ({
            id: slugify(section.heading) || `section-${index + 1}`,
            heading: section.heading,
            type: "text",
            body: section.body,
          })),
        }
      : null,
    seo: { title: result.seoTitle, description: result.seoDescription },
    missingContent: result.missingContent,
  };
}

/**
 * Learning-track fields drafted from a repo (e.g. a practice repo). The
 * start month comes from the repo's creation date, not the model.
 * @param {string} repoName
 */
export async function draftLearningTrackFromRepo(repoName) {
  requireAi();
  const repo = await fetchRepoContext(repoName);
  const result = await draft(
    learningDraftSchema,
    `Draft a learning-track entry (a topic Jahid studied and practised) from this repository.\n\n${describeRepo(repo)}`,
  );
  return {
    title: result.title,
    summary: result.summary,
    practice: result.practice,
    status: result.status,
    since: repo.createdAt?.slice(0, 7),
    repos: [repo.name],
    missingContent: result.missingContent,
  };
}

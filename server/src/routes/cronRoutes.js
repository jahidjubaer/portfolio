import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { env } from "../config/env.js";
import { syncGitHubRepos } from "../services/githubSyncService.js";

/**
 * Scheduled jobs, called by Vercel Cron (see vercel.json) with
 * `Authorization: Bearer <CRON_SECRET>`. Without a secret the jobs can't
 * be triggered at all, so nobody else can burn the GitHub rate limit.
 *
 *   GET /github-sync    daily refresh of the GitHub repo cache
 */
export const cronRouter = Router();

function hasCronSecret(req) {
  const expected = Buffer.from(`Bearer ${env.cronSecret}`);
  const given = Buffer.from(req.get("authorization") ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

cronRouter.use((req, res, next) => {
  if (!env.cronSecret) {
    res
      .status(503)
      .json({ success: false, error: "Scheduled jobs aren't configured." });
    return;
  }
  if (!hasCronSecret(req)) {
    res.status(401).json({ success: false, error: "Not authorized." });
    return;
  }
  next();
});

cronRouter.get("/github-sync", async (_req, res) => {
  const data = await syncGitHubRepos();
  res.json({ success: true, data });
});

import { syncGitHubRepos } from "./githubSyncService.js";
import { syncCodingStats } from "./codingStatsService.js";
import {
  getContentSnapshot,
  getProfile,
  getSettings,
} from "./contentService.js";
import { publishSite } from "./publishService.js";

// Sync timestamps change on every run; only the numbers matter.
function withoutTimestamps(value) {
  return JSON.stringify(value, (key, inner) =>
    key === "syncedAt" ? undefined : inner,
  );
}

async function syncedFacts() {
  const { github, coding } = await getContentSnapshot();
  return withoutTimestamps({ github, coding });
}

/**
 * The daily job: refresh the GitHub cache and the coding stats, then
 * rebuild the site when what visitors would see changed (and the setting
 * allows it). Each step's failure is reported without stopping the rest.
 */
export async function runDailySync() {
  const before = await syncedFacts();
  const result = { github: null, coding: null, published: false, errors: {} };
  try {
    result.github = await syncGitHubRepos();
  } catch (error) {
    result.errors.github = error.message;
  }
  try {
    const profile = await getProfile();
    const stats = await syncCodingStats(profile?.problemSolving);
    result.coding = { errors: stats.errors };
  } catch (error) {
    result.errors.coding = error.message;
  }

  const settings = await getSettings();
  if (settings.autoPublishAfterSync && (await syncedFacts()) !== before) {
    try {
      await publishSite({ login: "daily sync" });
      result.published = true;
    } catch (error) {
      result.errors.publish = error.message;
    }
  }
  return result;
}

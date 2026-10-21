import * as admin from "../services/adminContentService.js";
import { getContentSnapshot } from "../services/contentService.js";
import { createUploadToken } from "../services/uploadService.js";
import {
  getGitHubOverview,
  syncGitHubRepos,
} from "../services/githubSyncService.js";
import { getPublishStatus, publishSite } from "../services/publishService.js";
import {
  getCodingStatus,
  syncCodingStats,
} from "../services/codingStatsService.js";
import {
  draftLearningTrackFromRepo,
  draftProjectFromRepos,
  isAiConfigured,
  MAX_DRAFT_REPOS,
} from "../services/aiDraftService.js";
import * as messages from "../services/messageService.js";
import {
  getBooksStatus,
  setBookHidden,
  syncBooks,
} from "../services/goodreadsService.js";
import { getBeyond } from "../services/contentService.js";
import { getProfile } from "../services/contentService.js";

function notFound() {
  const error = new Error("Not found");
  error.status = 404;
  return error;
}

// Only known collection names reach the service layer.
function singletonName(req) {
  const { name } = req.params;
  if (!Object.hasOwn(admin.SINGLETON_SCHEMAS, name)) throw notFound();
  return name;
}

function listName(req) {
  const { name } = req.params;
  if (!Object.hasOwn(admin.LIST_SCHEMAS, name)) throw notFound();
  return name;
}

// The admin also gets the GitHub cache, so stale-repo warnings show up
// everywhere in the panel without a second request.
export async function getContent(_req, res) {
  const content = await getContentSnapshot({ includeDrafts: true });
  res.json({
    success: true,
    data: {
      ...content,
      repositories: await getGitHubOverview(content.projects),
      publishing: await getPublishStatus(),
      codingStatus: await getCodingStatus(),
      bookStatus: await getBooksStatus(),
      messages: await messages.listMessages(),
      aiConfigured: isAiConfigured(),
    },
  });
}

export async function putSingleton(req, res) {
  const data = await admin.replaceSingleton(singletonName(req), req.body);
  res.json({ success: true, data });
}

export async function postItem(req, res) {
  const data = await admin.createItem(listName(req), req.body);
  res.status(201).json({ success: true, data });
}

export async function putItem(req, res) {
  const data = await admin.updateItem(listName(req), req.params.key, req.body);
  res.json({ success: true, data });
}

export async function deleteItem(req, res) {
  await admin.deleteItem(listName(req), req.params.key);
  res.json({ success: true });
}

export async function putOrder(req, res) {
  await admin.reorderItems(listName(req), req.body?.keys);
  res.json({ success: true });
}

export async function postUploadToken(req, res) {
  const data = await createUploadToken(req.body ?? {});
  res.json({ success: true, data });
}

export async function postGitHubSync(_req, res) {
  const data = await syncGitHubRepos();
  res.json({ success: true, data });
}

export async function postPublish(req, res) {
  const data = await publishSite(req.admin);
  res.json({ success: true, data });
}

export async function postCodingSync(_req, res) {
  const profile = await getProfile();
  await syncCodingStats(profile?.problemSolving);
  // With the per-judge merge, as the admin's Coding stats panel shows it.
  res.json({ success: true, data: await getCodingStatus() });
}

export async function postBooksSync(_req, res) {
  const beyond = await getBeyond();
  if (!beyond?.goodreadsUserId) {
    throw badRequest("Add your Goodreads user ID under Beyond first.");
  }
  await syncBooks(beyond.goodreadsUserId);
  res.json({ success: true, data: await getBooksStatus() });
}

export async function patchBook(req, res) {
  const data = await setBookHidden(req.params.bookId, req.body?.hidden);
  res.json({ success: true, data });
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

const isRepoName = (name) =>
  typeof name === "string" && /^[\w.-]{1,100}$/.test(name);

function repoName(req) {
  const name = req.body?.repo;
  if (!isRepoName(name)) throw badRequest("Pick a repository.");
  return name;
}

/** `{ repos: [...] }`, or a single `{ repo }`. */
function repoNames(req) {
  const names = req.body?.repos ?? [req.body?.repo];
  if (!Array.isArray(names) || names.length === 0 || !names.every(isRepoName)) {
    throw badRequest("Pick at least one repository.");
  }
  const unique = [...new Set(names)];
  if (unique.length > MAX_DRAFT_REPOS) {
    throw badRequest(`Pick at most ${MAX_DRAFT_REPOS} repositories.`);
  }
  return unique;
}

export async function postProjectDraft(req, res) {
  const data = await draftProjectFromRepos(repoNames(req));
  res.json({ success: true, data });
}

export async function postLearningDraft(req, res) {
  const data = await draftLearningTrackFromRepo(repoName(req));
  res.json({ success: true, data });
}

export async function patchMessage(req, res) {
  const data = await messages.updateMessage(req.params.id, req.body);
  res.json({ success: true, data });
}

export async function deleteMessage(req, res) {
  await messages.deleteMessage(req.params.id);
  res.json({ success: true });
}

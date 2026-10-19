import * as admin from "../services/adminContentService.js";
import { getContentSnapshot } from "../services/contentService.js";
import { createUploadToken } from "../services/uploadService.js";
import {
  getGitHubOverview,
  syncGitHubRepos,
} from "../services/githubSyncService.js";
import { getPublishStatus, publishSite } from "../services/publishService.js";

function notFound() {
  const error = new Error("Not found");
  error.status = 404;
  return error;
}

// Only known collection names reach the service layer.
function singletonName(req) {
  const { name } = req.params;
  if (!(name in admin.SINGLETON_SCHEMAS)) throw notFound();
  return name;
}

function listName(req) {
  const { name } = req.params;
  if (!(name in admin.LIST_SCHEMAS)) throw notFound();
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

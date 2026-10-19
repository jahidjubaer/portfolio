import * as content from "../services/contentService.js";

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

/**
 * Wraps a service read as a GET handler answering `{ success, data }`.
 * A missing singleton (database not seeded yet) is a 404, not a crash.
 * @param {(req: import("express").Request) => Promise<unknown>} read
 * @param {string} missingMessage
 */
function sendContent(read, missingMessage = "Content not found.") {
  return async (req, res) => {
    const data = await read(req);
    if (data === null) throw notFound(missingMessage);
    res.json({ success: true, data });
  };
}

export const getProfile = sendContent(content.getProfile, "Profile not found.");
export const getBeyond = sendContent(content.getBeyond);
export const listProjects = sendContent(content.listProjects);
export const getProject = sendContent(
  (req) => content.getProject(req.params.slug),
  "Project not found.",
);
export const listExperience = sendContent(content.listExperience);
export const listSkills = sendContent(content.listSkills);
export const listCertifications = sendContent(content.listCertifications);
export const listPhotos = sendContent(content.listPhotos);
export const listPosts = sendContent(() => content.listPosts());
export const getPost = sendContent(
  (req) => content.getPublishedPost(req.params.slug),
  "Post not found.",
);
export const getSnapshot = sendContent(() => content.getContentSnapshot());

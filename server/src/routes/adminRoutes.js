import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireSameOrigin } from "../middleware/requireSameOrigin.js";
import { adminRateLimit, aiRateLimit } from "../middleware/rateLimits.js";
import * as controller from "../controllers/adminContentController.js";

/**
 * Everything under /api/admin requires a signed-in admin, and writes must
 * come from the site itself. Unknown admin paths answer 401 before 404,
 * so the API doesn't reveal what exists to signed-out callers.
 *
 *   GET    /content                  everything, for the editors
 *   PUT    /singletons/:name         profile | beyond | learning | settings
 *   POST   /lists/:name              projects | organizations | experience |
 *                                    education | skills | certifications |
 *                                    learningTracks | photos | posts
 *   PUT    /lists/:name/order        { keys: [...] } in display order
 *   PUT    /lists/:name/:key         replace one item (key = slug or id)
 *   DELETE /lists/:name/:key
 *   POST   /uploads                  { kind, filename, contentType } →
 *                                    one-time Vercel Blob client token
 *   POST   /github/sync              refresh the GitHub repo cache now
 *   POST   /publish                  rebuild the public site (deploy hook)
 *   POST   /coding/sync              refresh Codeforces / VJudge / repo stats
 *   POST   /ai/project-draft         { repos: [...] } (or { repo }) →
 *                                    project fields to review
 *   POST   /ai/learning-draft        { repo } → learning-track fields
 *   PATCH  /messages/:id             { read?, archived? }
 *   DELETE /messages/:id
 */
export const adminRouter = Router();

adminRouter.use(adminRateLimit, requireSameOrigin, requireAdmin);

adminRouter.get("/content", controller.getContent);
adminRouter.put("/singletons/:name", controller.putSingleton);
adminRouter.post("/lists/:name", controller.postItem);
adminRouter.put("/lists/:name/order", controller.putOrder);
adminRouter.put("/lists/:name/:key", controller.putItem);
adminRouter.delete("/lists/:name/:key", controller.deleteItem);
adminRouter.post("/uploads", controller.postUploadToken);
adminRouter.post("/github/sync", controller.postGitHubSync);
adminRouter.post("/publish", controller.postPublish);
adminRouter.post("/coding/sync", controller.postCodingSync);
adminRouter.post("/ai/project-draft", aiRateLimit, controller.postProjectDraft);
adminRouter.post(
  "/ai/learning-draft",
  aiRateLimit,
  controller.postLearningDraft,
);
adminRouter.patch("/messages/:id", controller.patchMessage);
adminRouter.delete("/messages/:id", controller.deleteMessage);

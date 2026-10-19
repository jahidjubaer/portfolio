import { Router } from "express";
import * as controller from "../controllers/publicContentController.js";

/** Read-only content for the public site and its build step. */
export const publicContentRouter = Router();

publicContentRouter.get("/public/content", controller.getSnapshot);
publicContentRouter.get("/public/profile", controller.getProfile);
publicContentRouter.get("/public/projects", controller.listProjects);
publicContentRouter.get("/public/projects/:slug", controller.getProject);
publicContentRouter.get("/public/experience", controller.listExperience);
publicContentRouter.get("/public/skills", controller.listSkills);
publicContentRouter.get(
  "/public/certifications",
  controller.listCertifications,
);
publicContentRouter.get("/public/beyond", controller.getBeyond);
publicContentRouter.get("/public/photos", controller.listPhotos);
publicContentRouter.get("/public/posts", controller.listPosts);
publicContentRouter.get("/public/posts/:slug", controller.getPost);

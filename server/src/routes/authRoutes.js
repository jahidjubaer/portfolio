import { Router } from "express";
import * as controller from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireSameOrigin } from "../middleware/requireSameOrigin.js";
import { authRateLimit } from "../middleware/rateLimits.js";

/** GitHub OAuth sign-in for the admin panel. */
export const authRouter = Router();

authRouter.use("/auth", authRateLimit);
authRouter.get("/auth/github", controller.startGitHubLogin);
authRouter.get("/auth/github/callback", controller.handleGitHubCallback);
authRouter.get("/auth/me", requireAdmin, controller.getCurrentAdmin);
authRouter.post("/auth/logout", requireSameOrigin, controller.logout);

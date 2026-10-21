import { Router } from "express";
import { z } from "zod";
import { askRateLimit } from "../middleware/rateLimits.js";
import { requireSameOrigin } from "../middleware/requireSameOrigin.js";
import { QUESTION_MAX, askAboutJahid } from "../services/askService.js";

const questionSchema = z.object({
  question: z
    .string({ error: "Ask a question." })
    .trim()
    .min(3, "Ask a question.")
    .max(QUESTION_MAX, `Keep it under ${QUESTION_MAX} characters.`),
});

/**
 * POST /ask — answers a visitor's question about Jahid from the site's
 * published content (see askService.js). Same-origin only, rate limited,
 * and nothing is stored.
 */
export const askRouter = Router();

askRouter.post("/ask", askRateLimit, requireSameOrigin, async (req, res) => {
  const parsed = questionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res
      .status(400)
      .json({ success: false, error: parsed.error.issues[0].message });
    return;
  }
  const data = await askAboutJahid(parsed.data.question);
  res.json({ success: true, data });
});

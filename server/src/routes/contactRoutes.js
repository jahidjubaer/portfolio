import { Router } from "express";
import { contactRateLimit } from "../middleware/rateLimits.js";
import { requireSameOrigin } from "../middleware/requireSameOrigin.js";
import { saveMessage } from "../services/messageService.js";

/**
 * POST /contact — stores a contact-form message for the admin inbox.
 * The browser also sends it to Web3Forms for the email notification, so
 * this is the record, not the delivery.
 */
export const contactRouter = Router();

contactRouter.post(
  "/contact",
  contactRateLimit,
  requireSameOrigin,
  async (req, res) => {
    // Honeypot: report success to the bot without storing anything.
    if (req.body?.companyWebsite) {
      res.status(201).json({ success: true });
      return;
    }
    const { name, email, subject, message } = req.body ?? {};
    await saveMessage({ name, email, subject, message });
    res.status(201).json({ success: true });
  },
);

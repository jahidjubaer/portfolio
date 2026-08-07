import { Router } from "express";
import { postContact } from "../controllers/contactController.js";
import { contactRateLimit } from "../middleware/contactRateLimit.js";

export const contactRouter = Router();

contactRouter.post("/contact", contactRateLimit, postContact);

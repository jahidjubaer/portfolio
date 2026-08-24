import { Router } from "express";
import { getPhotography } from "../controllers/photographyController.js";

export const photographyRouter = Router();

photographyRouter.get("/photography", getPhotography);

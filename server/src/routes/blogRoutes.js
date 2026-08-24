import { Router } from "express";
import { getBlogPosts } from "../controllers/blogController.js";

export const blogRouter = Router();

blogRouter.get("/blog/posts", getBlogPosts);

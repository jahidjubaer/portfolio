import { getLearningPosts } from "../services/bloggerService.js";

export async function getBlogPosts(_req, res) {
  const result = await getLearningPosts();

  if (!result.ok && result.reason === "not-configured") {
    // Not an error — Jahid simply hasn't configured a Blogger blog yet.
    // The client renders its own honest "being prepared" state for this.
    res.status(200).json({
      success: true,
      configured: false,
      posts: [],
      source: "Blogger",
    });
    return;
  }

  if (!result.ok) {
    res.status(502).json({
      success: false,
      message: "Learning posts couldn't be loaded right now.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    configured: true,
    posts: result.posts,
    source: "Blogger",
  });
}

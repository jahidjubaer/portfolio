import { getPhotographyPhotos } from "../services/photographyBloggerService.js";

export async function getPhotography(_req, res) {
  const result = await getPhotographyPhotos();

  if (!result.ok && result.reason === "not-configured") {
    // Not an error — no Photography Blogger URL configured yet. The client
    // falls back to local assets or its own honest "being prepared" state.
    res.status(200).json({
      success: true,
      configured: false,
      photos: [],
      source: "Blogger",
    });
    return;
  }

  if (!result.ok) {
    res.status(502).json({
      success: false,
      message: "Photography couldn't be loaded right now.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    configured: true,
    photos: result.photos,
    source: "Blogger",
  });
}

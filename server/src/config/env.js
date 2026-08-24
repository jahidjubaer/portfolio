import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  // Shared with the client's VITE_BLOGGER_BLOG_URL / VITE_PHOTOGRAPHY_BLOGGER_URL
  // — one Blogger blog per feature, one env var each. In production both the
  // static build and this API read the same Vercel environment variable
  // pool (the VITE_ prefix only affects Vite's client bundling step, not
  // Node's process.env), so a single value configures both sides.
  bloggerBlogUrl: process.env.VITE_BLOGGER_BLOG_URL || "",
  photographyBlogUrl: process.env.VITE_PHOTOGRAPHY_BLOGGER_URL || "",
};

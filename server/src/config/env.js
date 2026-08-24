import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  // Shared with the client's VITE_BLOGGER_BLOG_URL — one Blogger blog, one
  // env var. In production both the static build and this API read the same
  // Vercel environment variable pool, so a single value configures both.
  bloggerBlogUrl: process.env.VITE_BLOGGER_BLOG_URL || "",
};

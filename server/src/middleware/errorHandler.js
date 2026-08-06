import { env } from "../config/env.js";

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: status === 500 ? "Internal server error" : err.message,
    ...(env.nodeEnv !== "production" && status === 500
      ? { detail: err.message }
      : {}),
  });
}

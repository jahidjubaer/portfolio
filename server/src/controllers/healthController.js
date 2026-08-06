import { env } from "../config/env.js";

export function getHealth(_req, res) {
  res.json({
    success: true,
    service: "jahid-portfolio-api",
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
}

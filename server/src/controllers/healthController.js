import { env } from "../config/env.js";
import { isDatabaseConfigured } from "../db/client.js";

export function getHealth(_req, res) {
  res.json({
    success: true,
    service: "jahid-portfolio-api",
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    // Configuration only — health checks never open a database connection.
    database: isDatabaseConfigured() ? "configured" : "not-configured",
  });
}

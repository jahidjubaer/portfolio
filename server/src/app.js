import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { apiNotFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({ success: true, service: "jahid-portfolio-api" });
});

app.use("/api", healthRouter);
app.use("/api", apiNotFoundHandler);

app.use(errorHandler);

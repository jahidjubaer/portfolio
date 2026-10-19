import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { publicContentRouter } from "./routes/publicContentRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { cronRouter } from "./routes/cronRoutes.js";
import { apiNotFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// Vercel sits in front as one proxy hop: trust its X-Forwarded-* headers so
// req.protocol is https and rate limits key on the real client IP.
app.set("trust proxy", 1);

app.use(helmet());
// credentials: the admin panel sends its session cookie cross-port in dev.
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "jahid-portfolio-api",
    message: "Jahid Hasan portfolio API. See /api/health for status.",
  });
});

app.use("/api", healthRouter);
app.use("/api", publicContentRouter);
app.use("/api", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cron", cronRouter);
app.use("/api", apiNotFoundHandler);

app.use(errorHandler);

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalRateLimiter } from "./middleware/rateLimit.js";
import { requestId } from "./middleware/requestId.js";
import { requireJsonContentType } from "./middleware/requireJson.js";
import { apiRouter } from "./routes/index.js";
import { NotFoundError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

const parseCorsOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const createExpressApp = () => {
  const app = express();
  const allowedOrigins = parseCorsOrigins(config.corsOrigin);

  if (config.isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: config.isProduction ? { maxAge: 15552000, includeSubDomains: true } : false,
    }),
  );
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        logger.warn("CORS origin rejected", { origin });
        callback(null, false);
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      credentials: false,
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"), {
      fallthrough: false,
      maxAge: config.isProduction ? "7d" : 0,
    }),
  );
  app.use(requestId);
  app.use(requireJsonContentType);
  app.use(generalRateLimiter);
  app.use("/api", apiRouter);

  app.use((req, _res, next) => {
    logger.warn("Route not found", { method: req.method, path: req.originalUrl, requestId: req.requestId });
    next(new NotFoundError("Route not found"));
  });
  app.use(errorHandler);

  return app;
};

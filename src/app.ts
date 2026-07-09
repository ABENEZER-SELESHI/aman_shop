import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalRateLimiter } from "./middleware/rateLimit.js";
import { requestId } from "./middleware/requestId.js";
import { apiRouter } from "./routes/index.js";
import { NotFoundError } from "./utils/errors.js";

export const createExpressApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);
  app.use(generalRateLimiter);

  app.use("/api", apiRouter);

  app.use((req, _res, next) => next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`)));
  app.use(errorHandler);

  return app;
};

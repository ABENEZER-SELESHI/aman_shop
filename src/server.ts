import { createExpressApp } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./database/prisma.js";
import { logger } from "./utils/logger.js";

const FORCE_SHUTDOWN_MS = 10_000;

const app = createExpressApp();

const server = app.listen(config.port, () => {
  logger.info("Aman Shop backend started", { port: config.port, env: config.env });
});

const shutdown = async (signal: string) => {
  logger.info("Shutdown signal received", { signal });
  const force = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, FORCE_SHUTDOWN_MS);
  force.unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    message: reason instanceof Error ? reason.message : String(reason),
  });
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message });
  void shutdown("uncaughtException");
});

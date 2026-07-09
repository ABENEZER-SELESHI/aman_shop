import { createExpressApp } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./database/prisma.js";
import { logger } from "./utils/logger.js";

const app = createExpressApp();

const server = app.listen(config.port, () => {
  logger.info("Aman Shop backend started", { port: config.port, env: config.env });
});

const shutdown = async (signal: string) => {
  logger.info("Shutdown signal received", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

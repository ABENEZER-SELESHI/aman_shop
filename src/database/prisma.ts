import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment ? ["warn", "error"] : ["error"],
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

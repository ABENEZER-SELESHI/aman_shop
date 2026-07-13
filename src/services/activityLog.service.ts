import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";

type LogInput = {
  actorType: "seller" | "system" | "customer";
  actorId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export class ActivityLogService {
  async log(input: LogInput): Promise<void> {
    await prisma.activityLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        message: input.message,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async list(filters: { limit?: number; offset?: number; action?: string } = {}) {
    const limit = Math.min(filters.limit ?? 50, 100);
    const offset = filters.offset ?? 0;
    return prisma.activityLog.findMany({
      where: filters.action ? { action: filters.action } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }
}

export const activityLogService = new ActivityLogService();

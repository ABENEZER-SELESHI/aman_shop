import { OrderStatus } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { activityLogService } from "./activityLog.service.js";

export class DashboardService {
  async getOverview() {
    const [ordersByStatus, productTotal, productAvailable, productUnavailable, revenueAgg, recentOrders, recentLogs, mapOrders] =
      await Promise.all([
        prisma.order.groupBy({
          by: ["status"],
          where: { deletedAt: null },
          _count: { _all: true },
        }),
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.product.count({ where: { deletedAt: null, available: true } }),
        prisma.product.count({ where: { deletedAt: null, available: false } }),
        prisma.order.aggregate({
          where: {
            deletedAt: null,
            status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.COMPLETED] },
          },
          _sum: { subtotalEtb: true },
          _count: { _all: true },
        }),
        prisma.order.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        activityLogService.list({ limit: 10 }),
        prisma.order.findMany({
          where: {
            deletedAt: null,
            deliveryLat: { not: null },
            deliveryLng: { not: null },
            status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED] },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            reference: true,
            status: true,
            customerName: true,
            deliveryLat: true,
            deliveryLng: true,
            createdAt: true,
          },
        }),
      ]);

    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const row of ordersByStatus) {
      statusCounts[row.status] = row._count._all;
    }

    return {
      orders: {
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        byStatus: statusCounts,
        openValueEtb: revenueAgg._sum.subtotalEtb ?? 0,
      },
      products: {
        total: productTotal,
        available: productAvailable,
        unavailable: productUnavailable,
      },
      recentOrders,
      recentLogs,
      mapOrders: mapOrders.map((order) => ({
        id: order.id,
        reference: order.reference,
        status: order.status,
        customerName: order.customerName,
        deliveryLat: order.deliveryLat,
        deliveryLng: order.deliveryLng,
        createdAt: order.createdAt,
      })),
    };
  }
}

export const dashboardService = new DashboardService();

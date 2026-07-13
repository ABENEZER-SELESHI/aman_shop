import { OrderStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import type { CreateOrderBody, UpdateOrderStatusBody } from "../validators/order.validator.js";
import { sendSuccess } from "../utils/response.js";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(req.body as CreateOrderBody, req.requestId);
  sendSuccess(res, "Order created", order, 201);
};

/** Public confirmation lookup — returns masked PII unless the caller is an authenticated seller. */
export const getOrderByReference = async (req: Request, res: Response): Promise<void> => {
  const reference = String(req.params.reference);
  if (req.seller) {
    const order = await orderService.getByReference(reference);
    sendSuccess(res, "Order retrieved", order);
    return;
  }
  const order = await orderService.getPublicByReference(reference);
  sendSuccess(res, "Order retrieved", order);
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  const query = req.query as { status?: OrderStatus; limit?: number; offset?: number };
  const orders = await orderService.listOrders({
    status: query.status,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
  });
  sendSuccess(res, "Orders retrieved", orders);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as UpdateOrderStatusBody;
  const order = await orderService.updateStatus(String(req.params.reference), body.status, req.seller?.id);
  sendSuccess(res, "Order status updated", order);
};

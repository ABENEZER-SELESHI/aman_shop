import { OrderStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import type { CreateOrderBody, UpdateOrderStatusBody } from "../validators/order.validator.js";
import { sendSuccess } from "../utils/response.js";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(req.body as CreateOrderBody, req.requestId);
  sendSuccess(res, "Order created", order, 201);
};

export const getOrderByReference = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.getByReference(String(req.params.reference));
  sendSuccess(res, "Order retrieved", order);
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
  const orders = await orderService.listOrders({ status, limit, offset });
  sendSuccess(res, "Orders retrieved", orders);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as UpdateOrderStatusBody;
  const order = await orderService.updateStatus(String(req.params.reference), body.status);
  sendSuccess(res, "Order status updated", order);
};

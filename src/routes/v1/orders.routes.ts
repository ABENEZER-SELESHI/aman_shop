import { Router } from "express";
import {
  createOrder,
  getOrderByReference,
  listOrders,
  updateOrderStatus,
} from "../../controllers/order.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { optionalSellerAuth } from "../../middleware/optionalAuth.js";
import { orderRateLimiter } from "../../middleware/rateLimit.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderReferenceParamsSchema,
  updateOrderStatusSchema,
} from "../../validators/order.validator.js";

export const ordersRouter = Router();

ordersRouter.post("/", orderRateLimiter, validateBody(createOrderSchema), asyncHandler(createOrder));
ordersRouter.get(
  "/",
  asyncHandler(requireSellerAuth),
  validateQuery(listOrdersQuerySchema),
  asyncHandler(listOrders),
);
ordersRouter.get(
  "/:reference",
  orderRateLimiter,
  asyncHandler(optionalSellerAuth),
  validateParams(orderReferenceParamsSchema),
  asyncHandler(getOrderByReference),
);
ordersRouter.patch(
  "/:reference/status",
  asyncHandler(requireSellerAuth),
  validateParams(orderReferenceParamsSchema),
  validateBody(updateOrderStatusSchema),
  asyncHandler(updateOrderStatus),
);

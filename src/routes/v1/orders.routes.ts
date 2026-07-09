import { Router } from "express";
import { createOrder, getOrderByReference, listOrders, updateOrderStatus } from "../../controllers/order.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { orderRateLimiter } from "../../middleware/rateLimit.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createOrderSchema, updateOrderStatusSchema } from "../../validators/order.validator.js";

export const ordersRouter = Router();

ordersRouter.post("/", orderRateLimiter, validateBody(createOrderSchema), asyncHandler(createOrder));
ordersRouter.get("/", asyncHandler(requireSellerAuth), asyncHandler(listOrders));
ordersRouter.get("/:reference", asyncHandler(getOrderByReference));
ordersRouter.patch(
  "/:reference/status",
  asyncHandler(requireSellerAuth),
  validateBody(updateOrderStatusSchema),
  asyncHandler(updateOrderStatus),
);

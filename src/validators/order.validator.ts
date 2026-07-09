import { z } from "zod";
import { PICKUP_OPTIONS } from "../constants/index.js";
import { isValidEthiopianPhone } from "../utils/phone.js";

const orderLineSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  unitPriceEtb: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(100),
});

export const createOrderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(80),
    customerPhone: z.string().trim().refine(isValidEthiopianPhone, "Invalid Ethiopian phone number"),
    customerNote: z.string().trim().max(400).optional().default(""),
    preferredPickup: z.enum(PICKUP_OPTIONS),
    lines: z.array(orderLineSchema).min(1).max(50),
    subtotalEtb: z.number().int().nonnegative(),
  })
  .refine((value) => value.lines.reduce((sum, line) => sum + line.unitPriceEtb * line.quantity, 0) === value.subtotalEtb, {
    message: "subtotalEtb must equal the sum of line totals",
    path: ["subtotalEtb"],
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;

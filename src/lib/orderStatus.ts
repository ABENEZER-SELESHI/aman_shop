import type { PublicOrderStatus } from "@/services/orders";

export const TRACK_STEPS: Array<{
  status: Exclude<PublicOrderStatus, "CANCELLED">;
  title: string;
  description: string;
}> = [
  {
    status: "NEW",
    title: "Order received",
    description: "We have your request and will review it shortly.",
  },
  {
    status: "CONFIRMED",
    title: "Confirmed",
    description: "Your order is confirmed. Delivery or pickup will be arranged with you.",
  },
  {
    status: "COMPLETED",
    title: "Completed",
    description: "Order fulfilled — thank you for shopping with Aman Shop.",
  },
];

const STATUS_INDEX: Record<Exclude<PublicOrderStatus, "CANCELLED">, number> = {
  NEW: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
};

export function statusLabel(status: PublicOrderStatus): string {
  switch (status) {
    case "NEW":
      return "Received";
    case "CONFIRMED":
      return "Confirmed";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function activeStepIndex(status: PublicOrderStatus): number {
  if (status === "CANCELLED") return -1;
  return STATUS_INDEX[status];
}

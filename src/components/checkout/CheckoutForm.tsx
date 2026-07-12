"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { PayInPersonBanner } from "@/components/cart/PayInPersonBanner";
import { OrderSummary } from "./OrderSummary";
import { siteConfig } from "@/lib/config";
import { isValidEthiopianPhone } from "@/lib/phone";
import { createOrder } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/Toast";
import { PICKUP_OPTIONS } from "@/types";

const schema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  customerPhone: z
    .string()
    .trim()
    .refine(isValidEthiopianPhone, "Enter a valid Ethiopian phone (09…, 07…, or +251…)"),
  preferredPickup: z.enum(PICKUP_OPTIONS),
  customerNote: z.string().trim().max(400).optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const hasUnavailable = useCartStore((s) => s.hasUnavailable());
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredPickup: "Flexible / message me",
      customerNote: "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">Your cart is empty. Add pieces before ordering.</p>
        <Button className="mt-6" onClick={() => router.push("/shop")}>
          Browse shop
        </Button>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (hasUnavailable) {
      toast("Remove unavailable items before ordering", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        ...values,
        customerNote: values.customerNote ?? "",
        lines: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          unitPriceEtb: item.unitPriceEtb,
          quantity: item.quantity,
        })),
        subtotalEtb: subtotal,
      });
      const orderId = order.reference || order.id;
      clearCart();
      toast("Order request sent", "success");
      router.push(`/order/confirmed/${orderId}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not place order", "error");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <PayInPersonBanner />
        <p className="text-sm text-[var(--muted)]">
          You will pay in person. No payment is taken on this website.
        </p>
        <p className="text-sm text-[var(--muted)]">Pickup: {siteConfig.pickupNote}</p>

        <div>
          <label htmlFor="customerName" className="mb-1.5 block text-sm text-[var(--ink)]">
            Full name
          </label>
          <input
            id="customerName"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            autoComplete="name"
            {...register("customerName")}
          />
          {errors.customerName ? (
            <p className="mt-1 text-sm text-red-700">{errors.customerName.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="customerPhone" className="mb-1.5 block text-sm text-[var(--ink)]">
            Phone
          </label>
          <input
            id="customerPhone"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            autoComplete="tel"
            placeholder="09********"
            {...register("customerPhone")}
          />
          {errors.customerPhone ? (
            <p className="mt-1 text-sm text-red-700">{errors.customerPhone.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="preferredPickup" className="mb-1.5 block text-sm text-[var(--ink)]">
            Preferred pickup
          </label>
          <select
            id="preferredPickup"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            {...register("preferredPickup")}
          >
            {PICKUP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.preferredPickup ? (
            <p className="mt-1 text-sm text-red-700">{errors.preferredPickup.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="customerNote" className="mb-1.5 block text-sm text-[var(--ink)]">
            Note <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="customerNote"
            rows={4}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            placeholder="Gift wrap, timing, or other details"
            {...register("customerNote")}
          />
          {errors.customerNote ? (
            <p className="mt-1 text-sm text-red-700">{errors.customerNote.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full sm:w-auto" loading={submitting} disabled={hasUnavailable}>
          Submit order request
        </Button>
      </form>
      <OrderSummary />
    </div>
  );
}

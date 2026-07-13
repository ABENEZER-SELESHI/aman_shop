"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { EmptyState, EmptyStateLink } from "@/components/ui/EmptyState";
import { PayInPersonBanner } from "@/components/cart/PayInPersonBanner";
import { DeliveryLocationField, type DeliveryCoords } from "./DeliveryLocationField";
import { OrderSummary } from "./OrderSummary";
import { siteConfig } from "@/lib/config";
import { isValidEthiopianPhone } from "@/lib/phone";
import { createOrder } from "@/services/orders";
import { rememberLocalOrder } from "@/lib/localOrders";
import { useCartStore } from "@/store/cart";
import { resolveCartAvailability, useCatalogMap } from "@/hooks/useCatalog";
import { useToast } from "@/components/ui/Toast";
import { PICKUP_OPTIONS } from "@/types";
import { cn } from "@/utils/cn";

const DRAFT_KEY = "aman-shop:checkout-draft:v1";
const NOTE_MAX = 400;

const schema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  customerPhone: z
    .string()
    .trim()
    .refine(isValidEthiopianPhone, "Enter a valid Ethiopian phone (09…, 07…, or +251…)"),
  preferredPickup: z.enum(PICKUP_OPTIONS),
  customerNote: z.string().trim().max(NOTE_MAX).optional(),
});

type FormValues = z.infer<typeof schema>;

const fieldClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] transition-colors placeholder:text-[var(--muted)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

const SUBMIT_COPY = [
  "Sending your order request…",
  "Almost there…",
  "Confirming with Aman Shop…",
] as const;

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const { byId, isSuccess, isError, isFetching } = useCatalogMap();
  const catalogReady = isSuccess || isError;
  const hasUnavailable = useMemo(
    () =>
      items.some((item) =>
        resolveCartAvailability(item.productId, byId, {
          catalogReady,
          cartAvailable: item.available,
          isFetching,
        }).unavailable,
      ),
    [items, byId, catalogReady, isFetching],
  );
  const [delivery, setDelivery] = useState<DeliveryCoords | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState<string>(SUBMIT_COPY[0]);
  const [draftRestored, setDraftRestored] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      preferredPickup: "Flexible / message me",
      customerNote: "",
      customerName: "",
      customerPhone: "",
    },
  });

  const noteValue = watch("customerNote") ?? "";
  const noteLength = noteValue.length;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<FormValues>;
      reset({
        customerName: draft.customerName ?? "",
        customerPhone: draft.customerPhone ?? "",
        preferredPickup: draft.preferredPickup ?? "Flexible / message me",
        customerNote: draft.customerNote ?? "",
      });
      setDraftRestored(true);
    } catch {
      // ignore corrupt draft
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // private mode / quota
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!submitting) return;
    let i = 0;
    setSubmitLabel(SUBMIT_COPY[0]);
    const id = window.setInterval(() => {
      i = (i + 1) % SUBMIT_COPY.length;
      setSubmitLabel(SUBMIT_COPY[i]);
    }, 2200);
    return () => window.clearInterval(id);
  }, [submitting]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing to order yet"
        description="Add vases or baskets to your cart, then come back to send an order request. You’ll pay in person at pickup."
        action={<EmptyStateLink href="/shop">Browse the shop</EmptyStateLink>}
      />
    );
  }

  const showError = (name: keyof FormValues) =>
    Boolean(errors[name] && (touchedFields[name] || isSubmitted));

  const onSubmit = handleSubmit(async (values) => {
    if (hasUnavailable) {
      toast("Remove unavailable items before ordering", "error");
      return;
    }
    if (!delivery) {
      setDeliveryError("Please share your device location for delivery.");
      toast("Delivery location is required", "error");
      return;
    }
    setDeliveryError(undefined);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast("You’re offline. Reconnect, then submit again.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        ...values,
        customerNote: values.customerNote ?? "",
        deliveryLat: delivery.lat,
        deliveryLng: delivery.lng,
        deliveryAccuracyM:
          delivery.accuracyM != null && Number.isFinite(delivery.accuracyM)
            ? Math.min(Math.max(delivery.accuracyM, 0), 50_000)
            : null,
        lines: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          unitPriceEtb: item.unitPriceEtb,
          quantity: item.quantity,
        })),
        subtotalEtb: subtotal,
      });
      const orderId = order.reference || order.id;
      rememberLocalOrder({
        reference: orderId,
        status: typeof order.status === "string" ? order.status : "NEW",
        customerName: order.customerName ?? values.customerName,
        subtotalEtb: order.subtotalEtb ?? subtotal,
        createdAt: order.createdAt ?? new Date().toISOString(),
        preferredPickup: order.preferredPickup ?? values.preferredPickup,
      });
      clearCart();
      sessionStorage.removeItem(DRAFT_KEY);
      toast("Order request sent", "success");
      router.push(`/order/confirmed/${orderId}`);
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Could not place order. Check your connection and try again.",
        "error",
      );
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
        {draftRestored ? (
          <p className="text-xs text-[var(--accent)]" role="status">
            We restored your draft details from this browser.
          </p>
        ) : null}

        <div>
          <label htmlFor="customerName" className="mb-1.5 block text-sm text-[var(--ink)]">
            Full name <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="customerName"
            className={cn(fieldClass, showError("customerName") && "border-red-300")}
            autoComplete="name"
            aria-invalid={showError("customerName")}
            aria-describedby={showError("customerName") ? "customerName-error" : undefined}
            {...register("customerName")}
          />
          {showError("customerName") ? (
            <p id="customerName-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.customerName?.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="customerPhone" className="mb-1.5 block text-sm text-[var(--ink)]">
            Phone <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="customerPhone"
            className={cn(fieldClass, showError("customerPhone") && "border-red-300")}
            autoComplete="tel"
            inputMode="tel"
            placeholder="09******** or +2519…"
            aria-invalid={showError("customerPhone")}
            aria-describedby={
              showError("customerPhone") ? "customerPhone-error customerPhone-hint" : "customerPhone-hint"
            }
            {...register("customerPhone")}
          />
          <p id="customerPhone-hint" className="mt-1 text-xs text-[var(--muted)]">
            Spaces and dashes are fine — we’ll normalize the number.
          </p>
          {showError("customerPhone") ? (
            <p id="customerPhone-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.customerPhone?.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="preferredPickup" className="mb-1.5 block text-sm text-[var(--ink)]">
            Preferred pickup <span className="text-[var(--accent)]">*</span>
          </label>
          <select
            id="preferredPickup"
            className={cn(fieldClass, showError("preferredPickup") && "border-red-300")}
            aria-invalid={showError("preferredPickup")}
            {...register("preferredPickup")}
          >
            {PICKUP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {showError("preferredPickup") ? (
            <p className="mt-1 text-sm text-red-700" role="alert">
              {errors.preferredPickup?.message}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-end justify-between gap-3">
            <label htmlFor="customerNote" className="block text-sm text-[var(--ink)]">
              Note <span className="text-[var(--muted)]">(optional)</span>
            </label>
            <span
              className={cn(
                "text-xs tabular-nums",
                noteLength > NOTE_MAX - 40 ? "text-[var(--ink)]" : "text-[var(--muted)]",
              )}
              aria-live="polite"
            >
              {noteLength}/{NOTE_MAX}
            </span>
          </div>
          <textarea
            id="customerNote"
            rows={4}
            maxLength={NOTE_MAX}
            className={cn(fieldClass, showError("customerNote") && "border-red-300")}
            placeholder="Gift wrap, timing, or other details"
            aria-invalid={showError("customerNote")}
            {...register("customerNote")}
          />
          {showError("customerNote") ? (
            <p className="mt-1 text-sm text-red-700" role="alert">
              {errors.customerNote?.message}
            </p>
          ) : null}
        </div>

        <DeliveryLocationField
          value={delivery}
          error={deliveryError}
          onChange={(coords) => {
            setDelivery(coords);
            if (coords) setDeliveryError(undefined);
          }}
        />

        {hasUnavailable ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            Remove unavailable items from your cart before submitting.
          </p>
        ) : null}

        <Button
          type="submit"
          className="min-h-11 w-full sm:w-auto"
          loading={submitting}
          disabled={hasUnavailable || !isValid || !delivery}
        >
          {submitting ? submitLabel : "Submit order request"}
        </Button>
        {!isValid && !submitting ? (
          <p className="text-xs text-[var(--muted)]">Fill the required fields to enable submit.</p>
        ) : null}
      </form>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary />
      </div>
    </div>
  );
}

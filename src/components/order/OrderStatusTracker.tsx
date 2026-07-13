"use client";

import { formatEtb } from "@/lib/money";
import { activeStepIndex, statusLabel, TRACK_STEPS } from "@/lib/orderStatus";
import type { PublicTrackedOrder } from "@/services/orders";
import { cn } from "@/utils/cn";

export function OrderStatusTracker({ order }: { order: PublicTrackedOrder }) {
  const cancelled = order.status === "CANCELLED";
  const current = activeStepIndex(order.status);

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--muted)]">Order reference</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {order.reference}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Placed {new Date(order.createdAt).toLocaleString()} · {order.customerName} ·{" "}
              {order.customerPhoneMasked}
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "inline-flex rounded-md px-3 py-1 text-sm font-medium",
                cancelled
                  ? "bg-red-50 text-red-800"
                  : "bg-[var(--accent-soft)] text-[var(--accent)]",
              )}
            >
              {statusLabel(order.status)}
            </p>
            <p className="mt-2 text-sm text-[var(--ink)]">{formatEtb(order.subtotalEtb)}</p>
          </div>
        </div>
      </div>

      {cancelled ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="status"
        >
          This order was cancelled. If you have questions, contact Aman Shop from the Contact page.
        </div>
      ) : (
        <ol className="space-y-0">
          {TRACK_STEPS.map((step, index) => {
            const done = index <= current;
            const isCurrent = index === current;
            return (
              <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                {index < TRACK_STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px",
                      index < current ? "bg-[var(--accent)]" : "bg-[var(--border)]",
                    )}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                    done
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
                    isCurrent && "ring-2 ring-[var(--accent-soft)]",
                  )}
                  aria-hidden
                >
                  {done ? "✓" : index + 1}
                </span>
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      done ? "text-[var(--ink)]" : "text-[var(--muted)]",
                    )}
                  >
                    {step.title}
                    {isCurrent ? (
                      <span className="ml-2 text-xs font-normal text-[var(--accent)]">Current</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Items</h2>
        <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
          {order.lines.map((line, index) => (
            <li key={`${order.reference}-${index}`} className="flex justify-between gap-4 py-3">
              <span className="text-[var(--ink)]">
                {line.quantity ?? "?"}× {line.name ?? "Item"}
              </span>
              {typeof line.unitPriceEtb === "number" ? (
                <span className="shrink-0 text-[var(--muted)]">
                  {formatEtb(line.unitPriceEtb * (line.quantity ?? 1))}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-[var(--muted)]">Preferred pickup: {order.preferredPickup}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Pay in person — nothing is charged online.</p>
      </div>
    </div>
  );
}

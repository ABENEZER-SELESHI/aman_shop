"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  id,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface)]",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className="px-3 py-2 text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-40"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="w-12 border-x border-[var(--border)] bg-transparent py-2 text-center text-sm text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        aria-label="Quantity"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        className="px-3 py-2 text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-40"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

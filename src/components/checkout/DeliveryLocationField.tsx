"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export type DeliveryCoords = {
  lat: number;
  lng: number;
  accuracyM: number | null;
};

type Props = {
  value: DeliveryCoords | null;
  onChange: (value: DeliveryCoords | null) => void;
  error?: string;
};

export function DeliveryLocationField({ value, onChange, error }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "unsupported">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
    }
  }, []);

  function captureLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setMessage("This device does not support location.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawAccuracy = position.coords.accuracy;
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM:
            Number.isFinite(rawAccuracy) && rawAccuracy > 0
              ? Math.min(rawAccuracy, 50_000)
              : null,
        });
        setStatus("granted");
        setMessage("Delivery spot saved from your device location.");
      },
      (geoError) => {
        onChange(null);
        setStatus("denied");
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setMessage("Location permission was denied. Enable it in your browser settings, then try again.");
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setMessage("Location is unavailable right now. Move to an open area and try again.");
        } else {
          setMessage("Timed out while reading location. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">
          Delivery location <span className="text-[var(--accent)]">*</span>
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Allow device location so the seller can find where to deliver this order.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" loading={status === "loading"} onClick={captureLocation}>
          {value ? "Update my location" : "Use my current location"}
        </Button>
        {value ? (
          <p className="text-xs text-[var(--muted)] tabular-nums">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            {value.accuracyM != null ? ` · ±${Math.round(value.accuracyM)}m` : ""}
          </p>
        ) : null}
      </div>

      {message ? (
        <p className={`text-sm ${status === "granted" ? "text-[var(--accent)]" : "text-amber-800"}`} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {status === "unsupported" ? (
        <p className="text-sm text-red-700" role="alert">
          Location is not supported in this browser.
        </p>
      ) : null}
    </div>
  );
}

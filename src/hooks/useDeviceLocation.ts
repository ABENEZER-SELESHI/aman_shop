"use client";

import { useCallback, useEffect, useState } from "react";

export type DeviceLocation = {
  lat: number;
  lng: number;
  accuracyM: number | null;
};

type LocationState = {
  location: DeviceLocation | null;
  status: "idle" | "loading" | "granted" | "denied" | "unsupported";
  error: string | null;
  refresh: () => void;
};

/** Ask the browser for the current device position (seller or customer). */
export function useDeviceLocation(auto = false): LocationState {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [status, setStatus] = useState<LocationState["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("This device does not support location.");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawAccuracy = position.coords.accuracy;
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM:
            Number.isFinite(rawAccuracy) && rawAccuracy > 0
              ? Math.min(rawAccuracy, 50_000)
              : null,
        });
        setStatus("granted");
      },
      (geoError) => {
        setLocation(null);
        setStatus("denied");
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission denied. Enable it in browser settings to see your position on the map.");
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError("Location is unavailable right now.");
        } else {
          setError("Timed out while reading location.");
        }
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
    );
  }, []);

  useEffect(() => {
    if (auto) refresh();
  }, [auto, refresh]);

  return { location, status, error, refresh };
}

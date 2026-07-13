"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "order" | "seller" | "delivery";
};

const ADDIS_CENTER: [number, number] = [9.03, 38.74];
const ADDIS_ZOOM = 12;

function markerIcon(kind: MapPoint["kind"]) {
  const color = kind === "seller" ? "#1d4ed8" : kind === "delivery" ? "#b45309" : "#3f6f5b";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(ADDIS_CENTER, ADDIS_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.25));
  }, [map, points]);
  return null;
}

type Props = {
  points: MapPoint[];
  className?: string;
  heightClassName?: string;
  showLegend?: boolean;
};

export function DeliveryMap({
  points,
  className,
  heightClassName = "h-72",
  showLegend = true,
}: Props) {
  const [ready, setReady] = useState(false);
  const stablePoints = useMemo(() => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)), [points]);

  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className={`${heightClassName} grid place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)] ${className ?? ""}`}>
        Loading map…
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`${heightClassName} overflow-hidden rounded-md border border-[var(--border)]`}>
        <MapContainer
          center={ADDIS_CENTER}
          zoom={ADDIS_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={stablePoints} />
          {stablePoints.map((point) => (
            <Marker key={point.id} position={[point.lat, point.lng]} icon={markerIcon(point.kind)}>
              <Popup>{point.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {showLegend ? (
        <ul className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
          <li className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3f6f5b]" /> Order delivery
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1d4ed8]" /> Your location
          </li>
        </ul>
      ) : null}
    </div>
  );
}

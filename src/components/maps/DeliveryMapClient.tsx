"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const DeliveryMapInner = dynamic(
  () => import("./DeliveryMap").then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-72 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export function DeliveryMapClient(props: ComponentProps<typeof DeliveryMapInner>) {
  return <DeliveryMapInner {...props} />;
}

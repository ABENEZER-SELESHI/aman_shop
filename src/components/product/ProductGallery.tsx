"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/utils/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = resolveMediaUrl(images[active] ?? images[0] ?? "");

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)]">
        <Image
          src={current}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={current.includes("/uploads/")}
        />
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2">
          {images.map((src, index) => {
            const resolved = resolveMediaUrl(src);
            return (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "relative h-16 w-14 overflow-hidden border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
                    index === active ? "border-[var(--accent)]" : "border-[var(--border)]",
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={resolved}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized={resolved.includes("/uploads/")}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

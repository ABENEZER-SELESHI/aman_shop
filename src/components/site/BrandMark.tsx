import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/utils/cn";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "lg" | "hero";
  asLink?: boolean;
  /** Show wordmark next to the logo mark. */
  showWordmark?: boolean;
}

const sizeConfig = {
  sm: {
    text: "text-xl md:text-2xl",
    mark: "h-8 w-8 md:h-9 md:w-9",
    gap: "gap-2",
  },
  lg: {
    text: "text-3xl md:text-4xl",
    mark: "h-11 w-11 md:h-12 md:w-12",
    gap: "gap-2.5",
  },
  hero: {
    text: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
    mark: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28",
    gap: "gap-3 md:gap-4",
  },
} as const;

export function BrandMark({
  className,
  size = "sm",
  asLink = true,
  showWordmark = true,
}: BrandMarkProps) {
  const config = sizeConfig[size];
  const content = (
    <span className={cn("inline-flex items-center", config.gap, className)}>
      <Image
        src="/brand/logo.png"
        alt=""
        width={112}
        height={112}
        className={cn("shrink-0 rounded-md object-contain", config.mark)}
        priority={size === "hero" || size === "sm"}
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-[family-name:var(--font-display)] font-medium tracking-tight text-[var(--ink)]",
            config.text,
          )}
        >
          {siteConfig.brandName}
        </span>
      ) : (
        <span className="sr-only">{siteConfig.brandName}</span>
      )}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link
      href="/"
      className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      aria-label={siteConfig.brandName}
    >
      {content}
    </Link>
  );
}

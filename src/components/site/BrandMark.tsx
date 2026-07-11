import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/utils/cn";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "lg" | "hero";
  asLink?: boolean;
}

const sizeClasses = {
  sm: "text-xl md:text-2xl",
  lg: "text-3xl md:text-4xl",
  hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
};

export function BrandMark({ className, size = "sm", asLink = true }: BrandMarkProps) {
  const content = (
    <span className={cn("font-[family-name:var(--font-display)] font-medium tracking-tight text-[var(--ink)]", sizeClasses[size], className)}>
      {siteConfig.brandName}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href="/" className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
      {content}
    </Link>
  );
}

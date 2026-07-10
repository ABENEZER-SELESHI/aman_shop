import { siteConfig } from "./config";

/** Formats ETB amounts consistently, e.g. `1,850 ብር`. */
export function formatEtb(amount: number): string {
  const formatted = new Intl.NumberFormat("en-ET", {
    maximumFractionDigits: 0,
  }).format(amount);

  if (siteConfig.currency === "ETB") {
    return `${formatted} ብር`;
  }

  return `${siteConfig.currency} ${formatted}`;
}

import { siteConfig } from "@/lib/config";

const apiOrigin = (() => {
  try {
    return new URL(siteConfig.apiBaseUrl).origin;
  } catch {
    return "http://localhost:4000";
  }
})();

/** Resolve product image paths for Next/Image (local public or backend uploads). */
export function resolveMediaUrl(src: string): string {
  if (!src) return src;
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }
  if (src.startsWith("/uploads/")) {
    return `${apiOrigin}${src}`;
  }
  return src;
}

export { apiOrigin };

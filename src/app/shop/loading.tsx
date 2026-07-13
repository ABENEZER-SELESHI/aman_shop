import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-[var(--border)]/70" />
      <div className="h-10 w-48 animate-pulse rounded bg-[var(--border)]/70" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--border)]/70" />
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
      <p className="sr-only">Loading shop…</p>
    </div>
  );
}

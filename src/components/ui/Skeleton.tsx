import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--border)]/70", className)}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <li className="space-y-3" aria-hidden>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </li>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ul>
  );
}

export function CartLineSkeleton() {
  return (
    <div className="flex gap-4 py-5" aria-hidden>
      <Skeleton className="h-24 w-20 shrink-0 rounded-none" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

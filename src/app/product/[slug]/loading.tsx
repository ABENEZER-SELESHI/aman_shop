import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
      aria-busy="true"
      aria-label="Loading product"
    >
      <Skeleton className="mb-8 h-4 w-64 max-w-full" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full rounded-none" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-28" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3 border-t border-[var(--border)] pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      </div>
      <p className="sr-only">Opening piece…</p>
    </div>
  );
}

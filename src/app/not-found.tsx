import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        Page not found
      </h1>
      <p className="mt-3 text-[var(--muted)]">That page is not part of Aman Shop.</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline"
      >
        Back home
      </Link>
    </div>
  );
}

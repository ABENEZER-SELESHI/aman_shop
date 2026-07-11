const steps = [
  {
    title: "Choose your pieces",
    body: "Browse vases and baskets, set quantities, and add them to your cart.",
  },
  {
    title: "Send an order request",
    body: "Share your name, phone, and a preferred pickup window. No payment online.",
  },
  {
    title: "Confirm & pay in person",
    body: "Amanuel will contact you to confirm pickup — you pay when you collect.",
  },
];

export function HowOrderingWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        How ordering works
      </h2>
      <p className="mt-2 max-w-xl text-[var(--muted)]">
        Simple by design — made for in-person pickup in Addis Ababa.
      </p>
      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title}>
            <p className="text-sm text-[var(--highlight)]">0{index + 1}</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export function CopyReferenceButton({ reference }: { reference: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="mt-3 min-h-11 text-sm text-[var(--accent)] underline-offset-4 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(reference);
          setCopied(true);
          toast("Order reference copied", "success");
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          toast("Couldn’t copy — select the reference manually", "error");
        }
      }}
    >
      {copied ? "Copied" : "Copy reference"}
    </button>
  );
}

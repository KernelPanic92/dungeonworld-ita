"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-dw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dw"
    >
      <ArrowUp className="size-3.5" aria-hidden="true" />
      Torna su
    </button>
  );
}

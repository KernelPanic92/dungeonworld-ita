"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Back button that restores the browser history (keeping applied filters on
 * the materials list); falls back to a plain link when there is no history
 * to go back to (e.g. the page was opened directly).
 */
export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="inline-flex items-center gap-1.5 hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Tutti i materiali
    </button>
  );
}
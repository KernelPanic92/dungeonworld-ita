"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const BANNER_KEY = "dw-banner-guida-v1";

export function HomeBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(BANNER_KEY) === "1";
  });

  if (dismissed) return null;

  return (
    <div className="bg-dw text-on-dw px-4 py-2 text-center text-sm relative">
      <Link href="/materiali/guida-a-dungeon-world" className="hover:underline">
        🎉 <strong>Nuovo contenuto disponibile</strong>: leggi la Guida a Dungeon
        World, l&apos;approfondimento della community su mosse, combattimento e
        spirito del gioco.
      </Link>
      <button
        aria-label="Chiudi annuncio"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
        onClick={() => {
          window.localStorage.setItem(BANNER_KEY, "1");
          setDismissed(true);
        }}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

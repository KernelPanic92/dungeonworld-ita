import { KOFI_BUTTON_URL, KOFI_EMBED_URL } from "@/lib/kofi";

/** Official Ko-fi support button (footer, manual TOC). */
export function KoFiButton({ className }: { className?: string }) {
  return (
    <a href={KOFI_BUTTON_URL} target="_blank" rel="noreferrer" className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={36}
        style={{ border: 0, height: 36 }}
        src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
        alt="Buy Me a Coffee at ko-fi.com"
      />
    </a>
  );
}

/** Embedded Ko-fi panel (material detail page). */
export function KoFiEmbed() {
  return (
    <iframe
      src={KOFI_EMBED_URL}
      style={{ border: "none", width: "100%", padding: 4, background: "#f9f9f9" }}
      height={712}
      title="Supporta Dungeon World Italia su Ko-fi"
      loading="lazy"
    />
  );
}

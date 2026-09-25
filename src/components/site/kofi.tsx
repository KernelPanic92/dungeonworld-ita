import { KOFI_EMBED_URL } from "@/lib/kofi";

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

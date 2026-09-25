import { ADSENSE_CLIENT, ADSENSE_SLOT_TOC, consentScriptProps } from "@/lib/consent";
import { cn } from "cn";

/**
 * AdSense loader. Place it only on pages where ads may appear
 * (manual TOC, materials): the home page must not load it.
 * Automatic ads are managed from the AdSense dashboard.
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      {...consentScriptProps([5])}
    />
  );
}

interface AdSenseAdProps {
  /** Ad unit slot id; without one nothing is rendered. */
  slot?: string;
  className?: string;
}

/** A manual, responsive AdSense unit (e.g. at the top of the manual TOC). */
export function AdSenseAd({ slot = ADSENSE_SLOT_TOC, className }: AdSenseAdProps) {
  if (!ADSENSE_CLIENT || !slot) return null;
  return (
    <>
      <ins
        className={cn("adsbygoogle block", className)}
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        {...consentScriptProps([5])}
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </>
  );
}

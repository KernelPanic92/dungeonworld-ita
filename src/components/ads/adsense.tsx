import type { CSSProperties } from "react";
import {
  ADSENSE_CLIENT,
  ADSENSE_SLOT_TOC,
  consentScriptProps,
} from "@/lib/consent";
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

/** Ad formats supported by AdSenseAd. */
export type AdFormat = "auto" | "horizontal" | "in-article";

interface FormatAttrs {
  "data-ad-format": string;
  "data-ad-layout"?: string;
  style: CSSProperties;
  responsive: boolean;
}

const formatAttrs: Record<AdFormat, FormatAttrs> = {
  auto: {
    "data-ad-format": "auto",
    style: { display: "block" },
    responsive: true,
  },
  horizontal: {
    "data-ad-format": "horizontal",
    style: { display: "block" },
    responsive: false,
  },
  "in-article": {
    "data-ad-format": "fluid",
    "data-ad-layout": "in-article",
    style: { display: "block", textAlign: "center" },
    responsive: false,
  },
};

interface AdSenseAdProps {
  /** Ad unit slot id; without one nothing is rendered. */
  slot?: string;
  className?: string;
  /** Reserved space (e.g. min-height) of the accessible ad container. */
  containerClassName?: string;
  format?: AdFormat;
}

/**
 * A manual, responsive AdSense unit (top of the manual TOC, between the
 * manual sections, footer banner). The container is an "advertisement"
 * landmark so assistive tech can identify or skip it; nothing is rendered
 * when AdSense is not configured.
 */
export function AdSenseAd({
  slot = ADSENSE_SLOT_TOC,
  className,
  containerClassName,
  format = "auto",
}: AdSenseAdProps) {
  if (!ADSENSE_CLIENT || !slot) return null;
  const { "data-ad-format": adFormat, "data-ad-layout": adLayout, style, responsive } =
    formatAttrs[format];
  return (
    <div role="complementary" aria-label="Pubblicità" className={containerClassName}>
      <ins
        className={cn("adsbygoogle block", className)}
        style={style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={adFormat}
        {...(adLayout ? { "data-ad-layout": adLayout } : {})}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
      <script
        {...consentScriptProps([5])}
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </div>
  );
}

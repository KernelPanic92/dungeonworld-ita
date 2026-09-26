import type { CSSProperties } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT_TOC } from "@/lib/tracking";
import { cn } from "cn";

/**
 * AdSense loader. Doubles as the delivery vehicle for Google's CMP message
 * (Privacy & messaging), so it lives in the root layout and loads on every
 * page: ad serving itself respects the user's consent choice (without
 * consent, Google serves at most cookieless "Limited ads").
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
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
 * when AdSense is not configured. Ad serving respects the consent choice
 * collected by Google's CMP (see AdSenseScript).
 */
export function AdSenseAd({
  slot = ADSENSE_SLOT_TOC,
  className,
  containerClassName,
  format = "auto",
}: AdSenseAdProps) {
  if (!ADSENSE_CLIENT || !slot) return null;
  const {
    "data-ad-format": adFormat,
    "data-ad-layout": adLayout,
    style,
    responsive,
  } = formatAttrs[format];
  return (
    <div
      role="complementary"
      aria-label="Pubblicità"
      className={containerClassName}
    >
      <ins
        className={cn("adsbygoogle block", className)}
        style={style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={adFormat}
        {...(adLayout ? { "data-ad-layout": adLayout } : {})}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
    </div>
  );
}
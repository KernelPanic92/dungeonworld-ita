import Script from "next/script";
import { iubendaCsConfiguration, isIubendaConfigured } from "@/lib/tracking";

/**
 * Iubenda Cookie Solution: consent banner + per-category script gating.
 * Renders nothing when iubenda is not configured, so the site works without
 * a consent solution. Scripts opt into gating via `consentScriptProps`
 * (AdSense) or the client-side `useAnalyticsConsent` hook (Google Analytics).
 */
export function IubendaCookieSolution() {
  if (!isIubendaConfigured()) {
    return null;
  }

  const config = JSON.stringify(iubendaCsConfiguration());

  return (
    <>
      <Script
        id="iubenda-cs-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `var _iub = _iub || []; _iub.csConfiguration = ${config};`,
        }}
      />
      <Script
        id="iubenda-cs"
        src="https://cdn.iubenda.com/cs/iubenda_cs.js"
        strategy="afterInteractive"
      />
    </>
  );
}
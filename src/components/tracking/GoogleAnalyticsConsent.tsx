"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID, isGaConfigured } from "@/lib/tracking";
import { useAnalyticsConsent } from "@/components/tracking/useAnalyticsConsent";

/**
 * Loads Google Analytics (gtag.js) only after the visitor consents to
 * measurement (iubenda purpose 4). When iubenda is not configured the
 * consent defaults to true, so GA loads immediately.
 */
export function GoogleAnalyticsConsent() {
  const consented = useAnalyticsConsent();

  if (!isGaConfigured() || !consented) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
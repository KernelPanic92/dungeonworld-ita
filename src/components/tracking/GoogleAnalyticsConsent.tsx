"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID, isGaConfigured } from "@/lib/tracking";
import { useGoogleConsent } from "@/components/tracking/useGoogleConsent";

/**
 * Loads Google Analytics (gtag.js) only after the user's consent decision
 * (basic consent mode: analytics_storage granted, or EU regulations not
 * applicable). When AdSense is not configured — no CMP at all, e.g. local
 * development — consent defaults to true and GA loads immediately.
 */
export function GoogleAnalyticsConsent() {
  const { analytics } = useGoogleConsent();

  if (!isGaConfigured() || !analytics) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
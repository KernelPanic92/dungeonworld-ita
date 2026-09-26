"use client";

import { useEffect, useState } from "react";
import { isAdSenseConfigured } from "@/lib/tracking";

type ConsentStatus = "granted" | "denied" | "not_applicable" | "not_configured" | "unknown";

interface GoogleFcConsentModeValues {
  adStoragePurposeConsentStatus?: ConsentStatus;
  adUserDataPurposeConsentStatus?: ConsentStatus;
  adPersonalizationPurposeConsentStatus?: ConsentStatus;
  analyticsStoragePurposeConsentStatus?: ConsentStatus;
}

declare global {
  interface Window {
    googlefc?: {
      callbackQueue?: object[];
      getGoogleConsentModeValues?: () => GoogleFcConsentModeValues;
      showRevocationMessage?: () => void;
    };
  }
}

/** Purposes that allow a tag to load: granted, not applicable (extra-EEA) or not configured. */
function isAllowed(status?: ConsentStatus) {
  return (
    status === "granted" ||
    status === "not_applicable" ||
    status === "not_configured"
  );
}

/**
 * Consent state exposed by Google's CMP (Privacy & messaging) through the
 * `googlefc` API, in basic consent mode: tags load only after the user's
 * choice — or when EU regulations don't apply. The CMP itself rides the
 * AdSense tag, which must therefore be present on the page. Without AdSense
 * configured (local development, no CMP at all) consent defaults to granted.
 */
export function useGoogleConsent(): {
  ready: boolean;
  analytics: boolean;
  ads: boolean;
} {
  const [consent, setConsent] = useState(() => ({
    ready: false,
    // no CMP → no consent to gather (local dev, AdSense not configured)
    analytics: !isAdSenseConfigured(),
    ads: !isAdSenseConfigured(),
  }));

  useEffect(() => {
    if (!isAdSenseConfigured()) return;

    window.googlefc = window.googlefc ?? {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? [];
    window.googlefc.callbackQueue.push({
      CONSENT_MODE_DATA_READY: () => {
        const values = window.googlefc?.getGoogleConsentModeValues?.() ?? {};
        setConsent({
          ready: true,
          analytics: isAllowed(values.analyticsStoragePurposeConsentStatus),
          ads:
            isAllowed(values.adStoragePurposeConsentStatus) &&
            isAllowed(values.adUserDataPurposeConsentStatus),
        });
      },
    });
  }, []);

  return consent;
}

/** Reopens Google's consent panel so the user can change or withdraw consent. */
export function openPrivacyPreferences() {
  if (typeof window.googlefc?.showRevocationMessage === "function") {
    window.googlefc.showRevocationMessage();
    return;
  }
  // no CMP on the page: the cookie policy explains the alternatives
  window.location.href = "/cookie-policy";
}

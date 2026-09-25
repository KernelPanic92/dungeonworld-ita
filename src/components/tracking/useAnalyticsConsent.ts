"use client";

import { useEffect, useState } from "react";
import { isAnalyticsPurposeConsented } from "@/lib/iubenda-consent";
import { isIubendaConfigured } from "@/lib/tracking";

/**
 * Tracks whether the visitor has consented to analytics (iubenda purpose 4).
 * Defaults to `true` when iubenda is not configured (dev/preview, or the
 * consent banner is absent) so analytics run freely in those environments.
 */
export function useAnalyticsConsent() {
  const [consented, setConsented] = useState(() => !isIubendaConfigured());

  useEffect(() => {
    if (!isIubendaConfigured()) {
      return;
    }

    function syncConsent() {
      setConsented(isAnalyticsPurposeConsented());
    }

    syncConsent();

    const poll = window.setInterval(syncConsent, 400);
    const stopPolling = window.setTimeout(
      () => window.clearInterval(poll),
      10_000,
    );

    document.addEventListener("iubenda_cs_consent_given", syncConsent);
    document.addEventListener("iubenda_cs_consent_updated", syncConsent);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stopPolling);
      document.removeEventListener("iubenda_cs_consent_given", syncConsent);
      document.removeEventListener("iubenda_cs_consent_updated", syncConsent);
    };
  }, []);

  return consented;
}
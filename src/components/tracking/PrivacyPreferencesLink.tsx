"use client";

import { openPrivacyPreferences } from "@/components/tracking/useGoogleConsent";

/**
 * Reopens Google's CMP consent panel so the user can change or withdraw
 * consent at any time (GDPR withdrawal must be as easy as granting).
 */
export function PrivacyPreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openPrivacyPreferences} className={className}>
      Preferenze privacy
    </button>
  );
}
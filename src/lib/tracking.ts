/**
 * Third-party integration ids from env (all optional; components degrade when
 * unset) and iubenda consent configuration. This is the single source of truth
 * for what is configured and how iubenda gates each script.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const ADSENSE_SLOT_TOC = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOC ?? "";
export const ADSENSE_SLOT_BANNER =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "";

export const IUBENDA_SITE_ID = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID ?? "";
export const IUBENDA_COOKIE_POLICY_ID =
  process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID ?? "";
export const IUBENDA_PRIVACY_POLICY_ID =
  process.env.NEXT_PUBLIC_IUBENDA_PRIVACY_POLICY_ID ?? "";

/**
 * Iubenda purposes: 4 = measurement (analytics), 5 = advertising.
 * Overridable via env; defaults to the standard measurement purpose.
 */
const ANALYTICS_PURPOSE_ENV =
  process.env.NEXT_PUBLIC_IUBENDA_ANALYTICS_PURPOSE_ID ?? "4";
export const IUBENDA_ANALYTICS_PURPOSE = ANALYTICS_PURPOSE_ENV;

export type ConsentPurpose = 4 | 5;

export function isIubendaConfigured() {
  return Boolean(IUBENDA_SITE_ID && IUBENDA_COOKIE_POLICY_ID);
}

export function isGaConfigured() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function isAdSenseConfigured() {
  return Boolean(ADSENSE_CLIENT);
}

export function isTrackingConfigured() {
  return isIubendaConfigured() || isGaConfigured() || isAdSenseConfigured();
}

/**
 * Options passed to iubenda's `csConfiguration`. The compliance flags keep the
 * banner honest: per-purpose consent, explicit Google vendors, no consent on
 * continued browsing, no whitelabel ([iubenda docs](https://www.iubenda.com)).
 */
export function iubendaCsConfiguration() {
  return {
    lang: "it",
    siteId: Number(IUBENDA_SITE_ID),
    cookiePolicyId: IUBENDA_COOKIE_POLICY_ID,
    header: { logo: { position: "left", show: false } },
    banner: {
      acceptButtonDisplay: true,
      acceptButtonColor: "#002B536D",
      acceptButtonCaption: "Accetta",
      rejectButtonDisplay: true,
      rejectButtonCaption: "Rifiuta",
      customizeButtonDisplay: true,
      customizeButtonCaption: "Personalizza",
      closeButtonDisplay: false,
      position: "float-bottom-left",
      background: "#1B1B1B",
      textColor: "#FFFFFF",
    },
    perPurposeConsent: true,
    googleAdditionalConsentMode: true,
    consentOnContinuedBrowsing: false,
    whitelabel: false,
    enableTcf: false,
  };
}

interface ConsentScriptProps {
  type?: "text/plain";
  className?: string;
  "data-iub-purposes"?: string;
}

/**
 * Attributes that keep a script inert until iubenda records consent
 * (safe mode / manual tagging). No-op when iubenda is not configured,
 * so scripts run freely in environments without a consent solution.
 */
export function consentScriptProps(
  purposes: ConsentPurpose[],
): ConsentScriptProps {
  return {
    type: "text/plain",
    className: "_iub_cs_activate",
    "data-iub-purposes": purposes.join(" "),
  };
}
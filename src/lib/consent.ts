/** Third-party integration ids from env; components degrade when unset. */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
export const ADSENSE_SLOT_TOC = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOC;
export const ADSENSE_SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER;

export const IUBENDA_SITE_ID = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;

export const IUBENDA_COOKIE_POLICY_ID =
  process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID;

/** Iubenda is fully configured only with both ids. */
export const consentEnabled = Boolean(
  IUBENDA_SITE_ID && IUBENDA_COOKIE_POLICY_ID,
);

/** Iubenda purposes: 4 = measurement (analytics), 5 = advertising. */
export type ConsentPurpose = 4 | 5;

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
  if (!consentEnabled) return {};
  return {
    type: "text/plain",
    className: "_iub_cs_activate",
    "data-iub-purposes": purposes.join(" "),
  };
}

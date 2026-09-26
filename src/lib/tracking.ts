/** Third-party integration ids from env (all optional; components degrade when unset). */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export function isGaConfigured() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function isAdSenseConfigured() {
  return Boolean(ADSENSE_CLIENT);
}

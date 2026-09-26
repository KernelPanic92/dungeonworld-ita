/**
 * Site-level constants and helpers. The canonical base URL is resolved at
 * runtime from the hosting environment (Vercel) instead of being hardcoded:
 * `NEXT_PUBLIC_SITE_BASE_URL` wins when set (override), otherwise the Vercel
 * production/deployment URL, otherwise localhost for local development.
 */
export function getSiteBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_BASE_URL;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  const host = explicit ?? vercelProd ?? vercelUrl ?? "localhost:3000";
  return `https://${host.replace(/^https?:\/\//, "")}`;
}

/** Resolves a site path (or already-absolute URL) to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = getSiteBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
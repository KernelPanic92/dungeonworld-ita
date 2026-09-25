import {
  IUBENDA_COOKIE_POLICY_ID,
  IUBENDA_SITE_ID,
  consentEnabled,
} from "@/lib/consent";

/**
 * Iubenda Cookie Solution (consent banner + per-category script gating).
 * Scripts opt into gating via `consentScriptProps`.
 */
export function IubendaCookieSolution() {
  if (!consentEnabled) return null;
  const config = {
    siteId: Number(IUBENDA_SITE_ID),
    cookiePolicyId: IUBENDA_COOKIE_POLICY_ID,
    lang: "it",
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
    // enable manual tagging categories: 4 measurement, 5 advertising
    purposes: { 1: true, 4: true, 5: true },
    googleVendors: { 1: true }, // Google AdSense
  };
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window._iub = window._iub || [];\nwindow._iub.csConfiguration = ${JSON.stringify(config)};`,
        }}
      />
      <script async src="https://cdn.iubenda.com/cs/iubenda_cs.js" />
    </>
  );
}

interface IubendaPolicyLinkProps {
  kind: "privacy" | "cookie";
  className?: string;
}

/**
 * Link to the iubenda-generated policy. With the Cookie Solution loaded,
 * the `iubenda-embed` class opens the policy in a modal.
 */
export function IubendaPolicyLink({ kind, className }: IubendaPolicyLinkProps) {
  if (!consentEnabled) return null;
  const base = `https://www.iubenda.com/privacy-policy/${IUBENDA_SITE_ID}`;
  const href =
    kind === "privacy"
      ? base
      : `${base}/cookie-policy?an=no&s_ck=false&newmarkup=yes`;
  return (
    <a
      href={href}
      className={`iubenda-embed ${className ?? ""}`}
      title={kind === "privacy" ? "Privacy Policy" : "Cookie Policy"}
    >
      {kind === "privacy" ? "Privacy Policy" : "Cookie Policy"}
    </a>
  );
}

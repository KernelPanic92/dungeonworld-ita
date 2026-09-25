import {
  IUBENDA_COOKIE_POLICY_ID,
  IUBENDA_PRIVACY_POLICY_ID,
} from "@/lib/tracking";

interface IubendaPolicyLinkProps {
  kind: "privacy" | "cookie";
  className?: string;
}

/**
 * Link to the iubenda-generated policy. With the Cookie Solution loaded,
 * the `iubenda-embed` class opens the policy in a modal.
 */
export function IubendaPolicyLink({ kind, className }: IubendaPolicyLinkProps) {
  const id = kind === "privacy" ? IUBENDA_PRIVACY_POLICY_ID : IUBENDA_COOKIE_POLICY_ID;
  if (!id) return null;

  const href = `https://www.iubenda.com/privacy-policy/${id}`;
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
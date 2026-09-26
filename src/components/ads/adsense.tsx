/**
 * AdSense loader. Doubles as the delivery vehicle for Google's CMP message
 * (Privacy & messaging), so it lives in the root layout and loads on every
 * page. Ad placement is handled by Auto ads (configured in the AdSense
 * dashboard); ad serving respects the user's consent choice — without
 * consent, Google serves at most cookieless "Limited ads".
 */
export function AdSenseScript() {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
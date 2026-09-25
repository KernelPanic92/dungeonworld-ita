import { GA_MEASUREMENT_ID, consentScriptProps } from "@/lib/consent";

/**
 * Google Analytics (gtag.js). When iubenda is configured the scripts are
 * inert until measurement consent is given (purpose 4, safe mode tagging).
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        {...consentScriptProps([4])}
      />
      <script
        {...consentScriptProps([4])}
        dangerouslySetInnerHTML={{
          __html: [
            "window.dataLayer = window.dataLayer || [];",
            "function gtag(){dataLayer.push(arguments);}",
            "gtag('js', new Date());",
            `gtag('config', '${GA_MEASUREMENT_ID}');`,
          ].join("\n"),
        }}
      />
    </>
  );
}

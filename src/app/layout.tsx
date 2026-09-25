import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, draftMode } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import {
  IubendaCookieSolution,
} from "@/components/site/iubenda";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dungeon World Italia",
    template: "%s | Dungeon World Italia",
  },
  description:
    "Il manuale e i materiali di Dungeon World in italiano: classi, regole, schede e risorse per giocare.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const dm = await draftMode();
  const isPreviewing = dm.isEnabled;
  const branch = (await cookies()).get("ks-branch")?.value;

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <IubendaCookieSolution />
        {isPreviewing ? (
          <div className="flex items-center justify-center gap-3 bg-dw px-4 py-1.5 text-sm text-on-dw">
            <span>
              Modalità anteprima{branch ? ` — branch ${branch}` : ""}
            </span>
            <form method="POST" action="/preview/end">
              <button
                type="submit"
                className="rounded bg-on-dw/20 px-2 py-0.5 font-medium hover:bg-on-dw/30"
              >
                Termina anteprima
              </button>
            </form>
          </div>
        ) : null}
        <RootProvider theme={{ enabled: false }} search={{ enabled: false }}>
          <ThemeProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}

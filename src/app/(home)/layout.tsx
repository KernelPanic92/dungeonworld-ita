import type { Metadata } from "next";
import { HomeBanner } from "@/components/site/home-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Dungeon World Italia — Manuale e materiali in italiano",
  description:
    "Scopri la risorsa definitiva, libera e gratuita per Dungeon World in italiano: manuale, schede e opere homebrew della community. Esplora classi, mostri ambientazioni e avventure inedite per arricchire le tue sessioni GDR!",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <HomeBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

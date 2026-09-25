import { notFound } from "next/navigation";
import {
  isValidManualVersion,
} from "@/lib/keystatic";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export async function generateStaticParams() {
  const { getManualVersions } = await import("@/lib/keystatic");
  const versions = await getManualVersions();
  return versions.map((v) => ({ "manual-version": v.slug }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ "manual-version": string }>;
}

export default async function ManualVersionLayout({ children, params }: Props) {
  const { "manual-version": version } = await params;

  if (!(await isValidManualVersion(version))) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

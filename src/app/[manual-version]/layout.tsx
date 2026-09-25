import { notFound } from "next/navigation";
import {
  getManualVersions,
  isValidManualVersion,
} from "@/lib/keystatic";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { VersionSwitcher } from "@/components/site/version-switcher";

export async function generateStaticParams() {
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

  const versions = await getManualVersions();

  return (
    <>
      <SiteHeader />
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex h-11 max-w-[90rem] items-center justify-between px-4 sm:px-8">
          <p className="text-sm text-muted-foreground">
            Versione del manuale
          </p>
          <VersionSwitcher current={version} versions={versions} />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

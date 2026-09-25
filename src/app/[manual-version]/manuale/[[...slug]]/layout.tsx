import { notFound } from "next/navigation";
import { isValidManualVersion } from "@/lib/keystatic";
import { getManualPageTree } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Logo } from "@/components/site/logo";

interface Props {
  children: React.ReactNode;
  params: Promise<{ "manual-version": string }>;
}

export default async function ManualLayout({ children, params }: Props) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const tree = await getManualPageTree(version);

  return (
    <DocsLayout
      tree={tree}
      githubUrl="https://github.com/KernelPanic92/dungeonworld-ita"
      nav={{ enabled: true, transparentMode: "none", title: <Logo />}}
      sidebar={{ enabled: true, collapsible: true }}
      themeSwitch={{ enabled: true }}
      searchToggle={{ enabled: true }}
      tabMode="top"
    >
      {children}
    </DocsLayout>
  );
}
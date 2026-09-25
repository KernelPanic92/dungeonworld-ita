import { notFound } from "next/navigation";
import { isValidManualVersion } from "@/lib/keystatic";
import { getManualSource } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { GithubIcon } from "@/components/site/github-icon";

interface Props {
  children: React.ReactNode;
  params: Promise<{ "manual-version": string }>;
}

export default async function ManualLayout({ children, params }: Props) {
  const { "manual-version": version } = await params;
  if (!(await isValidManualVersion(version))) notFound();

  const source = await getManualSource(version);
  const loader = await source.get();
  const tree = await loader.getPageTree();

  return (
    <DocsLayout
      tree={tree}
      githubUrl="https://github.com/KernelPanic92/dungeonworld-ita"
      nav={{ enabled: false }}
      sidebar={{ enabled: true, collapsible: true }}
      themeSwitch={{ enabled: false }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
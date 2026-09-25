import { getManualPageTree } from "@/lib/source";
import { getManualVersions, resolveManualVersion } from "@/lib/keystatic";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { ManualSearchProvider } from "@/components/manual-search-provider";
import { Logo } from "@/components/site/logo";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}

export default async function ManualLayout({ children, params }: Props) {
  const { slug } = await params;
  // one root folder per version: fumadocs renders them as version tabs
  const tree = await getManualPageTree();
  const [version, versions] = await Promise.all([
    resolveManualVersion(slug),
    getManualVersions(),
  ]);

  return (
    <ManualSearchProvider version={version} versions={versions}>
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
    </ManualSearchProvider>
  );
}
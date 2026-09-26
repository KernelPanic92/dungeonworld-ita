import { getManualPageTree } from "@/lib/source";
import ruleSetRepository from "@/lib/content";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { ManualSearchProvider } from "@/components/manual-search-provider";
import { AdSenseScript } from "@/components/ads/adsense";
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
    ruleSetRepository.resolveVersion(slug),
    ruleSetRepository.getVersions(),
  ]);

  return (
    <ManualSearchProvider version={version} versions={versions}>
      <AdSenseScript />
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

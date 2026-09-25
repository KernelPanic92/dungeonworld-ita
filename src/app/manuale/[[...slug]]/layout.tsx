import { getManualPageTree } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Logo } from "@/components/site/logo";

interface Props {
  children: React.ReactNode;
}

export default async function ManualLayout({ children }: Props) {
  // one root folder per version: fumadocs renders them as version tabs
  const tree = await getManualPageTree();

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

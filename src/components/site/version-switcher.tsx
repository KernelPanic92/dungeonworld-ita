"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export interface VersionOption {
  slug: string;
  name: string;
  isDefault: boolean;
}

/**
 * Switch between manual versions keeping the current sub-path.
 * The default version is served without the version segment (rewrites),
 * so switching to it strips the prefix entirely.
 */
export function VersionSwitcher({
  current,
  versions,
}: {
  current: string;
  versions: VersionOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (slug: string | null) => {
    if (!slug || slug === current) return;
    const target = versions.find((v) => v.slug === slug);
    if (!target) return;

    // pathname may be versionless (default version served via rewrite)
    const segments = pathname.split("/").filter(Boolean);
    const isVersionless = !segments[0] || !versions.some((v) => v.slug === segments[0]);
    const rest = isVersionless ? segments : segments.slice(1);

    const next = target.isDefault
      ? `/${rest.join("/")}`
      : `/${target.slug}/${rest.join("/")}`;
    router.push(next || "/");
  };

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-auto gap-2" aria-label="Versione del manuale">
        <span>{versions.find((v) => v.slug === current)?.name ?? current}</span>
      </SelectTrigger>
      <SelectContent>
        {versions.map((v) => (
          <SelectItem key={v.slug} value={v.slug}>
            {v.name}
            {v.isDefault ? " (attuale)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

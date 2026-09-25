import Link from "next/link";
import { getSiteSettings } from "@/lib/keystatic";
import { GithubIcon } from "./github-icon";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground antialiased">
      <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-4 p-6 sm:flex-row xl:p-8">
        <p className="text-sm text-center">
          Dungeon World Italia &copy;{" "}
          <Link
            className="text-dw hover:underline"
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.it"
            target="_blank"
          >
            CC BY-SA 4.0
          </Link>
        </p>
        {settings?.githubUrl ? (
          <Link
            href={settings.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-lg hover:text-foreground transition-colors"
          >
            <GithubIcon className="size-4" />
          </Link>
        ) : null}
      </div>
    </footer>
  );
}

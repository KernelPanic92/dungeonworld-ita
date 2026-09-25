import Link from "next/link";
import { Coffee } from "lucide-react";
import { getSiteSettings } from "@/lib/keystatic";
import { KOFI_URL } from "@/lib/consent";
import { IubendaPolicyLink } from "@/components/site/iubenda";
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
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          {KOFI_URL ? (
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Coffee className="size-4" />
              Supportaci su Ko-fi
            </a>
          ) : null}
          <IubendaPolicyLink
            kind="privacy"
            className="transition-colors hover:text-foreground"
          />
          <IubendaPolicyLink
            kind="cookie"
            className="transition-colors hover:text-foreground"
          />
        </nav>
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

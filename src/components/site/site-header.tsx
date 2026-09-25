import Link from "next/link";
import { getSiteSettings } from "@/lib/keystatic";
import { GithubIcon } from "./github-icon";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/square-logo.svg" alt="" className="size-8" />
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <Link href="/manuale" className="px-3 py-2 rounded-md hover:text-dw transition-colors">
            Manuale
          </Link>
          <Link href="/materiali" className="px-3 py-2 rounded-md hover:text-dw transition-colors">
            Materiali
          </Link>
          <ThemeToggle />
          {settings?.githubUrl ? (
            <Link
              href={settings.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-md hover:text-dw transition-colors"
            >
              <GithubIcon className="size-5" />
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

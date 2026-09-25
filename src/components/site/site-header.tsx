import Link from "next/link";
import { getSiteSettings } from "@/lib/keystatic";
import { GithubIcon } from "./github-icon";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav, type NavLink } from "./mobile-nav";

export async function SiteHeader() {
  const settings = await getSiteSettings();

  const links: NavLink[] = [
    { href: "/manuale", label: "Manuale" },
    { href: "/materiali", label: "Materiali" },
    { href: "/progetto", label: "Progetto" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between px-4 sm:px-8">
        {/* Brand: DW mark on small screens, full text on md+ (mutually exclusive) */}
        <Link href="/" className="flex items-center gap-3" aria-label="Dungeon World Italia">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/square-logo.svg" alt="" className="size-8 md:hidden" />
          <span className="hidden md:inline">
            <Logo />
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:gap-2 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md hover:text-dw transition-colors"
            >
              {link.label}
            </Link>
          ))}
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

        <MobileNav links={links} githubUrl={settings?.githubUrl ?? null} />
      </div>
    </header>
  );
}
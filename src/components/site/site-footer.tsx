import Link from "next/link";
import { Heart } from "lucide-react";
import {
  getLicenses,
  getManualVersions,
  getSiteSettings,
  type ManualVersion,
} from "@/lib/keystatic";
import { creativeWorkStatusLabel } from "@/lib/creative-work-status";
import { KOFI_PAGE_URL } from "@/lib/kofi";
import { IubendaPolicyLink } from "@/components/site/iubenda";
import { BackToTop } from "./back-to-top";
import { GithubIcon } from "./github-icon";
import { Logo } from "./logo";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/manuale", label: "Manuale" },
  { href: "/materiali", label: "Materiali" },
  { href: "/progetto", label: "Progetto" },
];

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-sm">
        {children}
      </ul>
    </nav>
  );
}

function defaultVersionOf(versions: ManualVersion[]): ManualVersion | null {
  return versions.find((v) => v.isDefault) ?? versions[0] ?? null;
}

export async function SiteFooter() {
  const [settings, versions, licenses] = await Promise.all([
    getSiteSettings(),
    getManualVersions(),
    getLicenses(),
  ]);
  const githubUrl = settings?.githubUrl ?? null;
  const defaultVersion = defaultVersionOf(versions);
  const license = settings?.licenseSlug
    ? licenses.find((l) => l.slug === settings.licenseSlug) ?? null
    : null;

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground antialiased">
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-8 xl:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">
          <div>
            <Logo />
            {settings?.description ? (
              <p className="mt-3 max-w-xs text-sm leading-relaxed">
                {settings.description}
              </p>
            ) : null}
          </div>

          <FooterColumn title="Esplora">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-dw"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Progetto">
            {githubUrl ? (
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-dw"
                >
                  <GithubIcon className="size-4" aria-hidden="true" />
                  GitHub
                </a>
              </li>
            ) : null}
            {githubUrl ? (
              <li>
                <a
                  href={`${githubUrl}/issues`}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-dw"
                >
                  Segnala un errore
                </a>
              </li>
            ) : null}
            {defaultVersion ? (
              <li>
                <Link
                  href={defaultVersion.url ?? "/manuale"}
                  className="transition-colors hover:text-dw"
                >
                  Edizione {defaultVersion.slug} ·{" "}
                  {creativeWorkStatusLabel(defaultVersion.creativeWorkStatus)}
                </Link>
              </li>
            ) : null}
          </FooterColumn>

          <FooterColumn title="Supporto">
            <li>
              <a
                href={KOFI_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-dw"
              >
                <Heart className="size-4 fill-dw text-dw" aria-hidden="true" />
                Supportaci su Ko-fi
              </a>
            </li>
            <li>
              <IubendaPolicyLink
                kind="privacy"
                className="transition-colors hover:text-dw"
              />
            </li>
            <li>
              <IubendaPolicyLink
                kind="cookie"
                className="transition-colors hover:text-dw"
              />
            </li>
          </FooterColumn>
        </div>

        <div className="mt-10 border-t pt-6 xl:mt-12">
          <p className="max-w-3xl text-xs leading-relaxed">
            Basato su{" "}
            {settings?.originalGameUrl ? (
              <a
                href={settings.originalGameUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-dw"
              >
                Dungeon World
              </a>
            ) : (
              "Dungeon World"
            )}{" "}
            di Sage LaTorra e Adam Koebel. Progetto amatoriale non ufficiale,
            non affiliato agli autori originali di Dungeon World.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p>
              © {new Date().getFullYear()} Dungeon World Italia
              {license ? (
                <>
                  {" · "}
                  {license.url ? (
                    <a
                      href={license.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-dw hover:underline"
                    >
                      {license.label}
                    </a>
                  ) : (
                    license.label
                  )}
                </>
              ) : null}
            </p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}

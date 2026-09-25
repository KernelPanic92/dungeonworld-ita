"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GithubIcon } from "./github-icon";
import { ThemeToggle } from "./theme-toggle";

export interface NavLink {
  href: string;
  label: string;
}

/** Mobile menu: replaces the desktop nav on small screens. */
export function MobileNav({
  links,
  githubUrl,
}: {
  links: NavLink[];
  githubUrl: string | null;
}) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:text-dw transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2 border-t px-4 pt-4">
            <ThemeToggle />
            {githubUrl ? (
              <Link
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-md hover:text-dw transition-colors"
              >
                <GithubIcon className="size-5" />
              </Link>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
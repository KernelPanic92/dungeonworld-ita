"use client";

import { useState } from "react";
import { Download, HeartHandshake } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "cn";

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL;

interface DownloadLinkProps {
  href: string;
  name: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A download link for /files/... assets. The route serves them as
 * attachments, so the browser downloads without navigating; on click we
 * also open a support/donation notice.
 */
export function DownloadLink({ href, name, className, children }: DownloadLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => setOpen(nextOpen)}
    >
      <a
        href={href}
        download={name}
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "outline" }), "justify-start gap-2", className)}
      >
        {children}
        <Download className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </a>
      <DialogContent>
        <DialogTitle>Download avviato</DialogTitle>
        <DialogDescription className="text-base leading-relaxed text-foreground">
          <span className="font-medium text-foreground">
            Dungeon World Italia è gratuito e lo sarà sempre
          </span>
          : nessun paywall, nessuna trappola nascosta tra le pagine. Ma dietro
          al sito non c&apos;è magia arcana: ci sono persone reali — che
          traducono, impaginano e correggono — e costi reali di hosting e
          infrastrutture da sostenere ogni mese.
          <br />
          <br />
          Se le nostre avventure ti divertono, considera una piccola donazione:
          anche il prezzo di una pozione di cura aiuta a tenere aperte le porte
          della taverna.
        </DialogDescription>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {KOFI_URL ? (
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants(), "gap-2")}
            >
              <HeartHandshake className="size-4" />
              Supportaci su Ko-fi
            </a>
          ) : null}
          <DialogClose
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Continua a giocare
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

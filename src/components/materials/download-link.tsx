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
import { KOFI_PAGE_URL } from "@/lib/kofi";

/** localStorage key storing the last day the donation modal was shown. */
const STORAGE_KEY = "dwi-download-modal";

interface DownloadLinkProps {
  href: string;
  name: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A download link for /files/... assets. The route serves them as
 * attachments, so the browser downloads without navigating; on click we
 * open the support/donation notice at most once a day and only for ~30%
 * of downloads.
 */
export function DownloadLink({ href, name, className, children }: DownloadLinkProps) {
  const [open, setOpen] = useState(false);

  const maybeOpenModal = () => {
    try {
      // already opened today: skip
      if (window.localStorage.getItem(STORAGE_KEY) === new Date().toDateString()) {
        return;
      }
    } catch {
      // localStorage unavailable: the random gate below still applies
    }

    // show the modal on 30% of downloads
    if (Math.random() > 0.3) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    } catch {
      // ignore
    }
    setOpen(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => setOpen(nextOpen)}
      disablePointerDismissal
    >
      <a
        href={href}
        download={name}
        onClick={maybeOpenModal}
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
          Se trovi utili le nostre risorse, considera una piccola donazione:
          anche il prezzo di una pozione di cura aiuta a tenere aperte le porte
          della taverna.
        </DialogDescription>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <a
            href={KOFI_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants(), "gap-2")}
          >
            <HeartHandshake className="size-4" />
            Supportaci su Ko-fi
          </a>
          <DialogClose
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Continua a esplorare
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

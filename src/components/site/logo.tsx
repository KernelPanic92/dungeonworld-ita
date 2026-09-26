import clsx from "clsx";
import { metalMania } from "@/lib/fonts";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={clsx(metalMania.className, "text-dw text-2xl leading-none", className)}
    >
      Dungeon World Italia
    </span>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  children,
  href,
  target,
  rel,
}: {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="px-6 py-2 border-white text-white border rounded-lg w-fit h-fit text-center flex items-center justify-center font-semibold text-base gap-x-2 hover:bg-dw hover:border-dw transition-colors duration-300"
    >
      {children}
    </Link>
  );
}

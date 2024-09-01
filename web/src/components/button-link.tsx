import Link from "next/link";
import {
  FC,
  HTMLAttributeAnchorTarget,
  PropsWithChildren,
  RefAttributes,
} from "react";
import { UrlObject } from "url";

export type ButtonLinkProps = PropsWithChildren<{
  target?: HTMLAttributeAnchorTarget | undefined;
  rel?: string | undefined;
  href: string | UrlObject;
}>;

export const ButtonLink: FC<ButtonLinkProps> = ({
  children,
  href,
  target,
  rel,
}) => (
  <Link
    href={href}
    target={target}
    rel={rel}
    className="px-6 py-2 border-white text-white border-[1px] 
            rounded-lg w-fit h-fit text-center flex items-center 
            justify-center font-semibold text-base gap-x-2
            hover:bg-dw hover:border-dw transition-colors duration-300"
  >
    {children}
  </Link>
);

import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

export const HomePageSection: FC<
  PropsWithChildren
> = ({ children }) => {
  return (
    <section
      className={clsx(
        "flex flex-col gap-y-6 w-full mx-auto max-w-[90rem] items-start justify-start pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] sm:pl-[max(env(safe-area-inset-left),5.5rem)] sm:pr-[max(env(safe-area-inset-right),5.5rem)]",
      )}
    >
      {children}
    </section>
  );
};
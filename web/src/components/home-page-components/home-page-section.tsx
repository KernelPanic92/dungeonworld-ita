import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

export const HomePageSection: FC<
  PropsWithChildren & { alternative?: boolean }
> = ({ children, alternative }) => {
  return (
    <div
      className={clsx(
        "flex flex-col gap-y-6 w-full mx-auto max-w-[90rem] items-start justify-start py-[1.5rem] pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] sm:pl-[max(env(safe-area-inset-left),5.5rem)] sm:pr-[max(env(safe-area-inset-right),5.5rem)]",
        [{ "bg-gray-100 dark:bg-neutral-900": alternative }]
      )}
    >
      {children}
    </div>
  );
};
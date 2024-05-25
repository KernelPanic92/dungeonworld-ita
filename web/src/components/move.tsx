import { FC, PropsWithChildren } from "react";

export const Move: FC<PropsWithChildren<{}>> = ({children}) =>
<div className="border-black border-opacity-[0.04] bg-opacity-[0.03] bg-black rounded-md border py-0.5 px-[.25em] text-[.9em] dark:border-white/10 dark:bg-white/10 my-10">
   <div className="p-2">{children}</div> 
</div>
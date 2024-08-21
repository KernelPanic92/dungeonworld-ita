import { Metal_Mania } from "next/font/google";
import { FC } from "react";
import clsx from "clsx";

const metalMania = Metal_Mania({
    weight: '400',
    preload: true,
    subsets: ['latin']
});

export const Logo: FC = () => <span className={clsx(metalMania.className, 'text-dw text-xl md:text-sm lg:text-3xl leading-none')}>Dungeon World Italia</span>
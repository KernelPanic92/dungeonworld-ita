import { Metal_Mania } from "next/font/google";

const metalMania = Metal_Mania({
    weight: '400',
    preload: true,
    subsets: ['latin']
});

export const Logo = () => <span className={metalMania.className} style={{fontSize: '1.5rem', color: '#73C482'}}>Dungeon World Italiano</span>
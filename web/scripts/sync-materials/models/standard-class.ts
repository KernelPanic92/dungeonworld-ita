import { Asset } from "./asset";
import { Showcase } from "./showcase";

export interface StandardClass {
    name: string;
    assets: Array<Asset>;
    shortDescription: string;
    description: string;
    credits: Array<{kind: string, contributors: Array<string>}>;
    showcase: Showcase;
}
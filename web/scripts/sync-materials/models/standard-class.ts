import { Asset } from "./asset";
import { License } from "./license";
import { Showcase } from "./showcase";

export interface StandardClass {
    name: string;
    license: License;
    assets: Array<Asset>;
    shortDescription: string;
    description: string;
    credits: Array<{kind: string, contributors: Array<string>}>;
    showcase: Showcase;
}
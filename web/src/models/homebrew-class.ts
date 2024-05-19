import { StandardClass } from "./standard-class";

export interface HomebrewClass extends StandardClass {
    compendium: boolean;
    authors: string;
    collection: string;
}
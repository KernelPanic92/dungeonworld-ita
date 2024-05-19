import { StandardClass } from "./standard-class";

export interface HomebrewClass extends StandardClass {
    title: string;
    compendium: boolean;
    authors: string;
    collection: string;
}
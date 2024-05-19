import { flow, trim, isEmpty, negate } from "lodash";
import { HomebrewClass, StandardClass } from "./models";

export const isWhiteSpace = flow(trim, isEmpty);
export const isNotWhiteSpace = negate(isWhiteSpace);

export const isHomebrewClass = (clazz: StandardClass | HomebrewClass ): clazz is HomebrewClass => {
    return 'collection' in clazz;
}

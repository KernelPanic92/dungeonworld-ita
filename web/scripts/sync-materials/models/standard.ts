import { Asset } from "./asset";
import { StandardClass } from "./standard-class";

export interface Standard {
    classes: Array<StandardClass>;
    gameMasterSummary: Asset;
    frontsSummary: Asset;
    movesSummary: Asset;
}
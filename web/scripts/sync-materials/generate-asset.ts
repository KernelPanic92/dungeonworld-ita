import Case from "case";
import { copyFileSync, mkdirSync } from "fs";
import Path from "path";
import { Asset } from "./models";
import { Asset as AssetModel} from "../../src/models";


export function generateAsset(publicFolderPath: string, path: string, metadata: Asset): AssetModel {
    const ext = Path.extname(metadata.path);
    const assetPath = Path.join(path, Case.kebab(metadata.name) + ext);

    const assetPathDestination = Path.join(publicFolderPath, assetPath);
    mkdirSync(Path.dirname(assetPathDestination), {recursive: true});
    copyFileSync(metadata.path, assetPathDestination);

    return {
        name: Case.title(metadata.name),
        url: encodeURI(assetPath),
    }
};

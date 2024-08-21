import Case from "case";
import { copyFileSync, mkdirSync } from "fs";
import Path from "path";
import { Asset } from "./models";
import { Asset as AssetModel} from "../../src/models";
import gm from 'gm';

export const generateAsset = async (publicFolderPath: string, path: string, metadata: Asset): Promise<AssetModel> => {
    const ext = Path.extname(metadata.path);
    const assetPath = Path.join(path, Case.kebab(metadata.name) + ext);

    const assetPathDestination = Path.join(publicFolderPath, assetPath);
    mkdirSync(Path.dirname(assetPathDestination), {recursive: true});
    copyFileSync(metadata.path, assetPathDestination);

    return {
        name: Case.title(metadata.name),
        url: encodeURI(assetPath),
        thumbnail: await createThumbnail(publicFolderPath, path, metadata),
    };
};


const createThumbnail = async (publicFolderPath: string, path: string, metadata: Asset) => {
    const assetPath = Path.join(path, Case.kebab(metadata.name) + '-thumbnail.webp');

    const assetPathDestination = Path.join(publicFolderPath, assetPath);
    mkdirSync(Path.dirname(assetPathDestination), {recursive: true});
    await new Promise<void>((resolve, reject) => {
        gm(`${metadata.path}[0]`)
        .setFormat('webp')
        .antialias(true)
        .resize(200, 283, '^')
        .gravity('Center')
        .extent(200, 283)
        .write(assetPathDestination, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        })
    });
    return encodeURI(assetPath);
}

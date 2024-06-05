import Case from "case";
import { copyFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { isHomebrewClass } from "./utilis";
import { DungeonWorld, HomebrewClass, StandardClass } from "./models";
import { DungeonWorld as DungeonWorldModel , StandardClass as StandardClassModel, HomebrewClass as HomebrewClassModel, Asset as AssetModel, Showcase as ShowcaseModel } from "../../src/models";
import { generateAsset } from "./generate-asset";
import { orderBy } from "lodash";


function generateClassSiteAsset(publicFolderPath: string, metadata: StandardClass): StandardClassModel;
function generateClassSiteAsset(publicFolderPath: string, metadata: HomebrewClass): HomebrewClassModel;
function generateClassSiteAsset(publicFolderPath: string, metadata: StandardClass | HomebrewClass): StandardClassModel | HomebrewClassModel {
    const name = Case.title(metadata.name);

    const assets: Array<AssetModel> = metadata.assets.map((asset) => {
        const assetPath = isHomebrewClass(metadata) ? 
            path.join('/assets', 'classi', 'homebrew', Case.kebab(metadata.authors), Case.kebab(metadata.collection), Case.kebab(name)):
            path.join('/assets', 'classi', 'standard', Case.kebab(name));

        return generateAsset(publicFolderPath, assetPath, asset);
    });

    const showcaseExt = path.extname(metadata.showcase.imagePath);
    const showcaseHeroPath = isHomebrewClass(metadata) ? 
            path.join('/images', 'classi', 'homebrew', Case.kebab(metadata.authors), Case.kebab(metadata.collection), Case.kebab(name), Case.kebab(metadata.showcase.heroName) + showcaseExt):
            path.join('/images', 'classi', 'standard', Case.kebab(name), Case.kebab(metadata.showcase.heroName) + showcaseExt);
    
    const showcaseHeroPathDestination = path.join(publicFolderPath, showcaseHeroPath);
    mkdirSync(path.dirname(showcaseHeroPathDestination), {recursive: true});
    copyFileSync(metadata.showcase.imagePath, showcaseHeroPathDestination);
    
    const showcase: ShowcaseModel = {
        heroName: Case.title(metadata.showcase.heroName),
        imageUrl: encodeURI(showcaseHeroPath)
    };

    
    const result: StandardClassModel = {
        name,
        slug: Case.kebab(name),
        description: metadata.description,
        shortDescription: metadata.shortDescription,
        credits: metadata.credits,
        showcase,
        assets,
    };

    if (isHomebrewClass(metadata)) {
        return {
            ...result,
            slug: Case.kebab(`${metadata.authors} ${metadata.collection} ${name}`),
            authors: metadata.authors,
            collection: metadata.collection,
            compendium: metadata.compendium,
        } satisfies HomebrewClassModel;
    }

    return result;
};

export const generateSiteAssets = (repositoryPath: string, metadata: DungeonWorld) => {
    const publicPath = path.join(repositoryPath, 'web/public');
    let standardClasses = metadata.standard.classes.map((clazz) => generateClassSiteAsset(publicPath, clazz) as StandardClassModel);
    standardClasses = orderBy(standardClasses, 'name', 'asc');
    
    let homebrewClasses = metadata.homebrew.classes.map((clazz) => generateClassSiteAsset(publicPath, clazz) as HomebrewClassModel);
    homebrewClasses = orderBy(homebrewClasses, ['name', 'authors', 'collection'], 'asc');

    const model: DungeonWorldModel = {
        homebrew: {
            classes: homebrewClasses,
        },
        standard: {
            classes: standardClasses,
            frontsSummary: generateAsset(publicPath, '/assets/standard', metadata.standard.frontsSummary),
            gameMasterSummary: generateAsset(publicPath, '/assets/standard', metadata.standard.gameMasterSummary),
            movesSummary: generateAsset(publicPath, '/assets/standard', metadata.standard.movesSummary),
        }
    };
    
    mkdirSync(path.join(repositoryPath, 'web/src/data'), { recursive: true });
    writeFileSync(path.join(repositoryPath, 'web/src/data/dungeon-world-data.json'), JSON.stringify(model), { encoding: 'utf8', flush: true });

    return model;
}
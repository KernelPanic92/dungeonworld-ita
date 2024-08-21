import { DungeonWorld } from "./models";
import path from 'path';

export const resolveRelativePaths = (basePath: string, metadata: DungeonWorld): void => {
    const standardClasses = metadata.standard.classes ?? [];
    const homebrewClasses = metadata.homebrew.classes ?? [];
    const allClasses = [...standardClasses, ...homebrewClasses];
  
    for (const clazz of allClasses) {
        clazz.showcase.imagePath = path.join(basePath, clazz.showcase.imagePath);
        
        for (const asset of clazz.assets) {
            asset.path = path.join(basePath, asset.path);
        }
    }

    metadata.standard.frontsSummary.path = path.join(basePath, metadata.standard.frontsSummary.path);

    metadata.standard.gameMasterSummary.path = path.join(basePath, metadata.standard.gameMasterSummary.path);
    
    metadata.standard.movesSummary.path = path.join(basePath, metadata.standard.movesSummary.path);

};
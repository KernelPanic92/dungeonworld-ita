import Case from "case";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { DungeonWorld, HomebrewClass, StandardClass} from "../../src/models";
import path from "path";
import {render} from 'mustache';
import { memoize } from "lodash";

const template = readFileSync(path.join(__dirname, 'mustache/class-template.mustache'), { encoding: 'utf8' });
const memoMkDir = memoize(mkdirSync);
export const generateClassPages = (repositoryPath: string, data: DungeonWorld) => {
    data.standard.classes.forEach((clazz) => generateClassPage(repositoryPath, clazz, true));
    data.homebrew.classes.forEach((clazz) => generateClassPage(repositoryPath, clazz, false));
};

function generateClassPage(repositoryPath: string, data: StandardClass, isStandardClass: true);
function generateClassPage(repositoryPath: string, data: HomebrewClass, isStandardClass: false);
function generateClassPage(repositoryPath: string, data: StandardClass, isStandardClass: boolean) {
    const rendered = render(template, {...data, isStandardClass, isHomebrewClass: !isStandardClass});
    const filePath = isStandardClass ? 
        path.join(repositoryPath, 'web/pages/manuale/classi', data.slug + '.mdx'): 
        path.join(repositoryPath, 'web/pages/homebrew/classi', data.slug + '.mdx');
    
    memoMkDir(path.dirname(filePath), { recursive: true });

    writeFileSync(filePath, rendered, { encoding: 'utf8' });
}
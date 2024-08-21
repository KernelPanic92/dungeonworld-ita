import { parse as parseYaml } from 'yaml';
import path from 'path';
import { readFileSync } from 'fs';
import { resolveRelativePaths } from './resolve-relative-paths';
import { DungeonWorld } from './models';
import { generateSiteAssets } from './generate-site-assets';
import { generateClassPages } from './generate-class-pages';

(async () => {
    const repositoryPath = path.join(__dirname, '../../../');
    const dungeonWorldYAML = path.join(repositoryPath, 'dungeonworld.yaml');
    const rawContent = readFileSync(dungeonWorldYAML, {encoding: 'utf8'});
    const metadata: DungeonWorld = parseYaml(rawContent)['dungeonWorld'];
    resolveRelativePaths(repositoryPath, metadata);
    const data = await generateSiteAssets(repositoryPath, metadata);
    generateClassPages(repositoryPath, data);
})().then(() => console.log('generated'));

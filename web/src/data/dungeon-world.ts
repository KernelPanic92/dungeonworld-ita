import { DungeonWorld } from 'src/models';
import data from './dungeon-world-data.json';
import { entries, groupBy } from 'lodash';

export const dungeonWorldData: DungeonWorld = data;

const homebrewClasses =  dungeonWorldData.homebrew.classes;

export const homebrewGroupedByAuthorsAndCollections = entries(groupBy(homebrewClasses, 'authors'))
    .map(([authors, authorClasses]) => {
        return {
            authors,
            collections: entries(groupBy(authorClasses, (clazz) => clazz.collection)).map(([collection, classes]) => ({ collection, classes })),
        }
    });
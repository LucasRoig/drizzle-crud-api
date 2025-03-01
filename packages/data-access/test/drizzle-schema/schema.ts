import * as movies from './movies';
import * as people from './people';
import * as moviesRelations from './movies-relations';
import * as peopleRelations from './people-relations';
import * as moviesToPeople from './movies-to-people';
import * as moviesToPeopleRelations from './movies-to-people-relations';

export const schema = { ...movies, ...people, ...moviesRelations, ...peopleRelations, ...moviesToPeople, ...moviesToPeopleRelations };
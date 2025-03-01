import { relations } from 'drizzle-orm';
import { moviesToPeople } from './movies-to-people';
import { movies } from './movies';
import { people } from './people';

export const moviesToPeopleRelations = relations(moviesToPeople, (helpers) => ({ movie: helpers.one(movies, { fields: [ moviesToPeople.A ], references: [ movies.id ] }), person: helpers.one(people, { fields: [ moviesToPeople.B ], references: [ people.id ] }) }));
import { relations } from 'drizzle-orm';
import { movies } from './movies';
import { moviesToPeople } from './movies-to-people';

export const moviesRelations = relations(movies, (helpers) => ({ actors: helpers.many(moviesToPeople), directors: helpers.many(moviesToPeople) }));
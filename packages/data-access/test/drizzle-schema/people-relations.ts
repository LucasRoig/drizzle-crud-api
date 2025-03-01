import { relations } from 'drizzle-orm';
import { people } from './people';
import { moviesToPeople } from './movies-to-people';

export const peopleRelations = relations(people, (helpers) => ({ movies_as_actor: helpers.many(moviesToPeople), movies_as_director: helpers.many(moviesToPeople) }));
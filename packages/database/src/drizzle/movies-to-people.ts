import { pgTable, text } from 'drizzle-orm/pg-core';

export const moviesToPeople = pgTable('_movies_as_actor', { A: text('A').notNull(), B: text('B').notNull() });
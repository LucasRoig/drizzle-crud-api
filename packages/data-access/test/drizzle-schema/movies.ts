import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const movies = pgTable('Movie', { id: serial('id').primaryKey(), title: text('title').notNull(), date: timestamp('date', { mode: 'date', precision: 3 }).notNull() });
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const people = pgTable('Person', { id: serial('id').primaryKey(), firstName: text('firstName').notNull(), lastName: text('lastName').notNull(), birthDate: timestamp('birthDate', { mode: 'date', precision: 3 }).notNull() });
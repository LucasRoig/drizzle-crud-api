import { getTableColumns, type Table } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyPgDatabase = PgDatabase<any, any>;

export function buildFindMany<TDatabase extends AnyPgDatabase, TTable extends Table>(database: TDatabase, table: TTable) {
  return () => {
    return database.select({
      ...getTableColumns(table),
    }).from(table as Table);
  }
}

export function buildRepository<TDatabase extends AnyPgDatabase, TTable extends Table>(database: TDatabase, table: TTable) {
  return {
    findMany: buildFindMany(database, table),
  }
}

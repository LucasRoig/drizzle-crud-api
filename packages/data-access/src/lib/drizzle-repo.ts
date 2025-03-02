import { getTableColumns, type Table } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";

export function findMany<TDatabase extends PgDatabase<any, any>, TTable extends Table>(database: TDatabase, table: TTable) {
  return database.select({
    ...getTableColumns(table),
  }).from(table as Table);
}

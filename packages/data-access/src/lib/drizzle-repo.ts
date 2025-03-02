import { getTableColumns, type Table } from "drizzle-orm";
import  type { PgDatabase } from "drizzle-orm/pg-core";
import { drizzleSchema } from "@repo/database";
import { type FiltersCore, toDrizzleWhereQuery } from "./filters";
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyPgDatabase = PgDatabase<any, any>;

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
function test(database: AnyPgDatabase) {
  const table = drizzleSchema.movies
  const query = database.select({
    ...getTableColumns(table),
  }).from(table).$dynamic()

  query.execute()
}

type FindManyArgs<T extends Table> = {
  where?: FiltersCore<T>;
};
export function buildFindMany<TDatabase extends AnyPgDatabase, TTable extends Table>(database: TDatabase, table: TTable) {
  return (args?: FindManyArgs<TTable>) => {
    const query = database.select({
      ...getTableColumns(table),
    }).from(table as Table)
    .$dynamic();

    if (args?.where) {
      query.where(toDrizzleWhereQuery(table, args.where));
    }

    const results = query.execute();

    //By using the $dynamic() method, we loose the correct inferrence of the return type
    //So we need to cast it to the correct type
    return results as unknown as typeof drizzleSchema.movies.$inferSelect[];
  }
}

export function buildRepository<TDatabase extends AnyPgDatabase, TTable extends Table>(database: TDatabase, table: TTable) {
  return {
    findMany: buildFindMany(database, table),
  }
}

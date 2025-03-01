import {
  and,
  type Column,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  type InferInsertModel,
  isNotNull,
  isNull,
  isSQLWrapper,
  like,
  lt,
  lte,
  ne,
  notIlike,
  notInArray,
  notLike,
  type SQL,
  type Table,
} from "drizzle-orm";
import { MySqlDatabase } from "drizzle-orm/mysql-core";
import { PgTable } from "drizzle-orm/pg-core";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { drizzleSchema } from "@repo/database";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { TableLikeHasEmptySelection } from "drizzle-orm/pg-core";
import { PgColumn } from "drizzle-orm/pg-core";
import { match } from "ts-pattern";

type GetColumnDataType<TColumn extends Column> = TColumn["_"]["dataType"];

//TODO: Remap all drizzle data types here
type GetRemappedColumnDataType<
  TColumn extends Column,
  TDataType = GetColumnDataType<TColumn>,
> = TDataType extends "number"
  ? number
  : TDataType extends "string"
    ? string
    : TDataType extends "date"
      ? Date
      : TDataType;

type FilterColumnOperatorsCore<TColumn extends Column, TColType = GetRemappedColumnDataType<TColumn>> = Partial<{
  eq: TColType;
  ne: TColType;
  lt: TColType;
  lte: TColType;
  gt: TColType;
  gte: TColType;
  like: string;
  notLike: string;
  ilike: string;
  notIlike: string;
  inArray: Array<TColType>;
  notInArray: Array<TColType>;
  isNull: boolean;
  isNotNull: boolean;
}>;
type FiltersCore<TTable extends Table> = Partial<{
  [Column in keyof TTable["_"]["columns"]]: FilterColumnOperatorsCore<TTable["_"]["columns"][Column]>;
}>;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseFilters<TTable extends Table>(table: TTable, filters: FiltersCore<TTable>) {
  const conditions: SQL<unknown>[] = [];
  const columns = getTableColumns(table);
  const columnNames = Object.keys(filters) as (keyof TTable["_"]["columns"])[];
  for (const columnName of columnNames) {
    const columnFilters = filters[columnName];
    if (!columnFilters) {
      continue;
    }
    const column = columns[columnName];
    if (column === undefined) {
      throw new Error("Illegal state. Column is undefined.");
    }
    const columnCondition: SQL<unknown>[] = [];
    for (const [operator, value] of Object.entries(columnFilters)) {
      match(operator)
        .with("eq", () => columnCondition.push(eq(column, value)))
        .with("ne", () => columnCondition.push(ne(column, value)))
        .with("lt", () => columnCondition.push(lt(column, value)))
        .with("lte", () => columnCondition.push(lte(column, value)))
        .with("gt", () => columnCondition.push(gt(column, value)))
        .with("gte", () => columnCondition.push(gte(column, value)))
        .with("like", () => {
          if (isSQLWrapper(value) || isString(value)) {
            columnCondition.push(like(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected string or SQLWrapper.`,
            );
          }
        })
        .with("notLike", () => {
          if (isSQLWrapper(value) || isString(value)) {
            columnCondition.push(notLike(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected string or SQLWrapper.`,
            );
          }
        })
        .with("ilike", () => {
          if (isSQLWrapper(value) || isString(value)) {
            columnCondition.push(ilike(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected string or SQLWrapper.`,
            );
          }
        })
        .with("notIlike", () => {
          if (isSQLWrapper(value) || isString(value)) {
            columnCondition.push(notIlike(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected string or SQLWrapper.`,
            );
          }
        })
        .with("inArray", () => {
          if (Array.isArray(value) || isSQLWrapper(value)) {
            columnCondition.push(inArray(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected Array or SQLWrapper.`,
            );
          }
        })
        .with("notInArray", () => {
          if (Array.isArray(value) || isSQLWrapper(value)) {
            columnCondition.push(notInArray(column, value));
          } else {
            throw new Error(
              `Illegal value exception: column: ${columnName.toString()}, operator: ${operator}, expected Array or SQLWrapper.`,
            );
          }
        })
        .with("isNull", () => columnCondition.push(isNull(column)))
        .with("isNotNull", () => columnCondition.push(isNotNull(column)))
        .otherwise(() => {
          throw new Error(`Illegal operator exception : the operator ${operator} is not handled.`);
        });
    }
    if (conditions.length > 0) {
      const andConditions = and(...columnCondition);
      if (andConditions) {
        conditions.push(andConditions);
      }
    }
  }
  return and(...conditions);
}

const movieTable = drizzleSchema.movies;

type FindAllArgs<T extends Table> = {
  where?: FiltersCore<T>;
};
export function buildFindAll<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return (args?: FindAllArgs<T>) => {
    try {
      return db
        .select({
          ...getTableColumns(table),
        })
        .from(table as Table)
      //   .$dynamic();
      // if (args?.where) {
      //   query.where(parseFilters(table, args.where));
      // }
      // const results = await query.execute();
      // return results;
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  };
}

type FindUniqueArgs<T extends Table> = {
  where: FiltersCore<T>;
};
export function buildFindUnique<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return async (args: FindUniqueArgs<T>) => {
    try {
      const results = await db
        .select({
          ...getTableColumns(table),
        })
        .from(table as Table)
        // .where(parseFilters(table, args.where));
      if (results.length > 1) {
        throw new Error("Multiple records found");
      }
      const [result] = results;
      if (!result) {
        throw new Error("No record found");
      }
      return result;
    } catch (error) {
      console.error("Error fetching record:", error);
      throw error;
    }
  };
}

type InsertArgs<T extends Table> = {
  data: InferInsertModel<T>;
};
export function buildInsert<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return async (args: InsertArgs<T>) => {
    try {
      const rows = await db.insert(table).values(args.data).returning();
      if (rows.length > 1) {
        throw new Error("Multiple records found");
      }
      const [result] = rows;
      if (!result) {
        throw new Error("No record found");
      }
      return result;
    } catch (error) {
      console.error("Error inserting record:", error);
      throw error;
    }
  };
}

type InsertManyArgs<T extends Table> = {
  data: InferInsertModel<T>[];
};
export function buildInsertMany<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return (args: InsertManyArgs<T>) => {
    try {
      return db.insert(table).values(args.data).returning();
      // return rows;
    } catch (error) {
      console.error("Error inserting record:", error);
      throw error;
    }
  };
}

type UpdateArgs<T extends Table> = {
  where: FiltersCore<T>;
  data: Partial<InferInsertModel<T>>;
};
export function buildUpdate<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return async (args: UpdateArgs<T>) => {
    try {
      const rows = await db.update(table).set(args.data).where(parseFilters(table, args.where)).returning();
      return rows;
    } catch (error) {
      console.error("Error updating records:", error);
      throw error;
    }
  };
}

type DeleteArgs<T extends Table> = {
  where: FiltersCore<T>;
}
export function buildDelete<T extends Table, TDatabase extends PgDatabase<any, any>>(table: T, db: TDatabase) {
  return async (args: DeleteArgs<T>) => {
    try {
      await db.delete(table).where(parseFilters(table, args.where));
    } catch(error) {
      console.error("Error deleting records:", error);
      throw error;
    }
  }
}

const findAllMovies = buildFindAll(movieTable, drizzleSchema);
const findUniqueMovie = buildFindUnique(movieTable, drizzleSchema);
const insertMovie = buildInsert(movieTable, drizzleSchema);
const insertManyMovies = buildInsertMany(movieTable, drizzleSchema);
const updateMovies = buildUpdate(movieTable, drizzleSchema);
const deleteMovie = buildDelete(movieTable, drizzleSchema);

const movies = findAllMovies({
  where: {
    title: {
      eq: "myMovie",
    },
    date: {
      gte: new Date(),
    },
  },
});

const uniqueMovie = findUniqueMovie({
  where: {
    id: {
      eq: 1,
    },
  },
});

const insertedMovie = insertMovie({
  data: {
    date: new Date(),
    title: "Movie 1",
  },
});
const insertedMovies = insertManyMovies({
  data: [
    {
      date: new Date(),
      title: "Movie 2",
    },
    {
      date: new Date(),
      title: "Movie 3",
    },
  ],
});
const updatedMovie = updateMovies({
  where: {
    id: {
      eq: 12
    }
  },
  data: {
    title: "test"
  }
})
deleteMovie({
  where: {
    date: {
      gte: new Date(),
    }
  }
})

import { and, eq, getTableColumns, gt, gte, ilike, inArray, isNotNull, isNull, isSQLWrapper, like, lt, lte, ne, notIlike, notInArray, notLike, type Column, type SQL, type Table } from "drizzle-orm";
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

export type FiltersCore<TTable extends Table> = Partial<{
  [Column in keyof TTable["_"]["columns"]]: FilterColumnOperatorsCore<TTable["_"]["columns"][Column]>;
}>;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function toDrizzleWhereQuery<TTable extends Table>(table: TTable, filters: FiltersCore<TTable>) {
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
    if (columnCondition.length > 0) {
      const andConditions = and(...columnCondition);
      if (andConditions) {
        conditions.push(andConditions);
      }
    }
  }
  return and(...conditions);
}

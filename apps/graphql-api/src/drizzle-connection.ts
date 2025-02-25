import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleSchema } from "@repo/database";
import { Pool } from "pg";
import { Env } from "./env";

declare global {
  var pgPool: Pool | undefined;
  var drizzleInstance: NodePgDatabase<typeof drizzleSchema> | undefined;
}

let pool: Pool | undefined;
// biome-ignore lint/suspicious/noRedeclare: declared in global scope
let drizzleInstance: NodePgDatabase<typeof drizzleSchema> | undefined;

export const getDrizzleInstance = () => {
  if (!drizzleInstance) {
    pool =
      globalThis.pgPool ||
      new Pool({
        connectionString: Env.getConfig().DB_SOURCE,
      });
    drizzleInstance =
      globalThis.drizzleInstance ||
      drizzle(pool, {
        schema: drizzleSchema,
        logger: false,
      });
    if (process.env.NODE_ENV !== "production") {
      globalThis.pgPool = pool;
      globalThis.drizzleInstance = drizzleInstance;
    }
  }
  return drizzleInstance;
};
export const closeDrizzleInstance = () => {
  if (pool) {
    void pool.end();
  }
};

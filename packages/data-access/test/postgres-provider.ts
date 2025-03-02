import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { expect } from "vitest";
import { schema as drizzleSchema } from "./drizzle-schema/schema";
import { execSync } from "node:child_process";

const schema = drizzleSchema;
function runMigrations(container: StartedPostgreSqlContainer) {
  const dbUrl = container.getConnectionUri();
  execSync(`export DB_SOURCE=${dbUrl} && pnpm prisma migrate deploy --schema=./test/prisma/schema.prisma`, { stdio: "inherit" });
}


export async function getPostgresContainer() {
  const container = await new PostgreSqlContainer().start();
  const client = new Client({
    connectionString: container.getConnectionUri(),
  });
  await client.connect();
  const query = await client.query("select 1");
  expect(query.rows.length).toBe(1);
  await runMigrations(container);
  const drizzleClient = drizzle(container.getConnectionUri(), {
    schema,
  });
  return {
    container,
    drizzleClient,
  };
}

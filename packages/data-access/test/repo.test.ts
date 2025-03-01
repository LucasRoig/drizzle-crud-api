import { expect, test } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { execSync } from "node:child_process";
import { schema as drizzleSchema } from "./drizzle-schema/schema";

const schema = drizzleSchema;
function runMigrations(container: StartedPostgreSqlContainer) {
  const dbUrl = container.getConnectionUri();
  execSync(`export DB_SOURCE=${dbUrl} && pnpm prisma migrate deploy --schema=./test/prisma/schema.prisma`, { stdio: "inherit" });
}

async function getPostgresContainer() {
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

test("insert 1", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const inserted = await client.insert(schema.movies).values({ title: "The Matrix", date: new Date() }).returning();
  expect(inserted.length).toBe(1);
  expect(inserted[0]?.title).toBe("The Matrix");
  const allMovies = await client.select().from(schema.movies);
  expect(allMovies.length).toBe(1);
  expect(allMovies[0]?.title).toBe("The Matrix");
});

test("insert 2", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const inserted = await client.insert(schema.movies).values({ title: "The Matrix", date: new Date() }).returning();
  expect(inserted.length).toBe(1);
  expect(inserted[0]?.title).toBe("The Matrix");
  const allMovies = await client.select().from(schema.movies);
  expect(allMovies.length).toBe(1);
  expect(allMovies[0]?.title).toBe("The Matrix");
});

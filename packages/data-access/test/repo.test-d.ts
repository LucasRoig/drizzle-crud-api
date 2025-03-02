import { expectTypeOf, test } from "vitest";
import { schema as drizzleSchema } from "./drizzle-schema/schema";
import { getPostgresContainer } from "./postgres-provider";
import { findMany } from "../src/lib/drizzle-repo";

const schema = drizzleSchema;

test("findAll", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const allMovies = await findMany(client, schema.movies);
  expectTypeOf(allMovies).toEqualTypeOf<typeof drizzleSchema.movies.$inferSelect[]>();
})

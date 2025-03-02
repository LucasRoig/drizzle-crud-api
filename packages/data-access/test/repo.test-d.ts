import { expectTypeOf, test } from "vitest";
import { schema as drizzleSchema } from "./drizzle-schema/schema";
import { getPostgresContainer } from "./postgres-provider";
import { buildRepository } from "../src/lib/drizzle-repo";

const schema = drizzleSchema;

test("findAll", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const movieRepository = buildRepository(client, schema.movies);
  const allMovies = await movieRepository.findMany();
  expectTypeOf(allMovies).toEqualTypeOf<typeof drizzleSchema.movies.$inferSelect[]>();
})

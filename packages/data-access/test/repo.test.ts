import { expect, test } from "vitest";
import { schema as drizzleSchema } from "./drizzle-schema/schema";
import { getPostgresContainer } from "./postgres-provider";
import { buildRepository } from "../src/lib/drizzle-repo";

const schema = drizzleSchema;

test("findAll", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const movies: typeof schema.movies.$inferInsert[] = [
    { title: "The Matrix", date: new Date() },
    { title: "The Matrix Reloaded", date: new Date() },
    { title: "The Matrix Revolutions", date: new Date() },
  ]

  await client.insert(schema.movies).values(movies);
  const movieRepository = buildRepository(client, schema.movies);
  const allMovies = await movieRepository.findMany();
  expect(allMovies.length).toBe(3);
  expect(allMovies[0]?.title).toBe("The Matrix");
  expect(allMovies[1]?.title).toBe("The Matrix Reloaded");
  expect(allMovies[2]?.title).toBe("The Matrix Revolutions");
})

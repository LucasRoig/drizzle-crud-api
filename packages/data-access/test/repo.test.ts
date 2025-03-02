import { expect, test } from "vitest";
import { schema as drizzleSchema } from "./drizzle-schema/schema";
import { getPostgresContainer } from "./postgres-provider";
import { buildRepository } from "../src/lib/drizzle-repo";

const schema = drizzleSchema;

test("findAll", async () => {
  const { drizzleClient: client} = await getPostgresContainer();
  const movies = [
    { title: "The Matrix", date: new Date() },
    { title: "The Matrix Reloaded", date: new Date() },
    { title: "The Matrix Revolutions", date: new Date() },
  ]

  await client.insert(schema.movies).values(movies);
  const movieRepository = buildRepository(client, schema.movies);

  const allMovies = await movieRepository.findMany();
  expect(allMovies.length).toBe(3);
  expect(allMovies[0]?.title).toBe(movies[0]?.title);
  expect(allMovies[1]?.title).toBe(movies[1]?.title);
  expect(allMovies[2]?.title).toBe(movies[2]?.title);

  const filterByTitle = await movieRepository.findMany({
    where: {
      title: {
        eq: "The Matrix",
      },
    },
  });
  expect(filterByTitle.length).toBe(1);
  expect(filterByTitle[0]?.title).toBe(movies[0]?.title);

  const filterByTitleIlike = await movieRepository.findMany({
    where: {
      title: {
        ilike: "%Matrix%",
      },
    },
  });
  expect(filterByTitleIlike.length).toBe(3);
})

import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".", // defining the root folder is important to load the .env file
  test: {
    testTimeout: 60000,
  }
});

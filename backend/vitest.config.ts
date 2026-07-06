import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 60000,
    // Each integration test file starts its own in-memory Mongo replica set;
    // running them one at a time keeps ports/temp dirs from colliding.
    fileParallelism: false,
  },
});

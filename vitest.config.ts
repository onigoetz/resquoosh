import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["test/*.test.{js,mjs}"],
		// WASM codec encode/decode (notably avif) is well over the 5s default
		testTimeout: 60_000,
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			clean: true,
		},
	},
});

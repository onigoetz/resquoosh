import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { getImageSize } = require("../dist/cjs/index.js");

test("cjs webp", async () => {
	const file = await fs.readFile(path.join(dirname, "images/animated.webp"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("cjs avif", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.avif"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("cjs ico", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.ico"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 256, height: 256 });
});

test("cjs jpg", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.jpg"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("cjs png", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.png"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("cjs svg", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.svg"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

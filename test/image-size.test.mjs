import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { getImageSize } from "../dist/mjs/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

test("mjs webp", async () => {
	const file = await fs.readFile(path.join(dirname, "images/animated.webp"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("mjs avif", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.avif"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("mjs ico", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.ico"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 256, height: 256 });
});

test("mjs jpg", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.jpg"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("mjs png", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.png"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

test("mjs svg", async () => {
	const file = await fs.readFile(path.join(dirname, "images/test.svg"));
	const result = await getImageSize(file);

	expect(result).toEqual({ width: 400, height: 400 });
});

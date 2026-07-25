import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { optimizeImage } = require("../dist/cjs/index.js");

const filesToCompress = [
	["webp", "images/test.webp"],
	["avif", "images/test.avif"],
	["jpg", "images/test.jpg"],
	["png", "images/test.png"],
];

const filesToPassThrough = [
	["webp animated", "images/animated.webp"],
	["ico", "images/test.ico"],
	["svg", "images/test.svg"],
];

for (const [name, fileName] of filesToCompress) {
	test(`cjs ${name}`, async () => {
		const file = await fs.readFile(path.join(dirname, fileName));
		const result = await optimizeImage(file);

		expect(result.length).toBeLessThan(file.length);
	});
}

for (const [name, fileName] of filesToPassThrough) {
	test(`cjs ${name}`, async () => {
		const file = await fs.readFile(path.join(dirname, fileName));
		const result = await optimizeImage(file);

		expect(result.length).toBe(file.length);
	});
}

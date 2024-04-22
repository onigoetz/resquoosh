import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "ava";
import { optimizeImage } from "../dist/mjs/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
	test(`mjs ${name}`, async (t) => {
		const file = await fs.readFile(path.join(dirname, fileName));
		const result = await optimizeImage(file);

		t.truthy(
			result.length < file.length,
			`result file (${result.length}) must be smaller than its source (${file.length})`,
		);
	});
}

for (const [name, fileName] of filesToPassThrough) {
	test(`mjs ${name}`, async (t) => {
		const file = await fs.readFile(path.join(dirname, fileName));
		const result = await optimizeImage(file);

		t.truthy(
			result.length === file.length,
			`result file (${result.length}) must be identical to its source (${file.length})`,
		);
	});
}

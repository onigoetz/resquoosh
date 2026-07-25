import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { getImageSize, optimizeImage } from "../dist/mjs/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToResize = [
	["webp", "images/test.webp"],
	["avif", "images/test.avif"],
	["jpg", "images/test.jpg"],
	["png", "images/test.png"],
];

for (const [name, fileName] of filesToResize) {
	test(`esm ${name}`, async () => {
		const file = await fs.readFile(path.join(dirname, fileName));

		const originalSize = await getImageSize(file);
		expect(originalSize).toEqual({ width: 400, height: 400 });

		const result = await optimizeImage(file, { width: 256 });

		const size = await getImageSize(result);
		expect(size).toEqual({ width: 256, height: 256 });
	});
}

const test = require("ava");
const fs = require("node:fs/promises");
const path = require("node:path");
const { optimizeImage, getImageSize } = require("../dist/cjs/index.js");

const filesToResize = [
	["webp", "images/test.webp"],
	["avif", "images/test.avif"],
	["jpg", "images/test.jpg"],
	["png", "images/test.png"],
];

for (const [name, fileName] of filesToResize) {
	test(`cjs ${name}`, async (t) => {
		const file = await fs.readFile(path.join(__dirname, fileName));

		const originalSize = await getImageSize(file);
		t.deepEqual(originalSize, { width: 400, height: 400 });

		const result = await optimizeImage(file, { width: 256 });

		const size = await getImageSize(result);
		t.deepEqual(size, { width: 256, height: 256 });
	});
}

const test = require("ava");
const fs = require("fs/promises");
const path = require("path");
const { optimizeImage, stopWorker } = require("../dist/index.js");

test.after.always(() => {
	stopWorker();
});

const filesToCompress = [
	["webp", "images/test.webp"],
	["avif", "images/test.avif"],
	["jpg", "images/test.jpg"],
	["png", "images/test.png"],
];

const filesToPassThrough = [
	// TODO :: animated webp isn't decoded correctly
	//["webp animated", "images/animated.webp"],
	["ico", "images/test.ico"],
	["svg", "images/test.svg"],
];

for (const [name, fileName] of filesToCompress) {
	test(name, async (t) => {
		const file = await fs.readFile(path.join(__dirname, fileName));
		const result = await optimizeImage(file);

		t.truthy(
			result.length < file.length,
			`result file (${result.length}) must be smaller than its source (${file.length})`,
		);
	});
}

for (const [name, fileName] of filesToPassThrough) {
	test(name, async (t) => {
		const file = await fs.readFile(path.join(__dirname, fileName));
		const result = await optimizeImage(file);

		t.truthy(
			result.length === file.length,
			`result file (${result.length}) must be identical to its source (${file.length})`,
		);
	});
}

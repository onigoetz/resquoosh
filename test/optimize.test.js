const test = require("ava");
const fs = require("fs/promises");
const path = require("path");
const { optimizeImage, stopWorker } = require("../dist/index.js");

test.after.always(() => {
	stopWorker();
});

// TODO :: re-enable webp and fix
test.skip("webp", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/animated.webp"));
	console.log({ file });
	const result = await optimizeImage(file);

	console.log(result);

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

test("avif", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.avif"));
	const result = await optimizeImage(file, { quality: 75 });

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

test.skip("ico", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.ico"));
	const result = await optimizeImage(file);

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

test("jpg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.jpg"));
	const result = await optimizeImage(file, { quality: 75 });

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

test("png", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.png"));
	const result = await optimizeImage(file);

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

test.skip("svg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.svg"));
	const result = await optimizeImage(file);

	t.truthy(
		result.byteLength < file.length,
		`result file (${result.byteLength}) must be smaller than its source (${file.length})`,
	);
});

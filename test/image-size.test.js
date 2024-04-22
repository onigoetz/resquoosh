const test = require("ava");
const fs = require("node:fs/promises");
const path = require("node:path");
const { getImageSize } = require("../dist/cjs/index.js");

test("cjs webp", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/animated.webp"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("cjs avif", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.avif"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("cjs ico", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.ico"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 256, height: 256 });
});

test("cjs jpg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.jpg"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("cjs png", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.png"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("cjs svg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.svg"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

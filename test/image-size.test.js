const test = require("ava");
const fs = require("fs/promises");
const path = require("path");
const { getImageSize, stopWorker } = require("../dist/index.js");

test.after.always(() => {
	stopWorker();
});

test("webp", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/animated.webp"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("avif", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.avif"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("ico", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.ico"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 256, height: 256 });
});

test("jpg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.jpg"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("png", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.png"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

test("svg", async (t) => {
	const file = await fs.readFile(path.join(__dirname, "images/test.svg"));
	const result = await getImageSize(file);

	t.deepEqual(result, { width: 400, height: 400 });
});

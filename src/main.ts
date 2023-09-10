import { Worker } from "jest-worker";
import * as path from "path";
import { cpus } from "os";
//import * as impl from "./impl.js";

type RotateOperation = {
	type: "rotate";
	numRotations: number;
};
type ResizeOperation = {
	type: "resize";
} & (
	| { width: number; height?: never }
	| { height: number; width?: never }
	| { width: number; height: number }
);
export type Operation = RotateOperation | ResizeOperation;
export type Encoding = "jpeg" | "png" | "webp" | "avif";

let workerStarted = false;

export function execOnce<T extends (...args: any[]) => ReturnType<T>>(
	fn: T,
): T {
	let used = false;
	let result: ReturnType<T>;

	return ((...args: any[]) => {
		if (!used) {
			used = true;
			result = fn(...args);
		}
		return result;
	}) as T;
}

const getWorker = execOnce(() => {
	workerStarted = true;
	return new Worker(path.resolve(__dirname, "impl"), {
		enableWorkerThreads: true,
		// There will be at most 6 workers needed since each worker will take
		// at least 1 operation type.
		numWorkers: Math.max(1, Math.min(cpus().length - 1, 6)),
		computeWorkerKey: (method) => method,
	});
});

// enable instead of the real worker
//const getWorker: () => typeof import("./impl") = () => impl;

export function stopWorker() {
	if (workerStarted) {
		// TODO :: restore feature
		//getWorker().end();
		workerStarted = false;
	}
}

export async function getMetadata(
	buffer: Buffer,
): Promise<{ width: number; height: number }> {
	const worker: typeof import("./impl") = getWorker() as any;
	const { width, height } = await worker.decodeBuffer(buffer);
	return { width, height };
}

export async function processBuffer(
	buffer: Buffer,
	operations: Operation[],
	encoding: Encoding,
	quality: number,
): Promise<Buffer> {
	const worker: typeof import("./impl") = getWorker() as any;

	let imageData = await worker.decodeBuffer(buffer);
	for (const operation of operations) {
		if (operation.type === "rotate") {
			imageData = await worker.rotate(imageData, operation.numRotations);
			continue;
		}
		if (operation.type === "resize") {
			const opt = { image: imageData, width: 0, height: 0 };
			if (
				operation.width &&
				imageData.width &&
				imageData.width > operation.width
			) {
				opt.width = operation.width;
			}
			if (
				operation.height &&
				imageData.height &&
				imageData.height > operation.height
			) {
				opt.height = operation.height;
			}

			if (opt.width > 0 || opt.height > 0) {
				imageData = await worker.resize(opt);
			}
		}
	}

	switch (encoding) {
		case "jpeg":
			return Buffer.from(await worker.encodeJpeg(imageData, { quality }));
		case "webp":
			return Buffer.from(await worker.encodeWebp(imageData, { quality }));
		case "avif":
			return Buffer.from(await worker.encodeAvif(imageData, { quality }));
		case "png":
			return Buffer.from(await worker.encodePng(imageData));
		default:
			throw Error(`Unsupported encoding format`);
	}
}

export async function decodeBuffer(buffer: Buffer) {
	const worker: typeof import("./impl") = getWorker() as any;
	const imageData = await worker.decodeBuffer(buffer);
	return imageData;
}

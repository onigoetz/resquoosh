import { Worker } from "jest-worker";
import * as path from "path";
import { cpus } from "os";
import type { Encoding } from "./detectors";

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

type ImageWorker = typeof import("./impl");

// Using async dispose, which might not be defined yet
//@ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

// Store the worker globally
let worker: ImageWorker & Worker = null;
let workerHandles = 0;

function startWorker() {
	worker = new Worker(path.resolve(__dirname, "impl"), {
		enableWorkerThreads: true,
		// There will be at most 6 workers needed since each worker will take
		// at least 1 operation type.
		numWorkers: Math.max(1, Math.min(cpus().length - 1, 6)),
		computeWorkerKey: (method) => method,
	}) as any as ImageWorker & Worker;
}

function getWorker() {
	if (!worker) {
		startWorker();
	}
	workerHandles++;
	return worker;
}

function shutdownWorker() {
	if (workerHandles == 0) {
		worker.end();
		worker = null;
	}
}

function releaseWorker() {
	workerHandles--;
	if (workerHandles === 0) {
		// Wait for a short moment before actually shutting down the worker
		setTimeout(shutdownWorker, 150);
	}
}

class WorkerHandle implements Disposable {
	private instance: ImageWorker;

	/**
	 * Put the worker behind a getter so we make sure to
	 * 1. Initialize it only when require
	 * 2. Make sure to take only one handle in a WorkerHandle
	 */
	get worker(): ImageWorker {
		if (!this.instance) {
			this.instance = getWorker();
		}

		return this.instance;
	}

	[Symbol.dispose]() {
		releaseWorker();
	}
}

export async function processBuffer(
	buffer: Buffer,
	operations: Operation[],
	encoding: Encoding,
	quality: number,
): Promise<Buffer> {
	using worker = new WorkerHandle();

	let imageData = await worker.worker.decodeBuffer(buffer, encoding);
	for (const operation of operations) {
		if (operation.type === "rotate") {
			imageData = await worker.worker.rotate(imageData, operation.numRotations);
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
				imageData = await worker.worker.resize(opt);
			}
		}
	}

	switch (encoding) {
		case "mozjpeg":
			return Buffer.from(
				await worker.worker.encodeJpeg(imageData, { quality }),
			);
		case "webp":
			return Buffer.from(
				await worker.worker.encodeWebp(imageData, { quality }),
			);
		case "avif":
			return Buffer.from(
				await worker.worker.encodeAvif(imageData, { quality }),
			);
		case "oxipng":
			return Buffer.from(await worker.worker.encodePng(imageData));
		default:
			throw Error(`Unsupported encoding format`);
	}
}

export async function decodeBuffer(buffer: Buffer, encoding: Encoding) {
	using worker = new WorkerHandle();
	const imageData = await worker.worker.decodeBuffer(buffer, encoding);
	return imageData;
}

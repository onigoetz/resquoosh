import { cpus } from "os";
import * as path from "path";
import type { Encoding } from "./detectors.js";

interface RotateOperation {
	type: "rotate";
	numRotations: number;
}
interface ResizeOperation {
	type: "resize";
	width?: number;
	height?: number;
}

export type Operation = RotateOperation | ResizeOperation;

// Using async dispose, which might not be defined yet
//@ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

interface RunOptions {
	name?: string | null;
}
interface Tinypool {
	run(task: any, options?: RunOptions): Promise<any>;
	destroy(): Promise<void>;
}

// Store the worker globally
let worker: Tinypool | null = null;
let workerHandles = 0;

async function startWorker() {
	// For dual CJS/ESM support, will be replaced at build time
	const workerFile = path.join(__dirname, "impl.js");

	const lib = await import("tinypool");

	worker = new lib.default({
		filename: workerFile,
		maxThreads: Math.max(1, Math.min(cpus().length - 1, 6)),
	});
}

async function getWorker() {
	if (!worker) {
		await startWorker();
	}
	workerHandles++;
	return worker;
}

function shutdownWorker() {
	if (workerHandles === 0 && worker) {
		worker.destroy();
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
	private instance: Tinypool | null = null;

	/**
	 * Put the worker behind a getter so we make sure to
	 * 1. Initialize it only when require
	 * 2. Make sure to take only one handle in a WorkerHandle
	 */
	async worker(): Promise<Tinypool> {
		if (!this.instance) {
			this.instance = await getWorker();
		}

		return this.instance as Tinypool;
	}

	async decodeBuffer(buffer: Buffer, encoding: Encoding): Promise<ImageData> {
		const worker = await this.worker();
		return worker.run({ buffer, encoding }, { name: "decodeBuffer" });
	}

	async rotate(image: ImageData, numRotations: number): Promise<ImageData> {
		const worker = await this.worker();
		return worker.run({ image, numRotations }, { name: "rotate" });
	}

	async resize(resizeOpts: object): Promise<ImageData> {
		const worker = await this.worker();
		return worker.run(resizeOpts, { name: "resize" });
	}

	async encodeJpeg(
		image: ImageData,
		{ quality }: { quality?: number },
	): Promise<Buffer | Uint8Array> {
		const worker = await this.worker();
		return worker.run({ image, quality }, { name: "encodeJpeg" });
	}

	async encodeWebp(
		image: ImageData,
		{ quality }: { quality?: number },
	): Promise<Buffer | Uint8Array> {
		const worker = await this.worker();
		return worker.run({ image, quality }, { name: "encodeWebp" });
	}

	async encodeAvif(
		image: ImageData,
		{ quality }: { quality?: number },
	): Promise<Buffer | Uint8Array> {
		const worker = await this.worker();
		return worker.run({ image, quality }, { name: "encodeAvif" });
	}

	async encodePng(image: ImageData): Promise<Buffer | Uint8Array> {
		const worker = await this.worker();
		return worker.run({ image }, { name: "encodePng" });
	}

	[Symbol.dispose]() {
		releaseWorker();
	}
}

export async function processBuffer(
	buffer: Buffer,
	operations: Operation[],
	encoding: Encoding,
	quality?: number,
): Promise<Buffer> {
	using worker = new WorkerHandle();

	let imageData = await worker.decodeBuffer(buffer, encoding);
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
		case "mozjpeg":
			return Buffer.from(await worker.encodeJpeg(imageData, { quality }));
		case "webp":
			return Buffer.from(await worker.encodeWebp(imageData, { quality }));
		case "avif":
			return Buffer.from(await worker.encodeAvif(imageData, { quality }));
		case "oxipng":
			return Buffer.from(await worker.encodePng(imageData));
		default:
			throw Error("Unsupported encoding format");
	}
}

export async function decodeBuffer(buffer: Buffer, encoding: Encoding) {
	using worker = new WorkerHandle();
	const imageData = await worker.decodeBuffer(buffer, encoding);
	return imageData;
}

import { getOrientation, Orientation } from "get-orientation";
import imageSizeOf from "image-size";

import { processBuffer, decodeBuffer } from "./main";
import detectors, { detectCodec } from "./detectors";

// Do not import anything other than types from this module
// because it will throw an error when using `outputFileTracing`
// as `jest-worker` is ignored in file tracing. Use `await import`
// or `require` instead.
import type { Operation } from "./main";

export interface ImageParamsResult {
	href: string;
	isAbsolute: boolean;
	isStatic: boolean;
	width: number;
	quality: number;
	mimeType: string;
	sizes: number[];
	minimumCacheTTL: number;
}

export interface OptimizeOptions {
	quality?: number;
	width?: number;
	height?: number;
}

export async function optimizeImage(
	buffer: Buffer,
	{ quality, width, height }: OptimizeOptions = {},
): Promise<Buffer> {
	const encoding = detectCodec(buffer);

	// Unsupported buffer, give it back
	if (!encoding) {
		return buffer;
	}

	const operations: Operation[] = [];

	// Begin Squoosh transformation logic
	const orientation = await getOrientation(buffer);
	if (orientation === Orientation.RIGHT_TOP) {
		operations.push({ type: "rotate", numRotations: 1 });
	} else if (orientation === Orientation.BOTTOM_RIGHT) {
		operations.push({ type: "rotate", numRotations: 2 });
	} else if (orientation === Orientation.LEFT_BOTTOM) {
		operations.push({ type: "rotate", numRotations: 3 });
	} else {
		// TODO: support more orientations
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const _: never = orientation
	}

	if (width || height) {
		operations.push({ type: "resize", width, height });
	}

	return await processBuffer(buffer, operations, encoding, quality);
}

export async function getImageSize(buffer: Buffer): Promise<{
	width?: number;
	height?: number;
}> {
	// TODO: upgrade "image-size" package to support AVIF
	// See https://github.com/image-size/image-size/issues/348
	if (detectors.avif(buffer)) {
		const { width, height } = await decodeBuffer(buffer);
		return { width, height };
	}

	const { width, height } = imageSizeOf(buffer);
	return { width, height };
}

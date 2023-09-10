import { getOrientation, Orientation } from "get-orientation";
import imageSizeOf from "image-size";

import { processBuffer, decodeBuffer, stopWorker } from "./main";

// Do not import anything other than types from this module
// because it will throw an error when using `outputFileTracing`
// as `jest-worker` is ignored in file tracing. Use `await import`
// or `require` instead.
import type { Operation } from "./main";

const AVIF = "image/avif";
const WEBP = "image/webp";
const PNG = "image/png";
const JPEG = "image/jpeg";
const GIF = "image/gif";
const SVG = "image/svg+xml";
const ICO = "image/x-icon";

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

/**
 * Inspects the first few bytes of a buffer to determine if
 * it matches the "magic number" of known file signatures.
 * https://en.wikipedia.org/wiki/List_of_file_signatures
 */
function detectContentType(buffer: Buffer) {
	if ([0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b)) {
		return JPEG;
	}
	if (
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
			(b, i) => buffer[i] === b,
		)
	) {
		return PNG;
	}
	if ([0x47, 0x49, 0x46, 0x38].every((b, i) => buffer[i] === b)) {
		return GIF;
	}
	if (
		[0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every(
			(b, i) => !b || buffer[i] === b,
		)
	) {
		return WEBP;
	}
	if ([0x3c, 0x3f, 0x78, 0x6d, 0x6c].every((b, i) => buffer[i] === b)) {
		return SVG;
	}
	if (
		[0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every(
			(b, i) => !b || buffer[i] === b,
		)
	) {
		return AVIF;
	}
	if ([0x00, 0x00, 0x01, 0x00].every((b, i) => buffer[i] === b)) {
		return ICO;
	}
	return null;
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
	const contentType = detectContentType(buffer);

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

	// TODO :: enable optional resizing
	/*if (height) {
      operations.push({ type: 'resize', width, height })
    } else {
      operations.push({ type: 'resize', width })
    }*/

	switch (contentType) {
		case AVIF:
			return await processBuffer(buffer, operations, "avif", quality);
		case WEBP:
			return await processBuffer(buffer, operations, "webp", quality);
		case PNG:
			return await processBuffer(buffer, operations, "png", quality);
		case JPEG:
			return await processBuffer(buffer, operations, "jpeg", quality);
		default:
			console.error("Unsupported content type", contentType);
	}

	return buffer;
}

export async function getImageSize(buffer: Buffer): Promise<{
	width?: number;
	height?: number;
}> {
	const contentType = detectContentType(buffer);

	// TODO: upgrade "image-size" package to support AVIF
	// See https://github.com/image-size/image-size/issues/348
	if (contentType === AVIF) {
		const { width, height } = await decodeBuffer(buffer);
		return { width, height };
	}

	const { width, height } = imageSizeOf(buffer);
	return { width, height };
}

export { stopWorker };

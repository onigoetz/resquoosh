import { getOrientation, Orientation } from "get-orientation";
import imageSizeOf from "image-size";

import detectors, { detectCodec } from "./detectors.js";
import { decodeBuffer, type Operation, processBuffer } from "./main.js";

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

	const orientation = await getOrientation(buffer);
	switch (orientation) {
		case Orientation.RIGHT_TOP:
			operations.push({ type: "rotate", numRotations: 1 });
			break;
		case Orientation.BOTTOM_RIGHT:
			operations.push({ type: "rotate", numRotations: 2 });
			break;
		case Orientation.LEFT_BOTTOM:
			operations.push({ type: "rotate", numRotations: 3 });
			break;

		// TODO: support more orientations
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
		const { width, height } = await decodeBuffer(buffer, "avif");
		return { width, height };
	}

	const { width, height } = imageSizeOf(buffer);
	return { width, height };
}

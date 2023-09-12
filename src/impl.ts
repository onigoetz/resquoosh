import type { EncodeOptions as EncodeAvifOptions } from "./avif/avif_enc";
import { codecs as supportedFormats, preprocessors } from "./codecs";
import type { Encoding } from "./detectors";
import ImageData from "./image_data";
import type { EncodeOptions as EncodeJpegOptions } from "./mozjpeg/mozjpeg_enc";
import type { EncodeOptions as EncodeWebpOptions } from "./webp/webp_enc";

export async function decodeBuffer(
	_buffer: Buffer | Uint8Array,
	encoding: Encoding,
): Promise<ImageData> {
	const buffer = Buffer.from(_buffer);
	const encoder = supportedFormats[encoding];
	const mod = await encoder.dec();
	const rgba = mod.decode(new Uint8Array(buffer));
	return rgba;
}

export async function rotate(
	image: ImageData,
	numRotations: number,
): Promise<ImageData> {
	image = ImageData.from(image);

	const m = await preprocessors.rotate.instantiate();
	return await m(image.data, image.width, image.height, { numRotations });
}

type ResizeOpts = { image: ImageData } & (
	| { width: number; height?: never }
	| { height: number; width?: never }
	| { height: number; width: number }
);

export async function resize({ image, width, height }: ResizeOpts) {
	image = ImageData.from(image);

	const p = preprocessors.resize;
	const m = await p.instantiate();
	return await m(image.data, image.width, image.height, {
		...p.defaultOptions,
		width,
		height,
	});
}

export async function encodeJpeg(
	image: ImageData,
	{ quality }: { quality: number },
): Promise<Buffer | Uint8Array> {
	image = ImageData.from(image);

	const e = supportedFormats.mozjpeg;

	const options: EncodeJpegOptions = { ...e.defaultEncoderOptions };
	if (quality) {
		options.quality = quality;
	}

	const m = await e.enc();
	const r = await m.encode(image.data, image.width, image.height, options);
	return Buffer.from(r);
}

export async function encodeWebp(
	image: ImageData,
	{ quality }: { quality: number },
): Promise<Buffer | Uint8Array> {
	image = ImageData.from(image);

	const e = supportedFormats.webp;

	const options: EncodeWebpOptions = { ...e.defaultEncoderOptions };
	if (quality) {
		options.quality = quality;
	}

	const m = await e.enc();
	const r = await m.encode(image.data, image.width, image.height, options);
	return Buffer.from(r);
}

export async function encodeAvif(
	image: ImageData,
	{ quality }: { quality: number },
): Promise<Buffer | Uint8Array> {
	image = ImageData.from(image);

	const e = supportedFormats.avif;
	const m = await e.enc();

	const options: EncodeAvifOptions = {
		...e.defaultEncoderOptions,
	};

	if (quality) {
		const avifQuality = Math.max(quality - 20, 0);
		const val = e.autoOptimize.min || 62;
		// Think of cqLevel as the "amount" of quantization (0 to 62),
		// so a lower value yields higher quality (0 to 100).
		options.cqLevel = Math.round(val - (avifQuality / 100) * val);
	}

	const r = await m.encode(image.data, image.width, image.height, options);
	return Buffer.from(r);
}

export async function encodePng(
	image: ImageData,
): Promise<Buffer | Uint8Array> {
	image = ImageData.from(image);

	const e = supportedFormats.oxipng;
	const m = await e.enc();
	const r = await m.encode(image.data, image.width, image.height, {
		...e.defaultEncoderOptions,
	});
	return Buffer.from(r);
}

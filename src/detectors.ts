export type SupportedCodecs = "mozjpeg" | "webp" | "avif" | "oxipng";

const detectors: {
	[codec in SupportedCodecs]: (buffer: Buffer) => boolean;
} = {
	mozjpeg: (buffer) => [0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b),
	webp: (buffer) => {
		const isWebp = [
			0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
		].every((b, i) => !b || buffer[i] === b);

		if (!isWebp) {
			return false;
		}
		const firstChunk = buffer.slice(30, 34);
		const firstChunkString = Array.from(firstChunk)
			.map((v) => String.fromCodePoint(v))
			.join("");

		// Webp is supported but not animated webp
		return firstChunkString !== "ANIM";
	},
	avif: (buffer) =>
		[0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every(
			(b, i) => !b || buffer[i] === b,
		),
	oxipng: (buffer) =>
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
			(b, i) => buffer[i] === b,
		),
} as const;

export default detectors;

export function detectCodec(buffer: Buffer): SupportedCodecs | undefined {
	return Object.entries(detectors).find(([, detector]) =>
		detector(buffer),
	)?.[0] as SupportedCodecs | undefined;
}

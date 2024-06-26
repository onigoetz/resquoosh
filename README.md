# Resquoosh

[![Latest version](https://img.shields.io/github/release/onigoetz/resquoosh.svg?style=flat-square)](https://github.com/onigoetz/resquoosh/releases)
![License](https://img.shields.io/github/license/onigoetz/resquoosh?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/onigoetz/resquoosh/nodejs.yml?style=flat-square&logo=github)
[![NPM Downloads](https://img.shields.io/npm/dm/@onigoetz/resquoosh?style=flat-square&logo=npm)](https://www.npmjs.com/package/@onigoetz/resquoosh)

Resquoosh is a fork of [`@squoosh/lib`](https://www.npmjs.com/package/@squoosh/lib).
But copied from [Vercel's fork](https://github.com/vercel/next.js/tree/canary/packages/next/src/server/lib/squoosh).

This version has a simple API.

```javascript
import fs from "node:fs/promises";
import { optimizeImage, getImageSize } from "@onigoetz/resquoosh";

const file = await fs.readFile("file.jpg");

const size = await getImageSize(file);
console.log(size); // { width: 400, height: 400 }

const optimized = await optimizeImage(file);
// returns an optimized buffer
```

## `getImageSize(buffer: Buffer) => Promise<{ width: number, height: number }>`

Get the size of an image within a `Buffer`.

Supports the same formats as [`image-size`](https://www.npmjs.com/package/image-size) + AVIF.

## `optimizeImage(buffer: Buffer, options: OptimizeOptions) => Promise<Buffer>`

Compresses images, optionally resize or rotate the image.

### Supported formats

- webp (Except animated webp)
- avif
- jpeg
- png

### Supported options

```typescript
interface OptimizeOptions {
    /**
     * Value between 1 and 100
     */ 
	quality?: number;
    /**
     * If only width is specified; will resize and respect ratio
     */
	width?: number;
    /**
     * If only height is specified; will resize and respect ratio
     */
	height?: number;
}
```

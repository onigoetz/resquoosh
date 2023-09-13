#!/usr/bin/env bash

set -e

echo "=> Cleaning"
rm -rf dist

echo "=> Creating ESM version"
node_modules/.bin/tsc -p tsconfig.json

echo "=> Creating CJS version"
node_modules/.bin/tsc -p tsconfig-cjs.json

cat >dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >dist/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF

echo "=> Patch for ESM support"

# on macos the "-i" flag behaves differently
MAIN=$(cat dist/mjs/main.js | sed 's/path.join.__dirname, "impl.js"./new URL("impl.js", import.meta.url).href/')
echo "$MAIN" > dist/mjs/main.js

CODEC=$(cat dist/mjs/codecs.js | sed 's/__dirname/path.dirname(import.meta.url.replace("file:\/\/", ""))/')
echo "$CODEC" > dist/mjs/codecs.js

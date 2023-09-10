const path = require("path");
const { src, dest } = require("vinyl-fs");
const ts = require("@onigoetz/gulp-typescript");
const { finished } = require('node:stream/promises');
const { compose } = require("stream");

const pwd = process.cwd();

function peek(prefix) {
	return compose(async function* (source) {
		for await (const chunk of source) {
			console.log(
				prefix,
				chunk.path.replace(`${pwd}/src`, "dist"),
			);
			yield chunk;
		}
	});
}

function copyWasm() {
    return src("src/**/*.wasm", { encoding: false })
        .pipe(peek("writing"))
        .pipe(dest("dist"))
}

function buildTs() {
    const tsProject = ts.createProject(path.join(__dirname, "tsconfig.json"));

    return src(["src/**/*.ts", "src/**/*.js"], { sourcemaps: true })
        .pipe(tsProject())
        .pipe(peek("writing"))
        .pipe(dest("dist", { sourcemaps: "."}))
    
}

async function main() {
    console.log("Copy WASM");
    await finished(copyWasm());

    console.log("Build TS");
    await finished(buildTs());
}

main().then(
    () => console.log("Done"),
    (e) => console.error("Whoops", e)
)
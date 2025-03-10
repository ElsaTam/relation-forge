import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { readFileSync } from "fs";
import { beforeEach, afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

beforeEach(async () => {
	await GlobalRegistrator.register();
});

afterEach(async () => {
	await GlobalRegistrator.unregister();
});

plugin({
	name: "svelte loader",
	setup(builder) {
		builder.onLoad({ filter: /\.svelte(\?[^.]+)?$/ }, ({ path }) => {
			try {
				const source = readFileSync(
					path.substring(
						0,
						path.includes("?") ? path.indexOf("?") : path.length
					),
					"utf-8"
				);

				const result = compile(source, {
					filename: path,
					generate: "client",
					dev: false,
				});

				return {
					contents: result.js.code,
					loader: "js",
				};
			} catch (err) {
				if (typeof err === "string") {
					throw new Error(`Failed to compile Svelte component: ${err}`);
				}
				else if (err instanceof Error) {
					throw new Error(`Failed to compile Svelte component: ${err.message}`);
				}
				else {
					throw new Error(`Failed to compile Svelte component: ${path}`);
				}
			}
		});
	},
});
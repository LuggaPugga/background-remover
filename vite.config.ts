import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteSolid from "vite-plugin-solid";

const config = defineConfig({
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
	optimizeDeps: {
		include: ["@huggingface/transformers"],
	},
	ssr: {
		external: ["@huggingface/transformers"],
	},
	build: {
		commonjsOptions: {
			include: [/node_modules/],
			transformMixedEsModules: true,
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [nitro(), tailwindcss(), tanstackStart(), viteSolid({ ssr: true })],
});
export default config;

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteSolid from "vite-plugin-solid";

const config = defineConfig({
	build: {
		rolldownOptions: {
			experimental: {
				lazyBarrel: true,
			},
		},
	},
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [nitro(), tailwindcss(), tanstackStart(), viteSolid({ ssr: true })],
});
export default config;

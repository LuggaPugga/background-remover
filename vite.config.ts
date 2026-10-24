import tailwindcss from "@tailwindcss/vite";
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
	plugins: [tailwindcss(), viteSolid()],
});
export default config;

import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import packageJson from './package.json' with { type: 'json' }

const config = defineConfig(() => ({
	server: {
		headers: {
		  'Cross-Origin-Opener-Policy': 'same-origin',
		  'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	  },
  
  resolve:
    process.env.NODE_ENV === "production"
      ? {
          alias: {
            "@huggingface/transformers":
              `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${packageJson.dependencies['@huggingface/transformers'].replace('^', '')}`,
          },
        }
      : {},

  plugins: [
    nitro({	}),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config

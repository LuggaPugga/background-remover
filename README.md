# Background Remover

A web application for removing backgrounds from images using AI models. The application runs entirely in the browser using Hugging Face Transformers, processing images client-side without uploading them to a server.

Live at [bg.luggapugga.dev](https://bg.luggapugga.dev)

## Features

The application uses MODNET or RMBG-1.4 models depending on WebGPU availability. Images are processed locally in your browser, ensuring privacy and fast processing without server round-trips.

## Development

Install dependencies and start the development server:

```bash
bun install
bun run dev
```

Build for production:

```bash
bun run build
```

Preview the production build with `bun run serve`. Deploy the generated `dist/` directory to any static hosting service; no application server is needed.

Run `bun run typecheck` and `bun run check` to validate changes.

## Tech Stack

Built with SolidJS, Vite, and Hugging Face Transformers. Uses Tailwind CSS for styling and Biome for linting and formatting.

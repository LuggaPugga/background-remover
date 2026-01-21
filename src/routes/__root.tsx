import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/solid-router";
import { configure } from "onedollarstats";
import type { JSX } from "solid-js";
import { HydrationScript, isServer } from "solid-js/web";
import {
	getInitialThemeClass,
	ThemeProvider,
} from "@/components/theme-provider";
import appCss from "../styles.css?url";

if (!isServer) {
	configure();
}

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				title:
					"Free Background Remover - Remove Image Backgrounds Instantly Online",
			},
			{
				name: "description",
				content:
					"Remove image backgrounds instantly with our free online tool. Fast, accurate, and privacy-focused - all processing happens locally in your browser. No uploads, no sign-up required.",
			},
			{
				name: "keywords",
				content:
					"background remover, remove background, image background removal, free background remover, online background remover, transparent background, cut out image, photo editor",
			},
			{
				property: "og:title",
				content: "Free Background Remover - Remove Image Backgrounds Instantly",
			},
			{
				property: "og:description",
				content:
					"Remove image backgrounds instantly with our free online tool. Fast, accurate, and privacy-focused - all processing happens locally in your browser.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Free Background Remover - Remove Image Backgrounds Instantly",
			},
			{
				name: "twitter:description",
				content:
					"Remove image backgrounds instantly with our free online tool. Fast, accurate, and privacy-focused - all processing happens locally in your browser.",
			},
			{
				name: "robots",
				content: "index, follow",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
		scripts: [
			{
				src: "https://faststats.dev/script.js",
				"data-sitekey": "b8a7daa046cf889351a284d0925ab0eb",
				"data-webVitals": "true",
				"data-trackErrors": "true",
				async: true,
			},
		],
	}),
	component: () => (
		<ThemeProvider>
			<Outlet />
		</ThemeProvider>
	),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: JSX.Element }) {
	return (
		<html lang="en" class={getInitialThemeClass()}>
			<head>
				<HydrationScript />
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
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
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<Analytics />
			</head>
			<body>
				<ThemeProvider enableSystem attribute="class">
					{children}
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}

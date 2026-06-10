import { Moon, Sparkles, Sun, type SVGAttributes } from "lucide-solid";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();

	const toggleTheme = () => {
		const current = theme();
		const resolved = resolvedTheme();

		if (current === "system") {
			setTheme(resolved === "dark" ? "light" : "dark");
		} else {
			setTheme(current === "dark" ? "light" : "dark");
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			<div class="relative size-4">
				<Moon class="size-4 absolute left-0 top-0 dark:opacity-0 not-dark:opacity-100" />
				<Sun class="size-4 absolute left-0 top-0 dark:opacity-100 not-dark:opacity-0" />
			</div>
		</Button>
	);
}

const GitHub = (props: SVGAttributes) => (
	<svg {...props} viewBox="0 0 1024 1024" fill="none">
		<title>GitHub</title>
		<path
			fill-rule="evenodd"
			clip-ule="evenodd"
			d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
			transform="scale(64)"
			fill="#ffff"
		/>
	</svg>
);

export function Header() {
	return (
		<header class="border-b border-border">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						class="py-6"
						onClick={() => window.location.reload()}
						aria-label="Start over"
					>
						<div class="flex size-8 items-center justify-center rounded-md bg-foreground">
							<Sparkles class="h-4 w-4 text-background" />
						</div>
						<span class="text-sm font-medium">Background Remover</span>
					</Button>
				</div>
				<div class="flex items-center gap-2">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						as="a"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub"
						href="https://github.com/LuggaPugga/background-remover"
					>
						<GitHub class="size-4" />
					</Button>
				</div>
			</div>
		</header>
	);
}

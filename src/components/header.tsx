import { Github, Moon, Sparkles, Sun } from "lucide-solid";
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
						<Github class="size-4" />
					</Button>
				</div>
			</div>
		</header>
	);
}

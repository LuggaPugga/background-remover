import { Github, Moon, Sparkles, Sun } from "lucide-solid";
import { Show } from "solid-js";
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
		<button
			type="button"
			onClick={toggleTheme}
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9"
		>
			<Show
				when={resolvedTheme() === "dark"}
				fallback={<Moon class="h-4 w-4" />}
			>
				<Sun class="h-4 w-4" />
			</Show>
		</button>
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
					>
						<div class="flex size-8 items-center justify-center rounded-md bg-foreground">
							<Sparkles class="h-4 w-4 text-background" />
						</div>
						<span class="text-sm font-medium">Background Remover</span>
					</Button>
				</div>
				<div class="flex items-center gap-2">
					<ThemeToggle />
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/LuggaPugga/background-remover"
						class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9"
					>
						<Github class="h-4 w-4" />
					</a>
				</div>
			</div>
		</header>
	);
}

import { Github, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
			{theme === "dark" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	);
}

export function Header() {
	return (
		<header className="border-b border-border">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						className="py-6"
						onClick={() => window.location.reload()}
					>
						<div className="flex size-8 items-center justify-center rounded-md bg-foreground">
							<Sparkles className="h-4 w-4 text-background" />
						</div>
						<span className="text-sm font-medium">Background Remover</span>
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<Button variant="ghost" size="icon" asChild>
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://github.com/LuggaPugga/background-remover"
						>
							<Github className="h-4 w-4" />
						</a>
					</Button>
				</div>
			</div>
		</header>
	);
}

import { createPrefersDark } from "@solid-primitives/media";
import { makePersisted } from "@solid-primitives/storage";
import type { Accessor, JSX } from "solid-js";
import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	useContext,
} from "solid-js";
import { isServer } from "solid-js/web";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Accessor<Theme>;
	setTheme: (theme: Theme) => void;
	resolvedTheme: Accessor<"light" | "dark">;
}

const ThemeContext = createContext<ThemeContextValue>();

const [storedTheme, setStoredTheme] = makePersisted(
	createSignal<Theme>("system"),
	{ name: "theme" },
);

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

export function getInitialThemeClass(): "light" | "dark" {
	if (isServer) return "dark";
	const theme = storedTheme();
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return theme;
}

interface ThemeProviderProps {
	children: JSX.Element;
}

export function ThemeProvider(props: ThemeProviderProps) {
	const prefersDark = createPrefersDark();

	const resolvedTheme = createMemo<"light" | "dark">(() => {
		const current = storedTheme();
		if (current === "system") {
			return prefersDark() ? "dark" : "light";
		}
		return current;
	});

	createEffect(() => {
		if (isServer) return;
		const resolved = resolvedTheme();
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
		root.style.colorScheme = resolved;
	});

	return (
		<ThemeContext.Provider
			value={{ theme: storedTheme, setTheme: setStoredTheme, resolvedTheme }}
		>
			{props.children}
		</ThemeContext.Provider>
	);
}

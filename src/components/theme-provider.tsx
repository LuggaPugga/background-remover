import { createPrefersDark } from "@solid-primitives/media";
import type { Accessor, JSX } from "solid-js";
import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onMount,
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

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

interface ThemeProviderProps {
	children: JSX.Element;
	defaultTheme?: Theme;
	storageKey?: string;
	attribute?: string;
}

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
	if (isServer) return defaultTheme;
	try {
		const stored = localStorage.getItem(storageKey);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
	} catch {}
	return defaultTheme;
}

function resolveTheme(theme: Theme, prefersDark: boolean): "light" | "dark" {
	return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}

function applyTheme(resolved: "light" | "dark", attribute: string) {
	if (isServer) return;
	const root = document.documentElement;
	if (attribute === "class") {
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
	} else {
		root.setAttribute(attribute, resolved);
	}
	root.style.colorScheme = resolved;
}

export function ThemeProvider(props: ThemeProviderProps) {
	const storageKey = props.storageKey ?? "theme";
	const defaultTheme = props.defaultTheme ?? "system";
	const attribute = props.attribute ?? "class";

	const initialTheme = getStoredTheme(storageKey, defaultTheme);
	const [theme, setThemeState] = createSignal<Theme>(initialTheme);
	const prefersDark = createPrefersDark();

	const resolvedTheme = createMemo<"light" | "dark">(() =>
		resolveTheme(theme(), prefersDark()),
	);

	onMount(() => {
		const stored = getStoredTheme(storageKey, defaultTheme);
		if (stored !== theme()) {
			setThemeState(stored);
		}
		const resolved = resolveTheme(
			stored,
			window.matchMedia("(prefers-color-scheme: dark)").matches,
		);
		applyTheme(resolved, attribute);
	});

	createEffect(() => {
		const resolved = resolvedTheme();
		applyTheme(resolved, attribute);
		if (!isServer) {
			try {
				localStorage.setItem(storageKey, theme());
			} catch {}
		}
	});

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	const value: ThemeContextValue = {
		theme,
		setTheme,
		resolvedTheme,
	};

	return (
		<ThemeContext.Provider value={value}>
			{props.children}
		</ThemeContext.Provider>
	);
}

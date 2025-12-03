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

export function ThemeProvider(props: ThemeProviderProps) {
	const storageKey = props.storageKey ?? "theme";
	const defaultTheme = props.defaultTheme ?? "system";

	const [theme, setTheme] = createSignal<Theme>(defaultTheme);
	const prefersDark = createPrefersDark(false);

	onMount(() => {
		const stored = localStorage.getItem(storageKey) as Theme | null;
		if (stored) {
			setTheme(stored);
		} else {
			// If no stored theme, we might want to sync with what the script did
			// But defaultTheme "system" + prefersDark should match the script logic
			setTheme(defaultTheme);
		}
	});

	const resolvedTheme = createMemo<"light" | "dark">(() => {
		const current = theme();
		if (current === "system") {
			return prefersDark() ? "dark" : "light";
		}
		return current;
	});

	const applyTheme = (resolved: "light" | "dark") => {
		if (isServer) return;
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
		root.style.colorScheme = resolved;
	};

	createEffect(() => {
		const current = theme();
		const resolved = resolvedTheme();

		// Persist to storage
		if (!isServer) {
			localStorage.setItem(storageKey, current);
		}

		// Apply to DOM
		applyTheme(resolved);
	});

	const value: ThemeContextValue = {
		theme,
		setTheme,
		resolvedTheme,
	};

	return (
		<ThemeContext.Provider value={value}>
			<ThemeScript storageKey={storageKey} defaultTheme={defaultTheme} />
			{props.children}
		</ThemeContext.Provider>
	);
}

function ThemeScript(props: { storageKey: string; defaultTheme: Theme }) {
	const script = `
(function() {
  var storageKey = ${JSON.stringify(props.storageKey)};
  var defaultTheme = ${JSON.stringify(props.defaultTheme)};
  var theme;
  try { theme = localStorage.getItem(storageKey); } catch(e) {}
  if (!theme) theme = defaultTheme;
  var resolved = theme;
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
})();
`;
	return <script innerHTML={script} />;
}

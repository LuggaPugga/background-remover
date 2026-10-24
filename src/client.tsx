import { init } from "@faststats/web";
import { errorTracking } from "@faststats/web/error";
import { webVitals } from "@faststats/web/web-vitals";
import { configure } from "onedollarstats";
import { render } from "solid-js/web";
import { BackgroundRemover } from "@/components/background-remover";
import { ThemeProvider } from "@/components/theme-provider";
import "./styles.css";

configure();
init({
	siteKey: "b8a7daa046cf889351a284d0925ab0eb",
	extensions: [errorTracking(), webVitals()],
});

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(
	() => (
		<ThemeProvider>
			<BackgroundRemover />
		</ThemeProvider>
	),
	root,
);

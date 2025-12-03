import { createFileRoute } from "@tanstack/solid-router";
import { BackgroundRemover } from "../components/background-remover";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return <BackgroundRemover />;
}

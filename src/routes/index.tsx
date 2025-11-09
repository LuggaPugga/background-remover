import { createFileRoute } from "@tanstack/react-router";
import { BackgroundRemover } from "../components/background-remover";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return <BackgroundRemover />;
}

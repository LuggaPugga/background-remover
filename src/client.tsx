import { hydrateStart, StartClient } from "@tanstack/solid-start/client";
import { hydrate } from "solid-js/web";

hydrateStart().then((router) => {
	hydrate(() => <StartClient router={router} />, document);
});

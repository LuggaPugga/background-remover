import { Show } from "solid-js";

interface ModelLoadingIndicatorProps {
	isLoading: boolean;
	progress?: number;
	status?: string;
	modelName?: string;
}

export function ModelLoadingIndicator(props: ModelLoadingIndicatorProps) {
	const displayText = () => {
		const name = props.modelName;
		const status = props.status ?? "Loading model...";
		return name ? `Loading ${name}` : status;
	};

	const progress = () => props.progress ?? 0;
	const percentage = () => Math.round(progress() * 100);

	return (
		<Show when={props.isLoading}>
			<div class="relative overflow-hidden rounded-lg border border-border bg-card px-3 h-10 shadow-sm">
				<div class="flex items-center gap-2 h-full">
					<div class="relative shrink-0">
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
					</div>
					<div class="flex-1 min-w-0 flex items-center justify-between gap-2">
						<span class="text-sm text-foreground truncate">
							{displayText()}
						</span>
						<Show when={progress() > 0}>
							<span class="text-xs font-mono font-medium text-muted-foreground whitespace-nowrap tabular-nums">
								{percentage()}%
							</span>
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
}

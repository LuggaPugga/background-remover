import { cn } from "@/lib/utils";

interface ModelLoadingIndicatorProps {
	isLoading: boolean;
	progress?: number;
	status?: string;
	modelName?: string;
}

export function ModelLoadingIndicator({
	isLoading,
	progress = 0,
	status = "Loading model...",
	modelName,
}: ModelLoadingIndicatorProps) {
	const displayText = modelName ? `Loading ${modelName}` : status;
	const percentage = Math.round(progress * 100);

	return (
		<div
			className={cn(
				"transition-opacity duration-300",
				!isLoading && "opacity-0 pointer-events-none",
			)}
		>
			<div className="relative overflow-hidden rounded-lg border border-border bg-card px-3 h-10 shadow-sm">
				<div className="flex items-center gap-2 h-full">
					<div className="relative flex-shrink-0">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
					</div>
					<div className="flex-1 min-w-0 flex items-center justify-between gap-2">
						<span className="text-sm text-foreground truncate">
							{displayText}
						</span>
						{progress > 0 && (
							<span className="text-xs font-mono font-medium text-muted-foreground whitespace-nowrap tabular-nums">
								{percentage}%
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

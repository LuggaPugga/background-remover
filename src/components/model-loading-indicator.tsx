import { cn } from "@/lib/utils";

interface ModelLoadingIndicatorProps {
	isLoading: boolean;
}

export function ModelLoadingIndicator({
	isLoading,
}: ModelLoadingIndicatorProps) {
	return (
		<div
			className={cn(
				"mb-6 overflow-hidden transition-all duration-300",
				isLoading ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
			)}
		>
			<div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card p-4">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
				<span className="text-sm text-muted-foreground">
					Loading background removal model...
				</span>
			</div>
		</div>
	);
}

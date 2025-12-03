import { Sparkles } from "lucide-solid";

interface ProcessedImagePreviewProps {
	processedImage: string | null;
	isProcessing: boolean;
}

export function ProcessedImagePreview({
	processedImage,
	isProcessing,
}: ProcessedImagePreviewProps) {
	return (
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-muted-foreground">
					Background Removed
				</span>
			</div>
			<div
				class="overflow-hidden rounded-lg border border-border"
				style={{
					"background-image":
						"linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
					"background-size": "16px 16px",
					"background-position": "0 0, 0 8px, 8px -8px, -8px 0px",
					"background-color": "#f5f5f5",
				}}
			>
				{processedImage ? (
					<img
						src={processedImage || "/placeholder.svg"}
						alt="Processed"
						class="h-full w-full object-contain"
						style={{ "max-height": "500px" }}
					/>
				) : (
					<div class="flex h-full min-h-[300px] items-center justify-center bg-card/50">
						<div class="flex flex-col items-center gap-3 text-center">
							{isProcessing ? (
								<>
									<div class="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
									<p class="text-sm text-muted-foreground">Processing...</p>
								</>
							) : (
								<>
									<Sparkles class="h-8 w-8 text-muted-foreground" />
									<p class="text-sm text-muted-foreground">
										Ready to remove background
									</p>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

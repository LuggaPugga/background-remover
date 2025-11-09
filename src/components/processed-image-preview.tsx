import { Sparkles } from "lucide-react";

interface ProcessedImagePreviewProps {
	processedImage: string | null;
	isProcessing: boolean;
}

export function ProcessedImagePreview({
	processedImage,
	isProcessing,
}: ProcessedImagePreviewProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">
					Background Removed
				</span>
			</div>
			<div
				className="overflow-hidden rounded-lg border border-border"
				style={{
					backgroundImage:
						"linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
					backgroundSize: "16px 16px",
					backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
					backgroundColor: "#f5f5f5",
				}}
			>
				{processedImage ? (
					<img
						src={processedImage || "/placeholder.svg"}
						alt="Processed"
						className="h-full w-full object-contain"
						style={{ maxHeight: "500px" }}
					/>
				) : (
					<div className="flex h-full min-h-[300px] items-center justify-center bg-card/50">
						<div className="flex flex-col items-center gap-3 text-center">
							{isProcessing ? (
								<>
									<div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
									<p className="text-sm text-muted-foreground">Processing...</p>
								</>
							) : (
								<>
									<Sparkles className="h-8 w-8 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
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

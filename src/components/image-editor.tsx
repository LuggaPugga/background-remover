import { Download, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BackgroundColorPicker } from "./background-color-picker";
import { Button } from "./ui/button";

interface ImageEditorProps {
	originalImage: string;
	processedImage: string | null;
	isProcessing: boolean;
	onProcess: () => void;
	onReset: () => void;
	isModelLoading: boolean;
}

export function ImageEditor({
	originalImage,
	processedImage,
	isProcessing,
	onProcess,
	onReset,
	isModelLoading,
}: ImageEditorProps) {
	const [backgroundColor, setBackgroundColor] = useState("transparent");
	const [showOriginal, setShowOriginal] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const img = new Image();
		img.onload = () => {
			setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
		};
		img.src = processedImage || originalImage;
	}, [processedImage, originalImage]);

	const handleDownload = () => {
		if (!processedImage || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;

			if (backgroundColor !== "transparent") {
				ctx.fillStyle = backgroundColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			ctx.drawImage(img, 0, 0);

			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `background-removed-${Date.now()}.png`;
				link.click();
				URL.revokeObjectURL(url);
			}, "image/png");
		};
		img.src = processedImage;
	};

	const displayImage = showOriginal
		? originalImage
		: processedImage || originalImage;
	const showProcessButton = !processedImage && !isProcessing;

	return (
		<div className="space-y-6">
			<div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
				<div
					className={cn(
						"relative flex min-h-[400px] items-center justify-center p-8 transition-colors",
						backgroundColor === "transparent" ? "bg-checkered" : "",
					)}
					style={{
						backgroundColor:
							backgroundColor !== "transparent" ? backgroundColor : undefined,
					}}
				>
					{isProcessing ? (
						<div className="flex flex-col items-center gap-4">
							<div className="relative">
								<div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
								<Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
							</div>
							<div className="text-center">
								<p className="text-lg font-medium">Removing background...</p>
								<p className="text-sm text-muted-foreground">
									This may take a few moments
								</p>
							</div>
						</div>
					) : (
						<div className="relative max-h-[600px] w-full">
							<img
								src={displayImage}
								alt={showOriginal ? "Original" : "Processed"}
								className="mx-auto h-auto max-h-[600px] w-auto max-w-full rounded-lg object-contain"
							/>
							{processedImage && (
								<div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
									<Button
										size="sm"
										variant={showOriginal ? "outline" : "secondary"}
										onMouseDown={() => setShowOriginal(true)}
										onMouseUp={() => setShowOriginal(false)}
										onMouseLeave={() => setShowOriginal(false)}
										onTouchStart={() => setShowOriginal(true)}
										onTouchEnd={() => setShowOriginal(false)}
										className="shadow-lg backdrop-blur-sm"
									>
										{showOriginal ? "Showing Original" : "Hold to Compare"}
									</Button>
								</div>
							)}
						</div>
					)}
				</div>

				{!isProcessing && imageSize.width > 0 && (
					<div className="border-t border-border bg-muted/30 px-4 py-2">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>
								{imageSize.width} × {imageSize.height} px
							</span>
							<span>
								{processedImage ? "Background Removed" : "Original Image"}
							</span>
						</div>
					</div>
				)}
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="flex flex-col rounded-lg border border-border bg-card p-4">
					<BackgroundColorPicker
						selectedColor={backgroundColor}
						onColorChange={setBackgroundColor}
						disabled={!processedImage || isProcessing}
					/>
				</div>

				<div className="flex flex-col rounded-lg border border-border bg-card p-4">
					<h3 className="mb-3 text-sm font-medium">Actions</h3>
					<div className="flex flex-1 flex-col justify-center space-y-2">
						{showProcessButton && (
							<Button
								size="lg"
								onClick={onProcess}
								disabled={isModelLoading}
								className="w-full"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Remove Background
							</Button>
						)}
						{processedImage && (
							<Button size="lg" onClick={handleDownload} className="w-full">
								<Download className="mr-2 h-4 w-4" />
								Download Image
							</Button>
						)}
						<Button
							size="lg"
							variant="outline"
							onClick={onReset}
							className="w-full"
						>
							<Upload className="mr-2 h-4 w-4" />
							Upload New Image
						</Button>
					</div>
				</div>
			</div>

			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
}

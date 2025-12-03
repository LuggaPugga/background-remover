import { Download, Sparkles, Upload } from "lucide-solid";
import { createEffect, createSignal, Show } from "solid-js";
import { cn } from "@/lib/utils";
import { BackgroundColorPicker } from "./background-color-picker";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface ImageEditorProps {
	originalImage: string;
	processedImage: string | null;
	isProcessing: boolean;
	onProcess: () => void;
	onReset: () => void;
	isModelLoading: boolean;
}

type DownloadFormat = "png" | "webp" | "avif" | "gif";

const FORMAT_OPTIONS: DownloadFormat[] = ["png", "webp", "avif", "gif"];

export function ImageEditor(props: ImageEditorProps) {
	const [backgroundColor, setBackgroundColor] = createSignal("transparent");
	const [showOriginal, setShowOriginal] = createSignal(false);
	const [downloadFormat, setDownloadFormat] =
		createSignal<DownloadFormat>("png");
	let canvasRef: HTMLCanvasElement | undefined;
	const [imageSize, setImageSize] = createSignal({ width: 0, height: 0 });

	createEffect(() => {
		const imageSrc = props.processedImage || props.originalImage;
		if (!imageSrc) return;

		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
		};
	});

	const handleDownload = () => {
		if (!props.processedImage || !canvasRef) return;

		const canvas = canvasRef;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;

			if (backgroundColor() !== "transparent") {
				ctx.fillStyle = backgroundColor();
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			ctx.drawImage(img, 0, 0);

			const mimeTypes: Record<DownloadFormat, string> = {
				png: "image/png",
				webp: "image/webp",
				avif: "image/avif",
				gif: "image/gif",
			};

			const format = downloadFormat();
			const mimeType = mimeTypes[format];
			const quality = format === "webp" || format === "avif" ? 0.92 : undefined;

			canvas.toBlob(
				(blob) => {
					if (!blob) return;
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `background-removed-${Date.now()}.${format}`;
					link.click();
					URL.revokeObjectURL(url);
				},
				mimeType,
				quality,
			);
		};
		img.src = props.processedImage;
	};

	const displayImage = () =>
		showOriginal()
			? props.originalImage
			: props.processedImage || props.originalImage;

	return (
		<div class="space-y-6">
			<div class="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
				<div
					class={cn(
						"relative flex min-h-[400px] items-center justify-center p-8 transition-colors",
						backgroundColor() === "transparent" ? "bg-checkered" : "",
					)}
					style={{
						"background-color":
							backgroundColor() !== "transparent"
								? backgroundColor()
								: undefined,
					}}
				>
					<Show
						when={!props.isProcessing}
						fallback={
							<div class="flex flex-col items-center gap-4">
								<div class="relative">
									<div class="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
									<Sparkles class="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
								</div>
								<div class="text-center">
									<p class="text-lg font-medium">Removing background...</p>
									<p class="text-sm text-muted-foreground">
										This may take a few moments
									</p>
								</div>
							</div>
						}
					>
						<div class="relative max-h-[600px] w-full">
							<img
								src={displayImage()}
								alt={showOriginal() ? "Original" : "Processed"}
								class="mx-auto h-auto max-h-[600px] w-auto max-w-full rounded-lg object-contain"
							/>
							<Show when={props.processedImage}>
								<div class="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
									<Button
										size="sm"
										variant={showOriginal() ? "outline" : "secondary"}
										onMouseDown={() => setShowOriginal(true)}
										onMouseUp={() => setShowOriginal(false)}
										onMouseLeave={() => setShowOriginal(false)}
										onTouchStart={() => setShowOriginal(true)}
										onTouchEnd={() => setShowOriginal(false)}
										class="shadow-lg backdrop-blur-sm"
									>
										{showOriginal() ? "Showing Original" : "Hold to Compare"}
									</Button>
								</div>
							</Show>
						</div>
					</Show>
				</div>

				<Show when={!props.isProcessing && imageSize().width > 0}>
					<div class="border-t border-border bg-muted/30 px-4 py-2">
						<div class="flex items-center justify-between text-xs text-muted-foreground">
							<span>
								{imageSize().width} × {imageSize().height} px
							</span>
							<span>
								{props.processedImage ? "Background Removed" : "Original Image"}
							</span>
						</div>
					</div>
				</Show>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<div class="flex flex-col rounded-lg border border-border bg-card p-4">
					<BackgroundColorPicker
						selectedColor={backgroundColor()}
						onColorChange={setBackgroundColor}
						disabled={!props.processedImage || props.isProcessing}
					/>
				</div>

				<div class="flex flex-col rounded-lg border border-border bg-card p-4">
					<h3 class="mb-3 text-sm font-medium">Actions</h3>
					<div class="flex flex-1 flex-col justify-center space-y-2">
						<Show when={!props.processedImage && !props.isProcessing}>
							<Button
								size="lg"
								onClick={props.onProcess}
								disabled={props.isModelLoading}
								class="w-full"
							>
								<Sparkles class="mr-2 h-4 w-4" />
								Remove Background
							</Button>
						</Show>
						<Show when={props.processedImage}>
							<div class="flex gap-2">
								<Select<DownloadFormat>
									value={downloadFormat()}
									onChange={(value) => {
										if (value !== null) {
											setDownloadFormat(value);
										}
									}}
									options={FORMAT_OPTIONS}
									optionValue={(v) => v}
									optionTextValue={(v) => v.toUpperCase()}
									itemComponent={(itemProps) => (
										<SelectItem item={itemProps.item}>
											{itemProps.item.rawValue.toUpperCase()}
										</SelectItem>
									)}
								>
									<SelectTrigger class="h-11 w-full">
										<SelectValue<DownloadFormat>>
											{() => downloadFormat().toUpperCase()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />
								</Select>
								<Button size="lg" onClick={handleDownload} class="shrink-0">
									<Download class="mr-2 h-4 w-4" />
									Download
								</Button>
							</div>
						</Show>
						<Button
							size="lg"
							variant="outline"
							onClick={props.onReset}
							class="w-full"
						>
							<Upload class="mr-2 h-4 w-4" />
							Upload New Image
						</Button>
					</div>
				</div>
			</div>

			<canvas ref={canvasRef} class="hidden" />
		</div>
	);
}

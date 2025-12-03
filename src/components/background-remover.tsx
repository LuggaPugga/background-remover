import { createSignal, onCleanup, onMount, Show } from "solid-js";
import {
	clearProgressCallback,
	getModelInfo,
	initializeModel,
	MODELS,
	processImage as processImageWithModel,
	setProgressCallback,
} from "@/lib/background-removal";
import { Header } from "./header";
import { HeroSection } from "./hero-section";
import { ImageEditor } from "./image-editor";
import { ModelLoadingIndicator } from "./model-loading-indicator";
import { ModelSwitcher } from "./model-switcher";
import { UploadDropzone } from "./upload-dropzone";

export function BackgroundRemover() {
	const [originalImage, setOriginalImage] = createSignal<string | null>(null);
	const [processedImage, setProcessedImage] = createSignal<string | null>(null);
	const [isDragging, setIsDragging] = createSignal(false);
	const [isProcessing, setIsProcessing] = createSignal(false);
	const [isModelLoading, setIsModelLoading] = createSignal(true);
	const [isModelSwitching, setIsModelSwitching] = createSignal(false);
	const [loadingProgress, setLoadingProgress] = createSignal(0);
	const [loadingStatus, setLoadingStatus] = createSignal("Initializing...");
	const [loadingModelName, setLoadingModelName] = createSignal<
		string | undefined
	>();
	const [error, setError] = createSignal<string | null>(null);
	const [originalFile, setOriginalFile] = createSignal<File | null>(null);
	let fileInputRef: HTMLInputElement | undefined;
	let loadingClearTimeoutId: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		const init = async () => {
			setProgressCallback((progress, status) => {
				setLoadingProgress(progress);
				setLoadingStatus(status);
			});

			try {
				setIsModelLoading(true);
				setLoadingProgress(0);
				setLoadingStatus("Initializing...");
				const modelInfo = getModelInfo();
				const modelConfig = MODELS.find(
					(m) => m.id === modelInfo.currentModelId,
				);
				setLoadingModelName(modelConfig?.name);

				const result = await initializeModel();
				console.log("[BackgroundRemover] Model initialized:", result);

				setLoadingProgress(1);
				setLoadingStatus("Model loaded");
			} catch (err) {
				console.error("[BackgroundRemover] Init error:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to initialize background removal model",
				);
			} finally {
				setIsModelLoading(false);
				scheduleClearLoadingState();
			}
		};

		init();
	});

	onCleanup(() => {
		clearProgressCallback();
		if (loadingClearTimeoutId) {
			clearTimeout(loadingClearTimeoutId);
		}
	});

	const scheduleClearLoadingState = () => {
		if (loadingClearTimeoutId) {
			clearTimeout(loadingClearTimeoutId);
		}
		loadingClearTimeoutId = setTimeout(() => {
			if (!isModelLoading() && !isModelSwitching()) {
				setLoadingStatus("");
				setLoadingProgress(0);
				setLoadingModelName(undefined);
			}
			loadingClearTimeoutId = undefined;
		}, 1000);
	};

	const handleFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			setOriginalImage(e.target?.result as string);
			setProcessedImage(null);
			setOriginalFile(file);
			setError(null);
		};
		reader.readAsDataURL(file);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer?.files[0];
		if (file?.type.startsWith("image/")) {
			handleFile(file);
		}
	};

	const handleDropZoneKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			fileInputRef?.click();
		}
	};

	const processImage = async () => {
		const file = originalFile();
		const image = originalImage();

		if (!file || !image || isModelLoading()) {
			if (isModelLoading()) {
				setError("Model is still loading. Please wait...");
			}
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const processedFile = await processImageWithModel(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setProcessedImage(e.target?.result as string);
			};
			reader.readAsDataURL(processedFile);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to process image. Please try again.",
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const reset = () => {
		setOriginalImage(null);
		setProcessedImage(null);
		setOriginalFile(null);
		setError(null);
		if (fileInputRef) {
			fileInputRef.value = "";
		}
	};

	return (
		<div class="flex min-h-screen flex-col">
			<Header />
			<main class="flex flex-1 flex-col items-center justify-center px-6 py-12">
				<div class="w-full max-w-5xl">
					<Show when={!originalImage()}>
						<HeroSection />
					</Show>
					<Show when={error()}>
						<div class="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
							{error()}
						</div>
					</Show>
					<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div class="flex-1">
							<ModelLoadingIndicator
								isLoading={isModelLoading() || isModelSwitching()}
								progress={loadingProgress()}
								status={loadingStatus()}
								modelName={loadingModelName()}
							/>
						</div>
						<div class="shrink-0">
							<ModelSwitcher
								disabled={isModelLoading() || isProcessing()}
								onLoadingChange={(isLoading, progress, status) => {
									setIsModelSwitching(isLoading);
									if (isLoading) {
										setLoadingProgress(progress || 0);
										setLoadingStatus(status || "Switching model...");
										const modelInfo = getModelInfo();
										const modelConfig = MODELS.find(
											(m) => m.id === modelInfo.currentModelId,
										);
										setLoadingModelName(modelConfig?.name);
									} else {
										setLoadingProgress(1);
										setLoadingStatus("Model loaded");
										setProgressCallback((prog, stat) => {
											setLoadingProgress(prog);
											setLoadingStatus(stat);
										});
										scheduleClearLoadingState();
									}
								}}
							/>
						</div>
					</div>
					<Show
						when={originalImage()}
						fallback={
							<UploadDropzone
								ref={(el) => {
									fileInputRef = el;
								}}
								onFileSelect={handleFile}
								isDragging={isDragging()}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onKeyDown={handleDropZoneKeyDown}
								disabled={isModelLoading()}
							/>
						}
					>
						{(img) => (
							<ImageEditor
								originalImage={img()}
								processedImage={processedImage()}
								isProcessing={isProcessing()}
								onProcess={processImage}
								onReset={reset}
								isModelLoading={isModelLoading()}
							/>
						)}
					</Show>
				</div>
			</main>
		</div>
	);
}

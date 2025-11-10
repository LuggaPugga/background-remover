import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [processedImage, setProcessedImage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isModelLoading, setIsModelLoading] = useState(true);
	const [isModelSwitching, setIsModelSwitching] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingStatus, setLoadingStatus] = useState("Initializing...");
	const [loadingModelName, setLoadingModelName] = useState<
		string | undefined
	>();
	const [error, setError] = useState<string | null>(null);
	const [originalFile, setOriginalFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setProgressCallback((progress, status) => {
			setLoadingProgress(progress);
			setLoadingStatus(status);
		});

		return () => {
			clearProgressCallback();
		};
	}, []);

	useEffect(() => {
		const initModel = async () => {
			try {
				setIsModelLoading(true);
				setLoadingProgress(0);
				setLoadingStatus("Initializing...");
				const modelInfo = getModelInfo();
				const modelConfig = MODELS.find(
					(m) => m.id === modelInfo.currentModelId,
				);
				setLoadingModelName(modelConfig?.name);
				await initializeModel();
				setIsModelLoading(false);
				setLoadingProgress(1);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to initialize background removal model",
				);
				setIsModelLoading(false);
			}
		};
		initModel();
	}, []);

	const handleFile = useCallback((file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			setOriginalImage(e.target?.result as string);
			setProcessedImage(null);
			setOriginalFile(file);
			setError(null);
		};
		reader.readAsDataURL(file);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);

			const file = e.dataTransfer.files[0];
			if (file?.type.startsWith("image/")) {
				handleFile(file);
			}
		},
		[handleFile],
	);

	const handleDropZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			fileInputRef.current?.click();
		}
	}, []);

	const processImage = async () => {
		if (!originalFile || !originalImage) return;

		if (isModelLoading) {
			setError("Model is still loading. Please wait...");
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const processedFile = await processImageWithModel(originalFile);
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
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Header />

			<main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
				<div className="w-full max-w-5xl">
					{!originalImage && <HeroSection />}

					{error && (
						<div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
							{error}
						</div>
					)}

					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex-1">
							<ModelLoadingIndicator
								isLoading={isModelLoading || isModelSwitching}
								progress={loadingProgress}
								status={loadingStatus}
								modelName={loadingModelName}
							/>
						</div>
						<div className="shrink-0">
							<ModelSwitcher
								disabled={isModelLoading || isProcessing}
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
										// Restore the main progress callback after switching
										setProgressCallback((prog, stat) => {
											setLoadingProgress(prog);
											setLoadingStatus(stat);
										});
									}
								}}
							/>
						</div>
					</div>

					{!originalImage ? (
						<UploadDropzone
							ref={fileInputRef}
							onFileSelect={handleFile}
							isDragging={isDragging}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onKeyDown={handleDropZoneKeyDown}
							disabled={isModelLoading}
						/>
					) : (
						<ImageEditor
							originalImage={originalImage}
							processedImage={processedImage}
							isProcessing={isProcessing}
							onProcess={processImage}
							onReset={reset}
							isModelLoading={isModelLoading}
						/>
					)}
				</div>
			</main>
		</div>
	);
}

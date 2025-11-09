import { Download, Sparkles, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	initializeModel,
	processImage as processImageWithModel,
} from "@/lib/background-removal";
import { Header } from "./header";
import { HeroSection } from "./hero-section";
import { ImageComparison } from "./image-comparison";
import { ModelLoadingIndicator } from "./model-loading-indicator";
import { UploadDropzone } from "./upload-dropzone";

export function BackgroundRemover() {
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [processedImage, setProcessedImage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isModelLoading, setIsModelLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [originalFile, setOriginalFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const initModel = async () => {
			try {
				setIsModelLoading(true);
				await initializeModel();
				setIsModelLoading(false);
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

	const downloadImage = () => {
		if (!processedImage) return;

		const link = document.createElement("a");
		link.href = processedImage;
		link.download = "background-removed.png";
		link.click();
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

					<ModelLoadingIndicator isLoading={isModelLoading} />

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
						<div className="space-y-6">
							<ImageComparison
								originalImage={originalImage}
								processedImage={processedImage}
								isProcessing={isProcessing}
							/>

							<div className="flex flex-wrap items-center justify-center gap-3">
								{!processedImage && !isProcessing && (
									<Button
										size="lg"
										onClick={processImage}
										disabled={isModelLoading}
									>
										<Sparkles className="mr-2 h-4 w-4" />
										Remove Background
									</Button>
								)}
								{processedImage && (
									<Button size="lg" onClick={downloadImage}>
										<Download className="mr-2 h-4 w-4" />
										Download Image
									</Button>
								)}
								<Button size="lg" variant="outline" onClick={reset}>
									<X className="mr-2 h-4 w-4" />
									Start Over
								</Button>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

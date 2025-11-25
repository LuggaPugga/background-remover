import {
	AutoModel,
	AutoProcessor,
	env,
	type PreTrainedModel,
	type Processor,
	RawImage,
} from "@huggingface/transformers";
import { track } from "@vercel/analytics/react";

export interface ProcessorConfig {
	revision?: string;
	config?: Record<string, unknown>;
}

export interface ModelConfig {
	id: string;
	name: string;
	requiresWebGPU: boolean;
	description: string;
	device?: "webgpu" | "wasm";
	processorConfig?: ProcessorConfig;
	isDefault?: boolean;
	dtype?: "fp32" | "fp16" | "int8";
}

const PROCESSOR_CONFIG_BASE = {
	do_normalize: true,
	do_rescale: true,
	do_resize: true,
	image_mean: [0.5, 0.5, 0.5] as [number, number, number],
	feature_extractor_type: "ImageFeatureExtractor" as const,
	resample: 2,
	rescale_factor: 0.00392156862745098,
	size: { width: 1024, height: 1024 },
};

export const MODELS: ModelConfig[] = [
	{
		id: "briaai/RMBG-1.4",
		name: "RMBG-1.4",
		requiresWebGPU: false,
		description: "Cross-browser compatible model",
		isDefault: true,
		processorConfig: {
			revision: "main",
			config: {
				...PROCESSOR_CONFIG_BASE,
				do_pad: true,
				image_std: [0.5, 0.5, 0.5] as [number, number, number],
			},
		},
	},
	{
		id: "Xenova/modnet",
		name: "MODNet (WebGPU)",
		requiresWebGPU: true,
		description: "Fast WebGPU-accelerated model",
		device: "webgpu",
	},
];

interface ModelState {
	model: PreTrainedModel | null;
	processor: Processor | null;
	isWebGPUSupported: boolean;
	currentModelId: string;
	isIOS: boolean;
}

interface ModelInfo {
	currentModelId: string;
	isWebGPUSupported: boolean;
	isIOS: boolean;
}

interface GPU extends Navigator {
	gpu?: {
		requestAdapter(): Promise<GPUAdapter | null>;
	};
}

interface GPUAdapter {
	readonly features: ReadonlySet<string>;
}

const detectIOS = (): boolean => {
	const platform = navigator.platform;
	const userAgent = navigator.userAgent;

	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
		].includes(platform) ||
		(userAgent.includes("Mac") && "ontouchend" in document)
	);
};

export async function checkWebGPUAvailability(): Promise<boolean> {
	const gpu = (navigator as GPU).gpu;
	if (!gpu) {
		return false;
	}

	try {
		const adapter = await gpu.requestAdapter();
		return adapter !== null;
	} catch {
		return false;
	}
}

const getDefaultModel = (): ModelConfig => {
	return MODELS.find((m) => m.isDefault) || MODELS[0];
};

const state: ModelState = {
	model: null,
	processor: null,
	isWebGPUSupported: false,
	currentModelId: getDefaultModel().id,
	isIOS: detectIOS(),
};

let progressCallback: ((progress: number, status: string) => void) | null =
	null;

export function setProgressCallback(
	callback: (progress: number, status: string) => void,
): void {
	progressCallback = callback;
}

export function clearProgressCallback(): void {
	progressCallback = null;
}

const configureEnvironment = (useProxy: boolean): void => {
	env.allowLocalModels = false;
	if (env.backends?.onnx?.wasm) {
		env.backends.onnx.wasm.proxy = useProxy;
	}
};

const loadModel = async (modelConfig: ModelConfig): Promise<void> => {
	if (modelConfig.requiresWebGPU && modelConfig.device === "webgpu") {
		const gpu = (navigator as GPU).gpu;
		if (!gpu) {
			throw new Error("WebGPU is required but not available");
		}

		const adapter = await gpu.requestAdapter();
		if (!adapter) {
			throw new Error("WebGPU adapter not available");
		}

		progressCallback?.(0.1, "Initializing WebGPU...");
		configureEnvironment(true);
		await new Promise((resolve) => setTimeout(resolve, 200));

		progressCallback?.(0.3, `Loading ${modelConfig.name} model...`);
		state.model = await AutoModel.from_pretrained(modelConfig.id, {
			device: "webgpu",
			progress_callback: (progressInfo) => {
				const progress =
					typeof progressInfo === "number"
						? progressInfo
						: "progress" in progressInfo
							? progressInfo.progress
							: 0;
				progressCallback?.(
					0.3 + progress * 0.5,
					`Loading ${modelConfig.name} model... ${Math.round(progress * 100)}%`,
				);
			},
		});

		progressCallback?.(0.8, `Loading ${modelConfig.name} processor...`);
		state.processor = await AutoProcessor.from_pretrained(modelConfig.id);
		state.isWebGPUSupported = true;
		progressCallback?.(1.0, "Model loaded");
	} else {
		configureEnvironment(true);

		const modelOptions: Record<string, unknown> = {};
		if (modelConfig.dtype) {
			modelOptions.dtype = modelConfig.dtype;
		}

		progressCallback?.(0.2, `Loading ${modelConfig.name} model...`);
		state.model = await AutoModel.from_pretrained(
			modelConfig.id,
			Object.keys(modelOptions).length > 0
				? {
						...modelOptions,
						progress_callback: (progressInfo) => {
							const progress =
								typeof progressInfo === "number"
									? progressInfo
									: "progress" in progressInfo
										? progressInfo.progress
										: 0;
							progressCallback?.(
								0.2 + progress * 0.5,
								`Loading ${modelConfig.name} model... ${Math.round(progress * 100)}%`,
							);
						},
					}
				: {
						progress_callback: (progressInfo) => {
							const progress =
								typeof progressInfo === "number"
									? progressInfo
									: "progress" in progressInfo
										? progressInfo.progress
										: 0;
							progressCallback?.(
								0.2 + progress * 0.5,
								`Loading ${modelConfig.name} model... ${Math.round(progress * 100)}%`,
							);
						},
					},
		);

		progressCallback?.(0.7, `Loading ${modelConfig.name} processor...`);
		if (modelConfig.processorConfig) {
			state.processor = await AutoProcessor.from_pretrained(
				modelConfig.id,
				modelConfig.processorConfig,
			);
		} else {
			state.processor = await AutoProcessor.from_pretrained(modelConfig.id);
		}
		progressCallback?.(1.0, "Model loaded");
	}
};

const loadIOSModel = async (): Promise<void> => {
	const defaultModel = getDefaultModel();
	configureEnvironment(true);

	progressCallback?.(0.2, `Loading ${defaultModel.name} model...`);
	state.model = await AutoModel.from_pretrained(defaultModel.id, {
		progress_callback: (progressInfo) => {
			const progress =
				typeof progressInfo === "number"
					? progressInfo
					: "progress" in progressInfo
						? progressInfo.progress
						: 0;
			progressCallback?.(
				0.2 + progress * 0.5,
				`Loading ${defaultModel.name} model... ${Math.round(progress * 100)}%`,
			);
		},
	});

	progressCallback?.(0.7, `Loading ${defaultModel.name} processor...`);
	state.processor = await AutoProcessor.from_pretrained(defaultModel.id, {
		config: {
			...PROCESSOR_CONFIG_BASE,
			do_pad: false,
			image_std: [1, 1, 1] as [number, number, number],
		},
	});
	progressCallback?.(1.0, "Model loaded");
};

export async function initializeModel(forceModelId?: string): Promise<boolean> {
	try {
		if (state.isIOS) {
			await loadIOSModel();
			state.currentModelId = getDefaultModel().id;
			return true;
		}

		const selectedModelId = forceModelId || getDefaultModel().id;
		const modelConfig = MODELS.find((m) => m.id === selectedModelId);

		if (!modelConfig) {
			throw new Error(`Model ${selectedModelId} not found`);
		}

		if (modelConfig.requiresWebGPU && modelConfig.device === "webgpu") {
			const defaultModel = getDefaultModel();
			if (!state.model || state.currentModelId !== defaultModel.id) {
				const defaultConfig = MODELS.find((m) => m.id === defaultModel.id);
				if (defaultConfig) {
					await loadModel(defaultConfig);
					try {
						const dummyProcessor = state.processor;
						if (dummyProcessor) {
							const dummyCanvas = document.createElement("canvas");
							dummyCanvas.width = 1;
							dummyCanvas.height = 1;
							const dummyImage = await RawImage.fromURL(
								dummyCanvas.toDataURL(),
							);
							await dummyProcessor(dummyImage);
						}
					} catch {}
				}
			}
		}

		await loadModel(modelConfig);
		state.currentModelId = selectedModelId;

		if (!state.model || !state.processor) {
			throw new Error("Failed to initialize model or processor");
		}

		return true;
	} catch (error) {
		console.error("Error initializing model:", error);
		const defaultModel = getDefaultModel();
		if (forceModelId && forceModelId !== defaultModel.id) {
			return initializeModel(defaultModel.id);
		}
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to initialize background removal model",
		);
	}
}

export function getModelInfo(): ModelInfo {
	return {
		currentModelId: state.currentModelId,
		isWebGPUSupported: Boolean((navigator as GPU).gpu),
		isIOS: state.isIOS,
	};
}

const applyMaskToImage = (
	canvas: HTMLCanvasElement,
	image: RawImage,
	maskData: Uint8Array | Uint8ClampedArray,
): void => {
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Could not get 2d context");
	}

	ctx.drawImage(image.toCanvas(), 0, 0);

	const pixelData = ctx.getImageData(0, 0, image.width, image.height);
	for (let i = 0; i < maskData.length; i++) {
		pixelData.data[4 * i + 3] = maskData[i];
	}
	ctx.putImageData(pixelData, 0, 0);
};

const createProcessedFile = (blob: Blob, originalFileName: string): File => {
	const [fileName] = originalFileName.split(".");
	return new File([blob], `${fileName}-bg-removed.png`, {
		type: "image/png",
	});
};

export async function processImage(image: File): Promise<File> {
	if (!state.model || !state.processor) {
		throw new Error("Model not initialized. Call initializeModel() first.");
	}

	const modelConfig = MODELS.find((m) => m.id === state.currentModelId);
	const modelName = modelConfig?.name || state.currentModelId;
	console.log(
		`[BackgroundRemoval] Processing image with model: ${modelName} (${state.currentModelId})`,
	);

	const imageUrl = URL.createObjectURL(image);
	const img = await RawImage.fromURL(imageUrl);

	try {
		track("processImage", {
			model: modelName,
		});

		const { pixel_values } = await state.processor(img);
		const { output } = await state.model({ input: pixel_values });

		const maskTensor = output[0].mul(255).to("uint8");
		const maskImage = RawImage.fromTensor(maskTensor);
		const resizedMask = await maskImage.resize(img.width, img.height);
		const maskData = resizedMask.data;

		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;

		applyMaskToImage(canvas, img, maskData);

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to create blob"));
				}
			}, "image/png");
		});

		console.log(
			`[BackgroundRemoval] Image processing complete with model: ${modelName}`,
		);
		return createProcessedFile(blob, image.name);
	} catch (error) {
		console.error(
			`[BackgroundRemoval] Error processing image with model ${modelName}:`,
			error,
		);
		throw new Error(
			error instanceof Error ? error.message : "Failed to process image",
		);
	} finally {
		URL.revokeObjectURL(imageUrl);
	}
}

export async function processImages(images: File[]): Promise<File[]> {
	const processedFiles: File[] = [];

	for (const image of images) {
		try {
			const processedFile = await processImage(image);
			processedFiles.push(processedFile);
		} catch (error) {
			console.error(`Error processing image ${image.name}:`, error);
		}
	}

	return processedFiles;
}

import {
	AutoModel,
	AutoProcessor,
	env,
	type PreTrainedModel,
	type Processor,
	RawImage,
} from "@huggingface/transformers";

const WEBGPU_MODEL_ID = "Xenova/modnet";
const FALLBACK_MODEL_ID = "briaai/RMBG-1.4";
const PROCESSOR_CONFIG = {
	do_normalize: true,
	do_rescale: true,
	do_resize: true,
	image_mean: [0.5, 0.5, 0.5] as [number, number, number],
	feature_extractor_type: "ImageFeatureExtractor" as const,
	resample: 2,
	rescale_factor: 0.00392156862745098,
	size: { width: 1024, height: 1024 },
};

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

const state: ModelState = {
	model: null,
	processor: null,
	isWebGPUSupported: false,
	currentModelId: FALLBACK_MODEL_ID,
	isIOS: detectIOS(),
};

const configureEnvironment = (useProxy: boolean): void => {
	env.allowLocalModels = false;
	if (env.backends?.onnx?.wasm) {
		env.backends.onnx.wasm.proxy = useProxy;
	}
};

const loadFallbackModel = async (): Promise<void> => {
	configureEnvironment(true);

	state.model = await AutoModel.from_pretrained(FALLBACK_MODEL_ID, {
		progress_callback: (progressInfo) => {
			const progress =
				typeof progressInfo === "number"
					? progressInfo
					: "progress" in progressInfo
						? progressInfo.progress
						: 0;
			console.log(`Loading model: ${Math.round(progress * 100)}%`);
		},
	});

	state.processor = await AutoProcessor.from_pretrained(FALLBACK_MODEL_ID, {
		revision: "main",
		config: {
			...PROCESSOR_CONFIG,
			do_pad: true,
			image_std: [0.5, 0.5, 0.5] as [number, number, number],
		},
	});
};

const loadIOSModel = async (): Promise<void> => {
	configureEnvironment(true);

	state.model = await AutoModel.from_pretrained(FALLBACK_MODEL_ID);

	state.processor = await AutoProcessor.from_pretrained(FALLBACK_MODEL_ID, {
		config: {
			...PROCESSOR_CONFIG,
			do_pad: false,
			image_std: [1, 1, 1] as [number, number, number],
		},
	});
};

const initializeWebGPU = async (): Promise<boolean> => {
	const gpu = (navigator as GPU).gpu;
	if (!gpu) {
		return false;
	}

	try {
		const adapter = await gpu.requestAdapter();
		if (!adapter) {
			return false;
		}

		configureEnvironment(false);
		await new Promise((resolve) => setTimeout(resolve, 100));

		state.model = await AutoModel.from_pretrained(WEBGPU_MODEL_ID, {
			device: "webgpu",
		});
		state.processor = await AutoProcessor.from_pretrained(WEBGPU_MODEL_ID);
		state.isWebGPUSupported = true;
		return true;
	} catch (error) {
		console.error("WebGPU initialization failed:", error);
		return false;
	}
};

export async function initializeModel(forceModelId?: string): Promise<boolean> {
	try {
		if (state.isIOS) {
			console.log("iOS detected, using RMBG-1.4 model");
			await loadIOSModel();
			state.currentModelId = FALLBACK_MODEL_ID;
			return true;
		}

		const selectedModelId = forceModelId || FALLBACK_MODEL_ID;

		if (selectedModelId === WEBGPU_MODEL_ID) {
			const webGPUSuccess = await initializeWebGPU();
			if (webGPUSuccess) {
				state.currentModelId = WEBGPU_MODEL_ID;
				return true;
			}
		}

		await loadFallbackModel();
		state.currentModelId = FALLBACK_MODEL_ID;

		if (!state.model || !state.processor) {
			throw new Error("Failed to initialize model or processor");
		}

		return true;
	} catch (error) {
		console.error("Error initializing model:", error);
		if (forceModelId === WEBGPU_MODEL_ID) {
			console.log("Falling back to cross-browser model...");
			return initializeModel(FALLBACK_MODEL_ID);
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

	const imageUrl = URL.createObjectURL(image);
	const img = await RawImage.fromURL(imageUrl);

	try {
		const { pixel_values } = await state.processor(img);
		const { output } = await state.model({ input: pixel_values });

		const maskTensor = output[0].mul(255).to("uint8");
		const maskImage = await RawImage.fromTensor(maskTensor);
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

		return createProcessedFile(blob, image.name);
	} catch (error) {
		console.error("Error processing image:", error);
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

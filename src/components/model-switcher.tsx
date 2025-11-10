import { useEffect, useState } from "react";
import {
	checkWebGPUAvailability,
	clearProgressCallback,
	getModelInfo,
	initializeModel,
	MODELS,
	type ModelConfig,
	setProgressCallback,
} from "@/lib/background-removal";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface ModelSwitcherProps {
	onModelChange?: (modelId: string) => void;
	disabled?: boolean;
	onLoadingChange?: (
		isLoading: boolean,
		progress?: number,
		status?: string,
	) => void;
}

export function ModelSwitcher({
	onModelChange,
	disabled = false,
	onLoadingChange,
}: ModelSwitcherProps) {
	const [selectedModel, setSelectedModel] = useState<string>(
		getModelInfo().currentModelId,
	);
	const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingStatus, setLoadingStatus] = useState("");

	useEffect(() => {
		const checkWebGPU = async () => {
			const available = await checkWebGPUAvailability();
			setIsWebGPUAvailable(available);
		};
		checkWebGPU();
	}, []);

	useEffect(() => {
		if (isLoading) {
			const callback = (progress: number, status: string) => {
				setLoadingProgress(progress);
				setLoadingStatus(status);
				onLoadingChange?.(true, progress, status);
			};
			setProgressCallback(callback);
			return () => {
				clearProgressCallback();
			};
		} else {
			onLoadingChange?.(false);
		}
	}, [isLoading, onLoadingChange]);

	const handleModelChange = async (modelId: string) => {
		if (disabled || isLoading) return;

		setIsLoading(true);
		setLoadingProgress(0);
		setLoadingStatus("Switching model...");
		try {
			await initializeModel(modelId);
			setSelectedModel(modelId);
			onModelChange?.(modelId);
		} catch (error) {
			console.error("Failed to switch model:", error);
		} finally {
			setIsLoading(false);
			setLoadingProgress(1);
		}
	};

	const getAvailableModels = (): ModelConfig[] => {
		return MODELS.filter((model) => !model.requiresWebGPU || isWebGPUAvailable);
	};

	const availableModels = getAvailableModels();
	const currentModel = MODELS.find((m) => m.id === selectedModel);

	return (
		<div className="relative">
			<Select
				value={selectedModel}
				onValueChange={handleModelChange}
				disabled={disabled || isLoading}
			>
				<SelectTrigger
					id="model-select"
					className={cn("w-[240px] transition-all", isLoading && "opacity-70")}
				>
					<SelectValue>
						<div className="flex items-center gap-2">
							{isLoading && (
								<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
							)}
							<span className="truncate">
								{isLoading && loadingStatus
									? loadingStatus
									: currentModel?.name || "Select model"}
							</span>
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{availableModels.map((model) => (
						<SelectItem
							key={model.id}
							value={model.id}
							disabled={model.requiresWebGPU && !isWebGPUAvailable}
						>
							<div className="flex flex-col gap-0.5 py-0.5">
								<div className="flex items-center gap-2">
									<span className="font-medium">{model.name}</span>
									{model.requiresWebGPU && (
										<span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
											WebGPU
										</span>
									)}
								</div>
								<span className="text-xs text-muted-foreground">
									{model.description}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{isLoading && (
				<div className="absolute -bottom-6 left-0 right-0 h-1 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary transition-all duration-300 ease-out"
						style={{
							width: `${Math.max(0, Math.min(100, loadingProgress * 100))}%`,
						}}
					/>
				</div>
			)}
		</div>
	);
}

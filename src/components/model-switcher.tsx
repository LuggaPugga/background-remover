import { createSignal, onCleanup, onMount, Show } from "solid-js";
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

const getDefaultModelId = () =>
	MODELS.find((m) => m.isDefault)?.id || MODELS[0].id;

export function ModelSwitcher(props: ModelSwitcherProps) {
	const [selectedModel, setSelectedModel] = createSignal<string>(
		getDefaultModelId(),
	);
	const [isWebGPUAvailable, setIsWebGPUAvailable] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(false);
	const [loadingProgress, setLoadingProgress] = createSignal(0);
	const [loadingStatus, setLoadingStatus] = createSignal("");
	const [isMounted, setIsMounted] = createSignal(false);

	onMount(async () => {
		setIsMounted(true);
		const modelInfo = getModelInfo();
		setSelectedModel(modelInfo.currentModelId);
		const available = await checkWebGPUAvailability();
		setIsWebGPUAvailable(available);
	});

	onCleanup(() => {
		setIsMounted(false);
	});

	const handleModelChange = async (model: ModelConfig | null) => {
		if (!model || props.disabled || isLoading()) return;

		const modelId = model.id;
		if (modelId === selectedModel()) return;

		setIsLoading(true);
		setLoadingProgress(0);
		setLoadingStatus("Switching model...");

		setProgressCallback((progress, status) => {
			setLoadingProgress(progress);
			setLoadingStatus(status);
			props.onLoadingChange?.(true, progress, status);
		});

		try {
			await initializeModel(modelId);
			setSelectedModel(modelId);
			props.onModelChange?.(modelId);
		} catch (error) {
			console.error("Failed to switch model:", error);
		} finally {
			setIsLoading(false);
			setLoadingProgress(1);
			props.onLoadingChange?.(false);
			clearProgressCallback();
		}
	};

	const getAvailableModels = (): ModelConfig[] => {
		return MODELS.filter(
			(model) => !model.requiresWebGPU || isWebGPUAvailable(),
		);
	};

	const currentModel = () => MODELS.find((m) => m.id === selectedModel());

	return (
		<Show when={isMounted()}>
			<div class="relative">
				<Select<ModelConfig>
					value={currentModel()}
					onChange={handleModelChange}
					disabled={props.disabled || isLoading()}
					options={getAvailableModels()}
					optionValue="id"
					optionTextValue="name"
					itemComponent={(itemProps) => (
						<SelectItem
							item={itemProps.item}
							disabled={
								itemProps.item.rawValue.requiresWebGPU && !isWebGPUAvailable()
							}
						>
							<div class="flex flex-col gap-0.5 py-0.5">
								<div class="flex items-center gap-2">
									<span class="font-medium">
										{itemProps.item.rawValue.name}
									</span>
									<Show when={itemProps.item.rawValue.requiresWebGPU}>
										<span class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
											WebGPU
										</span>
									</Show>
								</div>
								<span class="text-xs text-muted-foreground">
									{itemProps.item.rawValue.description}
								</span>
							</div>
						</SelectItem>
					)}
				>
					<SelectTrigger
						id="model-select"
						class={cn("w-[240px] transition-all", isLoading() && "opacity-70")}
					>
						<SelectValue<ModelConfig>>
							{(state) => (
								<div class="flex items-center gap-2">
									<Show when={isLoading()}>
										<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
									</Show>
									<span class="truncate">
										{isLoading() && loadingStatus()
											? loadingStatus()
											: state.selectedOption()?.name || "Select model"}
									</span>
								</div>
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Show when={isLoading()}>
					<div class="absolute -bottom-6 left-0 right-0 h-1 overflow-hidden rounded-full bg-muted">
						<div
							class="h-full bg-primary transition-all duration-300 ease-out"
							style={{
								width: `${Math.max(0, Math.min(100, loadingProgress() * 100))}%`,
							}}
						/>
					</div>
				</Show>
			</div>
		</Show>
	);
}

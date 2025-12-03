import { Check, Pipette } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface BackgroundColorPickerProps {
	selectedColor: string;
	onColorChange: (color: string) => void;
	disabled?: boolean;
}

const PRESET_COLORS = [
	{ name: "Transparent", value: "transparent", pattern: true },
	{ name: "White", value: "#FFFFFF" },
	{ name: "Black", value: "#000000" },
	{ name: "Red", value: "#EF4444" },
	{ name: "Blue", value: "#3B82F6" },
	{ name: "Green", value: "#10B981" },
	{ name: "Yellow", value: "#F59E0B" },
	{ name: "Purple", value: "#8B5CF6" },
	{ name: "Pink", value: "#EC4899" },
	{ name: "Gray", value: "#6B7280" },
];

export function BackgroundColorPicker(props: BackgroundColorPickerProps) {
	const [customColor, setCustomColor] = createSignal("#FFFFFF");
	const [showCustomPicker, setShowCustomPicker] = createSignal(false);

	const handleCustomColorChange = (color: string) => {
		setCustomColor(color);
		props.onColorChange(color);
	};

	return (
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Background Color</span>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setShowCustomPicker(!showCustomPicker())}
					disabled={props.disabled}
					class="h-8 gap-1.5"
				>
					<Pipette class="h-3.5 w-3.5" />
					Custom
				</Button>
			</div>

			<div class="grid grid-cols-5 gap-2">
				<For each={PRESET_COLORS}>
					{(color) => (
						<button
							type="button"
							onClick={() => props.onColorChange(color.value)}
							disabled={props.disabled}
							class={cn(
								"group relative h-12 rounded-lg border-2 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
								props.selectedColor === color.value
									? "border-primary ring-2 ring-primary/20"
									: "border-border hover:border-primary/50",
							)}
							title={color.name}
						>
							<div
								class="h-full w-full rounded-md"
								style={{
									"background-color": color.pattern ? undefined : color.value,
									"background-image": color.pattern
										? "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)"
										: undefined,
									"background-size": color.pattern ? "8px 8px" : undefined,
									"background-position": color.pattern
										? "0 0, 0 4px, 4px -4px, -4px 0px"
										: undefined,
								}}
							/>
							<Show when={props.selectedColor === color.value}>
								<div class="absolute inset-0 flex items-center justify-center">
									<div class="rounded-full bg-primary p-1">
										<Check class="h-3 w-3 text-primary-foreground" />
									</div>
								</div>
							</Show>
						</button>
					)}
				</For>
			</div>

			<Show when={showCustomPicker()}>
				<div class="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
					<input
						type="color"
						value={customColor()}
						onInput={(e) => handleCustomColorChange(e.currentTarget.value)}
						disabled={props.disabled}
						class="h-10 w-20 cursor-pointer rounded border border-border disabled:cursor-not-allowed disabled:opacity-50"
					/>
					<div class="flex-1">
						<input
							type="text"
							value={customColor()}
							onInput={(e) => handleCustomColorChange(e.currentTarget.value)}
							disabled={props.disabled}
							placeholder="#FFFFFF"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
				</div>
			</Show>
		</div>
	);
}

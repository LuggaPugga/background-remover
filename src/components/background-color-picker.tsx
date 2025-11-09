import { Check, Pipette } from "lucide-react";
import { useState } from "react";
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

export function BackgroundColorPicker({
	selectedColor,
	onColorChange,
	disabled = false,
}: BackgroundColorPickerProps) {
	const [customColor, setCustomColor] = useState("#FFFFFF");
	const [showCustomPicker, setShowCustomPicker] = useState(false);

	const handleCustomColorChange = (color: string) => {
		setCustomColor(color);
		onColorChange(color);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Background Color</span>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setShowCustomPicker(!showCustomPicker)}
					disabled={disabled}
					className="h-8 gap-1.5"
				>
					<Pipette className="h-3.5 w-3.5" />
					Custom
				</Button>
			</div>

			<div className="grid grid-cols-5 gap-2">
				{PRESET_COLORS.map((color) => (
					<button
						key={color.value}
						type="button"
						onClick={() => onColorChange(color.value)}
						disabled={disabled}
						className={cn(
							"group relative h-12 rounded-lg border-2 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
							selectedColor === color.value
								? "border-primary ring-2 ring-primary/20"
								: "border-border hover:border-primary/50",
						)}
						title={color.name}
					>
						<div
							className="h-full w-full rounded-md"
							style={{
								backgroundColor: color.pattern ? undefined : color.value,
								backgroundImage: color.pattern
									? "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)"
									: undefined,
								backgroundSize: color.pattern ? "8px 8px" : undefined,
								backgroundPosition: color.pattern
									? "0 0, 0 4px, 4px -4px, -4px 0px"
									: undefined,
							}}
						/>
						{selectedColor === color.value && (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="rounded-full bg-primary p-1">
									<Check className="h-3 w-3 text-primary-foreground" />
								</div>
							</div>
						)}
					</button>
				))}
			</div>

			{showCustomPicker && (
				<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
					<input
						type="color"
						value={customColor}
						onChange={(e) => handleCustomColorChange(e.target.value)}
						disabled={disabled}
						className="h-10 w-20 cursor-pointer rounded border border-border disabled:cursor-not-allowed disabled:opacity-50"
					/>
					<div className="flex-1">
						<input
							type="text"
							value={customColor}
							onChange={(e) => handleCustomColorChange(e.target.value)}
							disabled={disabled}
							placeholder="#FFFFFF"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

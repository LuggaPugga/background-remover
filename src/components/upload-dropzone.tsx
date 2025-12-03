import { ImageIcon, Upload } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
	onFileSelect: (file: File) => void;
	isDragging: boolean;
	onDragOver: (e: DragEvent) => void;
	onDragLeave: (e: DragEvent) => void;
	onDrop: (e: DragEvent) => void;
	onKeyDown: (e: KeyboardEvent) => void;
	disabled?: boolean;
	ref?: (el: HTMLInputElement) => void;
}

export function UploadDropzone(props: UploadDropzoneProps) {
	let fileInputRef: HTMLInputElement | undefined;

	const handleFileInput = (e: Event & { currentTarget: HTMLInputElement }) => {
		const file = e.currentTarget.files?.[0];
		if (file) {
			props.onFileSelect(file);
		}
	};

	return (
		<section
			onDragOver={props.onDragOver}
			onDragLeave={props.onDragLeave}
			onDrop={props.onDrop}
			onClick={() => {
				if (fileInputRef) {
					fileInputRef.click();
				}
			}}
			onKeyDown={props.onKeyDown}
			aria-label="Upload image by dragging and dropping or clicking"
			class={cn(
				"relative flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
				props.isDragging
					? "border-foreground bg-accent"
					: "border-border bg-card hover:border-muted-foreground/50",
				props.disabled && "opacity-50 cursor-not-allowed",
			)}
		>
			<div class="flex flex-col items-center gap-4 p-8 text-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<Upload class="h-8 w-8 text-muted-foreground" />
				</div>
				<div>
					<h3 class="mb-2 text-xl font-medium">
						{props.isDragging ? "Drop your image here" : "Upload an image"}
					</h3>
					<p class="text-sm text-muted-foreground">
						Drag and drop or click to browse
					</p>
				</div>
				<Button
					size="lg"
					onClick={(e) => {
						e.stopPropagation();
						if (fileInputRef) {
							fileInputRef.click();
						}
					}}
					disabled={props.disabled}
					class="mt-2"
				>
					<ImageIcon class="mr-2 h-4 w-4" />
					Select Image
				</Button>
			</div>
			<input
				ref={(el) => {
					fileInputRef = el;
					props.ref?.(el);
				}}
				type="file"
				accept="image/*"
				onChange={handleFileInput}
				class="hidden"
			/>
		</section>
	);
}

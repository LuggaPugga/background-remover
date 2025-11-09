import { ImageIcon, Upload } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
	onFileSelect: (file: File) => void;
	isDragging: boolean;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	disabled?: boolean;
}

export const UploadDropzone = forwardRef<HTMLInputElement, UploadDropzoneProps>(
	(
		{
			onFileSelect,
			isDragging,
			onDragOver,
			onDragLeave,
			onDrop,
			onKeyDown,
			disabled = false,
		},
		ref,
	) => {
		const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				onFileSelect(file);
			}
		};

		return (
			<section
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onClick={() => {
					if (ref && typeof ref !== "function" && ref.current) {
						ref.current.click();
					}
				}}
				onKeyDown={onKeyDown}
				aria-label="Upload image by dragging and dropping or clicking"
				className={cn(
					"relative flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
					isDragging
						? "border-foreground bg-accent"
						: "border-border bg-card hover:border-muted-foreground/50",
					disabled && "opacity-50 cursor-not-allowed",
				)}
			>
				<div className="flex flex-col items-center gap-4 p-8 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Upload className="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 className="mb-2 text-xl font-medium">
							{isDragging ? "Drop your image here" : "Upload an image"}
						</h3>
						<p className="text-sm text-muted-foreground">
							Drag and drop or click to browse
						</p>
					</div>
					<Button
						size="lg"
						onClick={(e) => {
							e.stopPropagation();
							if (ref && typeof ref !== "function" && ref.current) {
								ref.current.click();
							}
						}}
						disabled={disabled}
						className="mt-2"
					>
						<ImageIcon className="mr-2 h-4 w-4" />
						Select Image
					</Button>
				</div>
				<input
					ref={ref}
					type="file"
					accept="image/*"
					onChange={handleFileInput}
					className="hidden"
				/>
			</section>
		);
	},
);

UploadDropzone.displayName = "UploadDropzone";

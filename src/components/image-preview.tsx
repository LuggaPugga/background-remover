interface ImagePreviewProps {
	src: string;
	alt: string;
	label: string;
}

export function ImagePreview({ src, alt, label }: ImagePreviewProps) {
	return (
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-muted-foreground">{label}</span>
			</div>
			<div class="overflow-hidden rounded-lg border border-border bg-card">
				<img
					src={src || "/placeholder.svg"}
					alt={alt}
					class="h-full w-full object-contain"
					style={{ "max-height": "500px" }}
				/>
			</div>
		</div>
	);
}

interface ImagePreviewProps {
	src: string;
	alt: string;
	label: string;
}

export function ImagePreview({ src, alt, label }: ImagePreviewProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">
					{label}
				</span>
			</div>
			<div className="overflow-hidden rounded-lg border border-border bg-card">
				<img
					src={src || "/placeholder.svg"}
					alt={alt}
					className="h-full w-full object-contain"
					style={{ maxHeight: "500px" }}
				/>
			</div>
		</div>
	);
}

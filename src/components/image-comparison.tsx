import { ImagePreview } from "./image-preview";
import { ProcessedImagePreview } from "./processed-image-preview";

interface ImageComparisonProps {
	originalImage: string;
	processedImage: string | null;
	isProcessing: boolean;
}

export function ImageComparison({
	originalImage,
	processedImage,
	isProcessing,
}: ImageComparisonProps) {
	return (
		<div class="grid gap-6 md:grid-cols-2">
			<ImagePreview src={originalImage} alt="Original" label="Original" />
			<ProcessedImagePreview
				processedImage={processedImage}
				isProcessing={isProcessing}
			/>
		</div>
	);
}

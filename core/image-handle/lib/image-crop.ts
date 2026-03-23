import type { CropData, ImageTransformOptions } from "../types";

const RATIOS: Record<
  NonNullable<ImageTransformOptions["aspectRatio"]>,
  number
> = {
  square: 1,
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  free: 0,
};

/**
 * Get aspect ratio number from option (for canvas crop).
 */
export function getAspectRatio(
  aspectRatio: ImageTransformOptions["aspectRatio"]
): number {
  return aspectRatio ? (RATIOS[aspectRatio] ?? 0) : 0;
}

/**
 * Crop image on canvas and return Blob. Uses CropData (e.g. from Cropper.js getData()).
 */
export async function cropImageToBlob(
  source: File | Blob,
  cropData: CropData,
  options: { outputFormat?: "image/webp" | "image/jpeg"; quality?: number } = {}
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const { x, y, width, height } = cropData;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(imageBitmap, x, y, width, height, 0, 0, width, height);
  imageBitmap.close();

  const format = options.outputFormat ?? "image/webp";
  const quality = options.quality ?? 0.9;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        resolve(blob);
      },
      format,
      quality
    );
  });
}

/**
 * Resize image to fit within maxWidth/maxHeight keeping aspect ratio.
 */
export async function resizeImageToBlob(
  source: File | Blob,
  maxWidth: number,
  maxHeight: number,
  options: { outputFormat?: "image/webp" | "image/jpeg"; quality?: number } = {}
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  let { width, height } = imageBitmap;

  if (width <= maxWidth && height <= maxHeight) {
    imageBitmap.close();
    return source instanceof File ? new Blob([source]) : source;
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const format = options.outputFormat ?? "image/webp";
  const quality = options.quality ?? 0.9;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        resolve(blob);
      },
      format,
      quality
    );
  });
}

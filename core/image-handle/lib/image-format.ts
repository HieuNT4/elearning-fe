import { DEFAULT_THUMBNAIL_SIZE } from "../config";

/**
 * Convert image to WebP blob using Canvas for web-optimized upload.
 */
export async function convertToWebP(
  source: File | Blob,
  quality = 0.85
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const { width, height } = imageBitmap;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(imageBitmap, 0, 0);
  imageBitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create WebP blob"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

/**
 * Generate a small thumbnail Blob for preview (e.g. in list/grid).
 */
export async function generateThumbnail(
  source: File | Blob,
  maxSize = DEFAULT_THUMBNAIL_SIZE,
  quality = 0.8
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  let { width, height } = imageBitmap;

  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

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

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create thumbnail"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

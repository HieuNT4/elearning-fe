import imageCompression from "browser-image-compression";
import { DEFAULT_COMPRESSION_QUALITY } from "../config";
import type { ImageTransformOptions } from "../types";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: "image/webp" | "image/jpeg" | "image/png";
  initialQuality?: number;
}

/**
 * Compress image on the client using browser-image-compression.
 * Converts to WebP by default for smaller size.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions & ImageTransformOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = false,
    fileType = "image/webp",
    initialQuality = options.quality ?? DEFAULT_COMPRESSION_QUALITY,
  } = options;

  const result = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    fileType,
    initialQuality,
  });

  return result;
}

/**
 * Compress and optionally convert to WebP. Returns Blob for upload.
 */
export async function compressImageToBlob(
  file: File,
  options: CompressionOptions & ImageTransformOptions = {}
): Promise<Blob> {
  const compressed = await compressImage(file, options);
  return compressed;
}

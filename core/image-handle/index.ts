/**
 * Core image handling: validation, processing, upload adapters, and display components.
 * Use as building blocks; inject your upload API (FormData, TUS, S3, etc.) via adapters.
 *
 * @example
 * // Validation + upload
 * import { validateFiles, createFormDataUploadAdapter, useImageUpload } from '@/core/image-handle';
 *
 * // Display
 * import { ImageWithPlaceholder, ImageLightbox, ImageSkeleton } from '@/core/image-handle';
 */

export * from "./types";
export * from "./config";
export * from "./lib";
export * from "./hooks";
export * from "./components";

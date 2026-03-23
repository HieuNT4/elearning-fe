/**
 * Shared types for core/image-handle. Used by validation, processing, upload, and UI.
 */

export type ImageSourceType = "local" | "remote";

export interface CoreImageFile {
  id: string;
  file: File;
  previewUrl: string;
  source: ImageSourceType;
  /** Optional blurhash string for blur-up placeholder */
  blurhash?: string;
}

export type UploadProgressStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error";

export interface UploadProgress {
  id: string;
  progress: number;
  status: UploadProgressStatus;
  errorMessage?: string;
}

export interface ImageValidationConfig {
  /** Max file size in MB */
  maxSizeInMb: number;
  /** Allowed MIME types (e.g. image/jpeg, image/png, image/webp) */
  allowedMimeTypes: string[];
  /** Max number of files (for multi-upload) */
  maxFiles?: number;
  /** Max width in pixels (optional) */
  maxWidth?: number;
  /** Max height in pixels (optional) */
  maxHeight?: number;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  aspectRatio?: "square" | "16:9" | "4:3" | "free";
  quality?: number;
  outputFormat?: "image/webp" | "image/jpeg" | "image/png";
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Adapter: called by upload client. Implement per backend (FormData, TUS, S3, etc.) */
export type UploadHandler = (
  file: Blob | File,
  options: { onProgress?: (percent: number) => void }
) => Promise<string>;

export interface UploadImageOptions {
  files: (Blob | File)[];
  uploadHandler: UploadHandler;
  onProgress?: (item: UploadProgress) => void;
  maxRetries?: number;
}

/** Display / UX: props for image with skeleton, lazy, blur-up, fallback */
export interface ImageDisplayOptions {
  /** Placeholder when src is loading or failed */
  fallbackSrc?: string;
  /** Blurhash string for blur-up effect */
  blurhash?: string;
  /** Alt text */
  alt?: string;
  /** Enable lazy loading (IntersectionObserver) */
  lazy?: boolean;
  /** Enable click to open lightbox */
  lightbox?: boolean;
  /** Skeleton class when loading */
  skeletonClassName?: string;
  /** Root class */
  className?: string;
  /** Object fit */
  objectFit?: "contain" | "cover" | "fill" | "none";
  /** Width/height for aspect ratio or size */
  width?: number;
  height?: number;
}

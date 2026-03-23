import type { ImageValidationConfig } from "../types";

export const DEFAULT_IMAGE_VALIDATION: ImageValidationConfig = {
  maxSizeInMb: 5,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFiles: 10,
  maxWidth: 4096,
  maxHeight: 4096,
};

/** Default compression quality (0–1) for client-side compression */
export const DEFAULT_COMPRESSION_QUALITY = 0.8;

/** Default thumbnail max size (px) for previews */
export const DEFAULT_THUMBNAIL_SIZE = 200;

/** Allowed image MIME types for magic-byte validation */
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

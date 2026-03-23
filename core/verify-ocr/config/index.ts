import type { DocumentValidationConfig } from "../types";

export const DEFAULT_DOCUMENT_VALIDATION: DocumentValidationConfig = {
  maxSizeInMb: 10,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxDimension: 4096,
};

/** Minimum quality score (0-10) to accept document; below = ERR_BLUR. Lowered for demo when no face-api models. */
export const MIN_QUALITY_SCORE = 1;

/** Minimum similarity (0-1) to consider face match success. Lowered for demo. */
export const MIN_SIMILARITY_THRESHOLD = 0.4;

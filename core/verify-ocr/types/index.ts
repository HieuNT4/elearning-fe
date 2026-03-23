/**
 * Shared types for verify-ocr (eKYC). Used by validators, OCR, face-matcher, and features.
 */

export type DocumentType = "id_card" | "passport" | "driver_license" | "other";

export interface DocumentValidationConfig {
  /** Max file size in MB */
  maxSizeInMb: number;
  /** Allowed MIME types */
  allowedMimeTypes: string[];
  /** Max dimension (width or height) in pixels */
  maxDimension?: number;
}

export interface DocumentValidationResult {
  valid: boolean;
  errors: string[];
}

export interface OcrExtractResult {
  /** Raw text from OCR */
  rawText: string;
  /** Structured fields (name, id, dob, expiry, etc.) */
  fields: Record<string, string | null>;
  /** Base64 data URL of cropped reference face from document */
  referenceFaceDataUrl: string | null;
  /** Whether a face was detected on the document */
  hasFace: boolean;
  /** Blur/quality score 0-10 (optional) */
  qualityScore?: number;
}

export interface FaceMatchResult {
  /** Whether faces match */
  matched: boolean;
  /** Similarity score 0-1 (or 0-100%) */
  similarity: number;
  /** Error message if comparison failed */
  error?: string;
}

export interface VerificationSessionData {
  /** Document type */
  documentType: DocumentType;
  /** OCR result */
  ocrResult: OcrExtractResult;
  /** Original document image as data URL (for display) */
  documentImageDataUrl: string;
  /** Reference face crop (for matching) */
  referenceFaceDataUrl: string;
  /** Selfie/capture image data URL (set after Phase 2) */
  selfieDataUrl?: string;
  /** Face match result (set after Phase 2) */
  faceMatchResult?: FaceMatchResult;
  /** Timestamp when session was created */
  createdAt: string;
}

export const VERIFY_OCR_SESSION_KEY = "verify_ocr_session";

/** Error codes for UX handling */
export const VerifyOcrErrorCode = {
  ERR_INVALID_DOC: "ERR_INVALID_DOC",
  ERR_NO_FACE: "ERR_NO_FACE",
  ERR_BLUR: "ERR_BLUR",
  ERR_CAMERA: "ERR_CAMERA",
  ERR_NO_FACE_IN_FRAME: "ERR_NO_FACE_IN_FRAME",
  ERR_FORMAT: "ERR_FORMAT",
  ERR_RATE_LIMIT: "ERR_RATE_LIMIT",
} as const;

export type VerifyOcrErrorCodeType =
  (typeof VerifyOcrErrorCode)[keyof typeof VerifyOcrErrorCode];

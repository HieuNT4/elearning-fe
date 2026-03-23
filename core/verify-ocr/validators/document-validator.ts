import type {
  DocumentValidationConfig,
  DocumentValidationResult,
} from "../types";

/**
 * Validator class: checks file format and size for document upload.
 * OOP, mix-and-match compatible.
 */
export class DocumentValidator {
  private config: DocumentValidationConfig;

  constructor(config: Partial<DocumentValidationConfig> = {}) {
    this.config = {
      maxSizeInMb: 10,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      ...config,
    };
  }

  /**
   * Validate a single file. Returns valid=true and empty errors if OK.
   */
  validate(file: File): DocumentValidationResult {
    const errors: string[] = [];
    const maxBytes = this.config.maxSizeInMb * 1024 * 1024;

    if (file.size > maxBytes) {
      errors.push(`File size exceeds ${this.config.maxSizeInMb}MB limit.`);
    }

    const mime = file.type?.toLowerCase();
    if (
      !mime ||
      !this.config.allowedMimeTypes.some((allowed) => allowed === mime)
    ) {
      errors.push(
        `Invalid format. Allowed: ${this.config.allowedMimeTypes.join(", ")}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate file list (e.g. from dropzone). First file only for single-doc flow.
   */
  validateFiles(files: File[]): DocumentValidationResult {
    if (files.length === 0) {
      return { valid: false, errors: ["No file selected."] };
    }
    return this.validate(files[0]);
  }

  getConfig(): DocumentValidationConfig {
    return { ...this.config };
  }
}

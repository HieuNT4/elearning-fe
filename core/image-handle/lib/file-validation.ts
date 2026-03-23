import { fileTypeFromBlob } from "file-type";
import type { ImageValidationConfig } from "../types";
import { ALLOWED_IMAGE_MIMES } from "../config";

export interface FileValidationError {
  file: File;
  message: string;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: FileValidationError[];
}

const MESSAGES = {
  invalidType: "Invalid file type. Allowed: JPG, PNG, WebP.",
  sizeExceeded: "File size exceeds the maximum allowed.",
  dimensionExceeded: "Image dimensions exceed the maximum allowed.",
  tooManyFiles: "Too many files selected.",
} as const;

/**
 * Get image dimensions from a File using createImageBitmap (non-blocking).
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();
  return { width, height };
}

/**
 * Validate files: MIME (magic bytes via file-type), size, optional dimension limit.
 * Returns valid files and per-file errors.
 */
export async function validateFiles(
  files: FileList | File[],
  config: ImageValidationConfig
): Promise<FileValidationResult> {
  const fileArray = Array.from(files);
  const errors: FileValidationError[] = [];
  const validFiles: File[] = [];

  const {
    maxSizeInMb,
    allowedMimeTypes,
    maxFiles = 10,
    maxWidth,
    maxHeight,
  } = config;
  const maxBytes = maxSizeInMb * 1024 * 1024;
  const allowedSet = new Set(
    allowedMimeTypes.length > 0 ? allowedMimeTypes : ALLOWED_IMAGE_MIMES
  );

  const capped =
    typeof maxFiles === "number" ? fileArray.slice(0, maxFiles) : fileArray;

  for (const file of capped) {
    if (file.size > maxBytes) {
      errors.push({ file, message: MESSAGES.sizeExceeded });
      continue;
    }

    const detected = await fileTypeFromBlob(file);
    const mime = detected?.mime ?? file.type;
    if (!allowedSet.has(mime)) {
      errors.push({ file, message: MESSAGES.invalidType });
      continue;
    }

    if (maxWidth != null || maxHeight != null) {
      const isImage = mime.startsWith("image/");
      if (isImage) {
        try {
          const { width, height } = await getImageDimensions(file);
          if (
            (maxWidth != null && width > maxWidth) ||
            (maxHeight != null && height > maxHeight)
          ) {
            errors.push({ file, message: MESSAGES.dimensionExceeded });
            continue;
          }
        } catch {
          errors.push({ file, message: MESSAGES.dimensionExceeded });
          continue;
        }
      }
    }

    validFiles.push(file);
  }

  if (typeof maxFiles === "number" && fileArray.length > maxFiles) {
    const extra = fileArray.slice(maxFiles);
    extra.forEach((file) =>
      errors.push({ file, message: MESSAGES.tooManyFiles })
    );
  }

  return { validFiles, errors };
}

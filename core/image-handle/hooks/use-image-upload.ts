"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_IMAGE_VALIDATION } from "../config";
import {
  validateFiles,
  type FileValidationError,
} from "../lib/file-validation";
import { uploadImages } from "../lib/upload-client";
import type {
  CoreImageFile,
  ImageValidationConfig,
  UploadProgress,
  UploadHandler,
} from "../types";

export interface UseImageUploadOptions {
  validationConfig?: Partial<ImageValidationConfig>;
  /** If set, files are uploaded immediately when added */
  uploadHandler?: UploadHandler;
  maxFiles?: number;
}

export interface UseImageUploadReturn {
  /** Current list of images (local preview + optional uploaded URL) */
  images: CoreImageFile[];
  /** Upload progress per item (when using uploadHandler) */
  progressMap: Record<string, UploadProgress>;
  /** Validation errors from last add */
  validationErrors: FileValidationError[];
  /** Add files (validates then adds to list; optionally uploads) */
  addFiles: (files: FileList | File[]) => Promise<void>;
  /** Remove by id */
  removeById: (id: string) => void;
  /** Reorder: move item at fromIndex to toIndex */
  reorder: (fromIndex: number, toIndex: number) => void;
  /** Clear all */
  clear: () => void;
  /** Manually trigger upload for current images (if uploadHandler set and not auto-upload) */
  upload: () => Promise<string[]>;
  /** Whether upload is in progress */
  isUploading: boolean;
}

function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const { validationConfig, uploadHandler, maxFiles } = options;

  const config = useMemo<ImageValidationConfig>(
    () => ({
      ...DEFAULT_IMAGE_VALIDATION,
      ...validationConfig,
      ...(maxFiles != null && { maxFiles }),
    }),
    [validationConfig, maxFiles]
  );

  const [images, setImages] = useState<CoreImageFile[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, UploadProgress>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    FileValidationError[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setValidationErrors([]);
      const { validFiles, errors } = await validateFiles(files, config);
      setValidationErrors(errors);

      if (validFiles.length === 0) return;

      const newItems: CoreImageFile[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: createPreviewUrl(file),
        source: "local",
      }));

      setImages((prev) => {
        const max = config.maxFiles ?? 10;
        const combined = [...prev, ...newItems];
        return combined.slice(0, max);
      });

      if (uploadHandler && newItems.length > 0) {
        setIsUploading(true);
        try {
          await uploadImages({
            files: newItems.map((i) => i.file),
            uploadHandler,
            onProgress: (item) => {
              setProgressMap((p) => ({ ...p, [item.id]: item }));
            },
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [config, uploadHandler]
  );

  const removeById = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    setProgressMap((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      if (!removed) return prev;
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setImages((prev) => {
      prev.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
      });
      return [];
    });
    setProgressMap({});
    setValidationErrors([]);
  }, []);

  const upload = useCallback(async (): Promise<string[]> => {
    if (!uploadHandler || images.length === 0) return [];
    setIsUploading(true);
    try {
      const urls = await uploadImages({
        files: images.map((i) => i.file),
        uploadHandler,
        onProgress: (item) => {
          setProgressMap((p) => ({ ...p, [item.id]: item }));
        },
      });
      return urls;
    } finally {
      setIsUploading(false);
    }
  }, [uploadHandler, images]);

  return {
    images,
    progressMap,
    validationErrors,
    addFiles,
    removeById,
    reorder,
    clear,
    upload,
    isUploading,
  };
}

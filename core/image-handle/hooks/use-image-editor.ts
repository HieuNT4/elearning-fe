"use client";

import { useCallback, useState } from "react";
import type { CropData } from "../types";
import { cropImageToBlob } from "../lib/image-crop";

export interface UseImageEditorReturn {
  /** Current file being edited (or null) */
  currentFile: File | null;
  /** Open editor with this file */
  open: (file: File) => void;
  /** Close editor */
  close: () => void;
  /** Apply crop and return Blob (caller can upload or replace) */
  applyCrop: (cropData: CropData) => Promise<Blob>;
  /** Whether editor is open */
  isOpen: boolean;
}

export function useImageEditor(): UseImageEditorReturn {
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const open = useCallback((file: File) => {
    setCurrentFile(file);
  }, []);

  const close = useCallback(() => {
    setCurrentFile(null);
  }, []);

  const applyCrop = useCallback(
    async (cropData: CropData): Promise<Blob> => {
      if (!currentFile) throw new Error("No file to crop");
      const blob = await cropImageToBlob(currentFile, cropData);
      return blob;
    },
    [currentFile]
  );

  return {
    currentFile,
    open,
    close,
    applyCrop,
    isOpen: currentFile != null,
  };
}

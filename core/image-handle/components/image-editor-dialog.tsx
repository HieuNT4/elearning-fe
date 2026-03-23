"use client";

import React, { useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageCropper } from "./image-cropper";
import type CropperJs from "cropperjs";
type CropperInstance = InstanceType<typeof CropperJs>;
import type { CropData } from "../types";
import type { AspectRatioOption } from "./image-cropper";

export interface ImageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Object URL or remote URL of image to edit */
  imageSrc: string | null;
  aspectRatio?: AspectRatioOption;
  onApply: (cropData: CropData) => void | Promise<void>;
  /** Call when dialog closes (revoke object URL if needed) */
  onClose?: () => void;
  /** Dialog title (e.g. for i18n) */
  title?: string;
  /** Apply button label (e.g. for i18n) */
  applyLabel?: string;
}

/**
 * Modal dialog with image cropper. Caller provides imageSrc (e.g. from File via URL.createObjectURL)
 * and handles onApply (e.g. crop then upload).
 */
function ImageEditorDialog({
  open,
  onOpenChange,
  imageSrc,
  aspectRatio = "square",
  onApply,
  onClose,
  title = "Crop image",
  applyLabel = "Apply",
}: ImageEditorDialogProps) {
  const cropperRef = useRef<
    HTMLImageElement | { cropper: CropperInstance } | null
  >(null);
  const lastCropRef = useRef<CropData | null>(null);

  const handleApply = useCallback(async () => {
    const ref = cropperRef.current;
    const cropper = ref && "cropper" in ref ? ref.cropper : null;
    if (!cropper) return;
    const data = cropper.getData(true);
    const cropData: CropData = {
      x: Math.round(data.x),
      y: Math.round(data.y),
      width: Math.round(data.width),
      height: Math.round(data.height),
    };
    lastCropRef.current = cropData;
    await onApply(cropData);
    onOpenChange(false);
  }, [onApply, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && onClose) onClose();
      onOpenChange(next);
    },
    [onOpenChange, onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='image-editor-dialog max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {imageSrc && (
          <ImageCropper
            ref={cropperRef}
            src={imageSrc}
            aspectRatio={aspectRatio}
            onCropComplete={(d) => {
              lastCropRef.current = d;
            }}
          />
        )}
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='button' onClick={handleApply} disabled={!imageSrc}>
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ImageEditorDialog };

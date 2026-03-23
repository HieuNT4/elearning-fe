"use client";

import React, { useRef, useEffect } from "react";
import { Cropper } from "react-cropper";
import type CropperJs from "cropperjs";
type CropperInstance = InstanceType<typeof CropperJs>;
import "../styles/cropper.css";
import { cn } from "@/core/lib/utils";
import type { CropData } from "../types";
import { getAspectRatio } from "../lib/image-crop";
import type { ImageTransformOptions } from "../types";

export type AspectRatioOption = ImageTransformOptions["aspectRatio"];

export interface ImageCropperProps {
  src: string;
  aspectRatio?: AspectRatioOption;
  onCropComplete?: (data: CropData) => void;
  className?: string;
  /** Initial crop area (optional) */
  initialCrop?: CropData;
}

const ImageCropper = React.forwardRef<
  HTMLImageElement | { cropper: CropperInstance },
  ImageCropperProps
>(({ src, aspectRatio = "free", onCropComplete, className }, ref) => {
  const cropperRef = useRef<HTMLImageElement & { cropper?: CropperInstance }>(
    null
  );

  useEffect(() => {
    const el = cropperRef.current;
    if (typeof ref === "function") {
      ref(
        el?.cropper
          ? (el as HTMLImageElement & { cropper: CropperInstance })
          : el
      );
    } else if (ref) {
      (
        ref as React.MutableRefObject<
          HTMLImageElement | { cropper: CropperInstance } | null
        >
      ).current = el?.cropper ? { cropper: el.cropper } : el;
    }
  }, [ref]);

  const ratio = getAspectRatio(aspectRatio);

  return (
    <div
      className={cn(
        "image-cropper bg-muted overflow-hidden rounded-md",
        className
      )}
    >
      <Cropper
        ref={cropperRef}
        src={src}
        aspectRatio={ratio > 0 ? ratio : undefined}
        viewMode={1}
        guides
        background={false}
        responsive
        autoCropArea={0.8}
        checkOrientation={true}
        crop={() => {
          const cropper = cropperRef.current?.cropper;
          if (cropper && onCropComplete) {
            const data = cropper.getData(true);
            onCropComplete({
              x: Math.round(data.x),
              y: Math.round(data.y),
              width: Math.round(data.width),
              height: Math.round(data.height),
            });
          }
        }}
        style={{ height: 360, width: "100%" }}
      />
    </div>
  );
});

ImageCropper.displayName = "ImageCropper";

export { ImageCropper };

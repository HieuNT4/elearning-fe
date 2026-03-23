"use client";

import React from "react";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { CoreImageFile, UploadProgress } from "../types";

export interface ImagePreviewListProps {
  images: CoreImageFile[];
  progressMap?: Record<string, UploadProgress>;
  onRemove?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Click image to open editor/lightbox */
  onImageClick?: (id: string, index: number) => void;
  className?: string;
  /** Show reorder handles */
  reorderable?: boolean;
  /** Thumb size */
  thumbSize?: number;
}

const ImagePreviewList = React.forwardRef<
  HTMLDivElement,
  ImagePreviewListProps
>(
  (
    {
      images,
      progressMap = {},
      onRemove,
      onReorder,
      onImageClick,
      className,
      reorderable = false,
      thumbSize = 80,
    },
    ref
  ) => {
    if (images.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn("image-preview-list flex flex-wrap gap-3", className)}
      >
        {images.map((img, index) => {
          const progress = progressMap[img.id];
          const isUploading = progress?.status === "uploading";

          return (
            <div
              key={img.id}
              className='image-preview-list-item bg-muted/30 relative overflow-hidden rounded-lg border'
              style={{ width: thumbSize, height: thumbSize }}
            >
              {reorderable && onReorder && (
                <button
                  type='button'
                  className='absolute top-0 left-0 z-10 flex h-6 w-6 items-center justify-center rounded-br bg-black/50 text-white hover:bg-black/70'
                  aria-label='Drag to reorder'
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <GripVertical className='h-3 w-3' />
                </button>
              )}
              <button
                type='button'
                className='absolute top-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-bl bg-black/50 text-white hover:bg-red-600'
                aria-label='Remove image'
                onClick={() => onRemove?.(img.id)}
              >
                <X className='h-3 w-3' />
              </button>
              <button
                type='button'
                className='focus:ring-ring h-full w-full cursor-pointer border-0 p-0 focus:ring-2 focus:outline-none'
                onClick={() => onImageClick?.(img.id, index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img
                  src={img.previewUrl}
                  alt=''
                  className='h-full w-full object-cover'
                  width={thumbSize}
                  height={thumbSize}
                />
              </button>
              {isUploading && (
                <div className='absolute right-0 bottom-0 left-0 bg-black/60 p-1'>
                  <Progress value={progress?.progress ?? 0} className='h-1' />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

ImagePreviewList.displayName = "ImagePreviewList";

export { ImagePreviewList };

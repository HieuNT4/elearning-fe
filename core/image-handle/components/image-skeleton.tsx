"use client";

import React from "react";
import { cn } from "@/core/lib/utils";

export interface ImageSkeletonProps {
  className?: string;
  /** Aspect ratio (e.g. "1" for square, "16/9") */
  aspectRatio?: string | number;
  width?: number | string;
  height?: number | string;
}

/**
 * Skeleton placeholder while image is loading. Use anywhere you need a consistent loading state.
 */
const ImageSkeleton = React.forwardRef<HTMLDivElement, ImageSkeletonProps>(
  ({ className, aspectRatio = "1", width, height }, ref) => (
    <div
      ref={ref}
      className={cn(
        "image-skeleton bg-muted animate-pulse rounded-md",
        className
      )}
      style={{
        aspectRatio:
          typeof aspectRatio === "number" ? String(aspectRatio) : aspectRatio,
        width,
        height,
      }}
      aria-hidden
    />
  )
);

ImageSkeleton.displayName = "ImageSkeleton";

export { ImageSkeleton };

"use client";

import React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { cn } from "@/core/lib/utils";

export interface ImageDropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  /** Override inner text */
  label?: string;
  /** Show border when drag active */
  dragActiveClassName?: string;
}

/**
 * Drag & drop zone for image upload. Use with useImageUpload or standalone.
 */
const ImageDropzone = React.forwardRef<HTMLDivElement, ImageDropzoneProps>(
  (
    {
      onDrop,
      className,
      label = "Drag & drop images here, or click to select",
      dragActiveClassName,
      accept = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize = 5 * 1024 * 1024,
      multiple = true,
      ...rest
    },
    ref
  ) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (accepted) => onDrop(accepted),
      accept,
      maxSize,
      multiple,
      ...rest,
    });

    return (
      <div
        ref={ref}
        className={cn(
          "image-dropzone",
          "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragActive &&
            (dragActiveClassName ?? "border-primary/50 bg-primary/5"),
          className
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} aria-label='Upload images' />
        <span className='text-muted-foreground text-center text-sm'>
          {label}
        </span>
      </div>
    );
  }
);

ImageDropzone.displayName = "ImageDropzone";

export { ImageDropzone };

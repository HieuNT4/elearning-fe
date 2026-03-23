"use client";

import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/core/lib/utils";

export interface ImageLightboxProps {
  /** When set, lightbox is open and shows this src */
  src: string | null;
  alt?: string;
  onClose: () => void;
  className?: string;
}

/**
 * Full-screen style lightbox to view image. Call with src set to open.
 */
function ImageLightbox({
  src,
  alt = "",
  onClose,
  className,
}: ImageLightboxProps) {
  const open = Boolean(src);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          "image-lightbox h-fit max-h-[95vh] w-fit max-w-[95vw] overflow-hidden border-0 bg-transparent p-0",
          className
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogTitle className='sr-only'>
          {alt ? `View image: ${alt}` : "View image"}
        </DialogTitle>
        {src && (
          /* eslint-disable-next-line @next/next/no-img-element -- lightbox supports blob/external URLs */
          <img
            src={src}
            alt={alt}
            className='h-auto max-h-[90vh] w-auto max-w-full object-contain'
            draggable={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface UseImageLightboxReturn {
  /** Current src to show in lightbox (null = closed) */
  lightboxSrc: string | null;
  /** Open lightbox with this image src */
  openLightbox: (src: string) => void;
  /** Close lightbox */
  closeLightbox: () => void;
}

export function useImageLightbox(): UseImageLightboxReturn {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const openLightbox = useCallback((src: string) => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);
  return { lightboxSrc, openLightbox, closeLightbox };
}

export { ImageLightbox };

"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/core/lib/utils";
import { BlurhashCanvas } from "./blurhash-canvas";
import type { ImageDisplayOptions } from "../types";

export interface ImageWithPlaceholderProps
  extends
    Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">,
    Omit<ImageDisplayOptions, "width" | "height"> {
  src: string | null | undefined;
  /** When true, show skeleton until loaded (and optionally blurhash underneath) */
  showSkeleton?: boolean;
  /** When true, use IntersectionObserver to load only when in view */
  lazy?: boolean;
  /** Blurhash for blur-up effect (shown until image loads) */
  blurhash?: string;
  /** Fallback image URL when src fails or is empty */
  fallbackSrc?: string;
}

/**
 * Image with skeleton loading, lazy loading, blur-up placeholder, and fallback.
 * Use anywhere you need robust image display.
 */
const ImageWithPlaceholder = React.forwardRef<
  HTMLImageElement,
  ImageWithPlaceholderProps
>(
  (
    {
      src,
      alt = "",
      className,
      showSkeleton = true,
      lazy = true,
      blurhash,
      fallbackSrc,
      skeletonClassName,
      objectFit = "cover",
      width,
      height,
      ...imgProps
    },
    ref
  ) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(!lazy);
    const containerRef = useRef<HTMLDivElement>(null);

    const effectiveSrc =
      error && fallbackSrc ? fallbackSrc : src || fallbackSrc;

    useEffect(() => {
      if (!lazy || !containerRef.current) {
        return;
      }
      const el = containerRef.current;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setInView(true);
        },
        { rootMargin: "50px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [lazy]);

    const showPlaceholder = showSkeleton && (!loaded || error);
    const showBlurhash = blurhash && !loaded && !error;

    return (
      <div
        ref={containerRef}
        className={cn(
          "image-with-placeholder relative overflow-hidden",
          className
        )}
        style={{ width, height }}
      >
        {showPlaceholder && (
          <div
            className={cn(
              "bg-muted absolute inset-0 animate-pulse rounded-md",
              skeletonClassName
            )}
            aria-hidden
          />
        )}
        {showBlurhash && (
          <div className='absolute inset-0 overflow-hidden blur-xl' aria-hidden>
            <BlurhashCanvas
              hash={blurhash}
              width={32}
              height={32}
              className='h-full min-h-full w-full min-w-full'
            />
          </div>
        )}
        {inView && effectiveSrc && (
          /* eslint-disable-next-line @next/next/no-img-element -- generic display with blob/fallback/lazy */
          <img
            ref={ref}
            src={effectiveSrc}
            alt={alt}
            loading={lazy ? "lazy" : undefined}
            decoding='async'
            className={cn(
              "relative h-full w-full transition-opacity duration-300",
              !loaded && !error ? "opacity-0" : "opacity-100",
              objectFit === "cover" && "object-cover",
              objectFit === "contain" && "object-contain",
              objectFit === "fill" && "object-fill",
              objectFit === "none" && "object-none",
              className
            )}
            style={{ width, height }}
            onLoad={() => {
              setLoaded(true);
              setError(false);
            }}
            onError={() => {
              if (effectiveSrc !== fallbackSrc) {
                setError(true);
              }
            }}
            {...imgProps}
          />
        )}
      </div>
    );
  }
);

ImageWithPlaceholder.displayName = "ImageWithPlaceholder";

export { ImageWithPlaceholder };

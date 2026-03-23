"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { decode } from "blurhash";
import { cn } from "@/core/lib/utils";

export interface BlurhashCanvasProps {
  hash: string;
  width?: number;
  height?: number;
  punch?: number;
  className?: string;
}

/**
 * Renders a blurhash string as a small canvas (for blur-up placeholder).
 */
const BlurhashCanvas = React.forwardRef<HTMLCanvasElement, BlurhashCanvasProps>(
  ({ hash, width = 32, height = 32, punch = 1, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const setRef = useCallback(
      (el: HTMLCanvasElement | null) => {
        (
          canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref)
          (ref as React.MutableRefObject<HTMLCanvasElement | null>).current =
            el;
      },
      [ref]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !hash) return;

      try {
        const pixels = decode(hash, width, height, punch);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
      } catch {
        // Invalid hash: leave canvas empty
      }
    }, [hash, width, height, punch]);

    return (
      <canvas
        ref={setRef}
        width={width}
        height={height}
        className={cn("blurhash-canvas block", className)}
        aria-hidden
      />
    );
  }
);

BlurhashCanvas.displayName = "BlurhashCanvas";

export { BlurhashCanvas };

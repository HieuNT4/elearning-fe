"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCountdownOptions {
  initialSeconds: number;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  seconds: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  reset: () => void;
  stop: () => void;
}

export function useCountdown({
  initialSeconds,
  onComplete,
}: UseCountdownOptions): UseCountdownReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const isComplete = seconds === 0;

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  return {
    seconds,
    isRunning,
    isComplete,
    start,
    reset,
    stop,
  };
}

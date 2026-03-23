"use client";

import { useState, useCallback } from "react";

interface FormState {
  error: string | null;
  success: string | null;
  isLoading: boolean;
}

interface UseFormStateReturn extends FormState {
  setError: (error: string | null) => void;
  setSuccess: (message: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  startSubmit: () => void;
}

const initialState: FormState = {
  error: null,
  success: null,
  isLoading: false,
};

export function useFormState(): UseFormStateReturn {
  const [state, setState] = useState<FormState>(initialState);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, success: null }));
  }, []);

  const setSuccess = useCallback((success: string | null) => {
    setState((prev) => ({ ...prev, success, error: null }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const startSubmit = useCallback(() => {
    setState({ error: null, success: null, isLoading: true });
  }, []);

  return {
    ...state,
    setError,
    setSuccess,
    setLoading,
    reset,
    startSubmit,
  };
}

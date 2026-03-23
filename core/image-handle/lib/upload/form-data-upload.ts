import axios, { type AxiosInstance } from "axios";
import type { UploadAdapter } from "./types";

export interface FormDataUploadAdapterOptions {
  /** POST URL for upload (e.g. /api/upload, or full URL) */
  url: string;
  /** Optional axios instance (e.g. from @/core/lib/api-client). If not set, uses axios default. */
  axiosInstance?: AxiosInstance;
  /** Form field name for the file (default: 'file') */
  fileFieldName?: string;
  /** Optional extra FormData fields */
  extraFields?: Record<string, string | Blob>;
}

/**
 * Standard FormData upload adapter. Use with any backend that accepts multipart/form-data.
 * Response must contain the asset URL (or we need a responseMapper).
 */
export function createFormDataUploadAdapter(
  options: FormDataUploadAdapterOptions
): UploadAdapter {
  const {
    url,
    axiosInstance = axios,
    fileFieldName = "file",
    extraFields,
  } = options;

  return {
    async upload(file, { onProgress }) {
      const form = new FormData();
      form.append(fileFieldName, file);

      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          form.append(key, value);
        }
      }

      const response = await axiosInstance.post<{
        url?: string;
        data?: { url?: string };
      }>(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total != null && e.total > 0 && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      const data = response.data;
      const uploadedUrl =
        typeof data === "object" && data !== null && "url" in data
          ? (data as { url?: string }).url
          : (data as { data?: { url?: string } })?.data?.url;

      if (uploadedUrl) {
        return uploadedUrl;
      }
      // Fallback: return a placeholder so caller can map response themselves
      return (data as { id?: string })?.id ?? String(response.status);
    },
  };
}

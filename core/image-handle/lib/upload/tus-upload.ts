import * as tus from "tus-js-client";
import type { UploadAdapter } from "./types";

export interface TusUploadAdapterOptions {
  /** TUS endpoint URL (e.g. /api/upload/tus) */
  endpoint: string;
  /** Optional headers (e.g. Authorization) */
  headers?: Record<string, string>;
  /** Optional metadata keys to send */
  metadata?: Record<string, string>;
}

/**
 * Resumable upload adapter using TUS protocol. Use when backend supports TUS.
 */
export function createTusUploadAdapter(
  options: TusUploadAdapterOptions
): UploadAdapter {
  const { endpoint, headers = {}, metadata = {} } = options;

  return {
    upload(file, { onProgress }) {
      return new Promise<string>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint,
          retryDelays: [0, 3000, 5000, 10000],
          metadata: {
            filetype: file.type,
            ...metadata,
          },
          headers,
          onProgress: (bytesUploaded, bytesTotal) => {
            if (bytesTotal > 0 && onProgress) {
              onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
            }
          },
          onSuccess: () => {
            const url = upload.url;
            resolve(url ?? "");
          },
          onError: (err) => {
            reject(err);
          },
        });

        upload.start();
      });
    },
  };
}

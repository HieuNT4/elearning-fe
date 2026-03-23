import type {
  UploadHandler,
  UploadProgress,
  UploadProgressStatus,
} from "../types";

const DEFAULT_RETRIES = 2;

/**
 * Upload multiple files with progress and optional retry.
 * uploadHandler is injected (from FormData, TUS, or feature-specific API).
 */
export async function uploadImages(options: {
  files: (Blob | File)[];
  uploadHandler: UploadHandler;
  onProgress?: (item: UploadProgress) => void;
  maxRetries?: number;
}): Promise<string[]> {
  const {
    files,
    uploadHandler,
    onProgress,
    maxRetries = DEFAULT_RETRIES,
  } = options;

  const results: string[] = [];

  for (const file of files) {
    const id = crypto.randomUUID();
    let lastError: Error | null = null;

    const report = (
      status: UploadProgressStatus,
      progress: number,
      errorMessage?: string
    ) => {
      onProgress?.({
        id,
        progress,
        status,
        errorMessage,
      });
    };

    report("uploading", 0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await uploadHandler(file, {
          onProgress: (percent) => report("uploading", percent),
        });
        report("success", 100);
        results.push(url);
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          report("uploading", 0);
        } else {
          report("error", 0, lastError.message);
          throw lastError;
        }
      }
    }
  }

  return results;
}

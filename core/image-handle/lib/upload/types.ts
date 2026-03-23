/**
 * Upload adapter interface. Implement FormData, TUS, or custom (S3, Cloudinary).
 */

export interface UploadAdapter {
  /**
   * Upload a single file. Return final URL or asset ID.
   * onProgress(0-100) is optional for progress bar.
   */
  upload(
    file: Blob | File,
    options: { onProgress?: (percent: number) => void }
  ): Promise<string>;
}

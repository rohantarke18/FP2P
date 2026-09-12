import { EvidenceItem } from '../types';

export interface UploadProgressCallback {
  (progress: number): void;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

export const uploadService = {
  /**
   * Uploads file to server-side free object storage via /api/upload.
   * Validates size, mime-type, and authentication.
   * Strictly avoids Base64/DataURL/objectURL fallbacks. If upload fails, bubbles up error for user retry.
   */
  async uploadFile(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<EvidenceItem> {
    // 15MB Maximum Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File "${file.name}" (${this.formatFileSize(file.size)}) exceeds the maximum allowed 15MB limit.`
      );
    }

    // Mime-type validation
    const isMimeAllowed = ALLOWED_MIME_TYPES.some((type) => {
      if (file.type === type) return true;
      if (file.type.startsWith('image/') && type.startsWith('image/')) return true;
      return false;
    });

    if (!isMimeAllowed) {
      throw new Error(
        `File format "${file.type || file.name}" is not supported. Permitted formats: JPEG, PNG, WEBP, MP4, and PDF documents.`
      );
    }

    return new Promise<EvidenceItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success && data.evidence) {
              resolve(data.evidence);
            } else {
              reject(new Error(data.message || 'Server upload processing failed.'));
            }
          } catch (e) {
            reject(new Error('Invalid response from upload server.'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.message || `Upload failed with status ${xhr.status}.`));
          } catch {
            reject(new Error(`Upload failed with server status ${xhr.status}. Please check network and retry.`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Upload failed for "${file.name}". Please check network connection and retry.`));
      };

      xhr.open('POST', '/api/upload', true);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};

/**
 * useFileUpload Hook
 * Manages file selection, previews, and upload functionality
 * Handles validation, error states, and cleanup
 */

import { useState, useRef, useCallback } from 'react';

export interface UseFileUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  files: File[];
  previews: string[];
  uploading: boolean;
  error: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  reset: () => void;
  uploadFiles: (uploadFn: (files: File[]) => Promise<void>) => Promise<void>;
}

/**
 * Custom hook for file upload management
 * @param maxFiles - Maximum number of files allowed (default: 10)
 * @param accept - Accepted file types (default: 'image/*')
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 */
export function useFileUpload(
  maxFiles: number = 10,
  accept: string = 'image/*',
  maxSizeMB: number = 5,
): UseFileUploadReturn {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file size
   */
  const validateFileSize = useCallback(
    (file: File): boolean => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      return file.size <= maxSizeBytes;
    },
    [maxSizeMB],
  );

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      setError(null);
      const fileArray = Array.from(selectedFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate each file
      const invalidFiles = fileArray.filter((file) => !validateFileSize(file));
      if (invalidFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${maxSizeMB}MB`);
        return;
      }

      // Add files
      setFiles((prev) => [...prev, ...fileArray]);

      // Generate previews for images
      fileArray.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews((prev) => [...prev, reader.result as string]);
          };
          reader.onerror = () => {
            setError('Failed to generate preview for some files');
          };
          reader.readAsDataURL(file);
        } else {
          // For non-image files, use a placeholder
          setPreviews((prev) => [...prev, '']);
        }
      });
    },
    [files.length, maxFiles, maxSizeMB, validateFileSize],
  );

  /**
   * Remove a file by index
   */
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Upload files using provided function
   */
  const uploadFiles = useCallback(
    async (uploadFn: (files: File[]) => Promise<void>): Promise<void> => {
      if (files.length === 0) {
        setError('No files selected');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        await uploadFn(files);
        reset();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [files, reset],
  );

  return {
    fileInputRef,
    files,
    previews,
    uploading,
    error,
    handleFileSelect,
    removeFile,
    reset,
    uploadFiles,
  };
}

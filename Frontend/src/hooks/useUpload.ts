import { useState } from 'react';
import { apiService } from '../services/api';
import { useStore } from '../store/useStore';
import type { UploadProgress, Document } from '../types';

export const useUpload = () => {
  const { addDocument } = useStore();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
  });

  const uploadFile = async (file: File) => {
    setUploadProgress({ progress: 0, status: 'uploading' });

    try {
      // Upload file to backend which will process and store embeddings
      const res = await apiService.uploadFile(file, (progress) => {
        setUploadProgress({ progress, status: 'uploading' });
      });

      // Backend returns a message and created document metadata
      setUploadProgress({ progress: 100, status: 'processing', message: 'Processing document...' });

      let document: Document | null = null;
      if (res && res.document) {
        // Map backend document to frontend Document shape
        document = {
          id: res.document.id?.toString(),
          name: res.document.name,
          file_url: '', // Backend doesn't return file_url
          file_size: res.document.file_size,
          status: res.document.status,
          uploaded_at: res.document.uploaded_at,
          processed_at: res.document.processed_at,
        };

        // Add to local store
        addDocument(document);
      } else {
        throw new Error('No document data received from backend');
      }

      setUploadProgress({ progress: 100, status: 'success', message: res.message || 'Upload complete!' });

      return document;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({ progress: 0, status: 'error', message });
      throw error;
    }
  };

  const resetUpload = () => {
    setUploadProgress({ progress: 0, status: 'idle' });
  };

  return {
    uploadProgress,
    uploadFile,
    resetUpload,
  };
};

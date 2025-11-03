import { apiClient } from '../lib/axios';
import type { BackendQueryResponse } from '../types';

export const apiService = {
  // Uploads a PDF file directly to the backend which will process and store embeddings
  uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/process-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data; // backend returns { message: '...' }
  },

  // Keep helper for processing a remote PDF URL (if backend supports later)
  processPdfUrl: async (pdfUrl: string) => {
    const response = await apiClient.post('/api/process-pdf', { pdf_url: pdfUrl });
    return response.data;
  },

  queryDocument: async (query: string): Promise<BackendQueryResponse> => {
    const response = await apiClient.get('/api/query', {
      params: { query },
    });
    return response.data;
  },
};

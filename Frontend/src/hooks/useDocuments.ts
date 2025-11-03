import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabase';
import { useStore } from '../store/useStore';
import type { Document } from '../types';

export const useDocuments = () => {
  const { documents, setDocuments } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await supabaseService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setError(null);
    try {
      await supabaseService.deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
      throw err;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    setError(null);
    try {
      await supabaseService.updateDocument(id, updates);
      await fetchDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update document';
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    deleteDocument,
    updateDocument,
  };
};

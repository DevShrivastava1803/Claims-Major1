import { create } from 'zustand';
import type { Document, Query } from '../types';

interface AppState {
  currentDocument: Document | null;
  documents: Document[];
  queries: Query[];
  isLoading: boolean;
  error: string | null;
  setCurrentDocument: (document: Document | null) => void;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  setQueries: (queries: Query[]) => void;
  addQuery: (query: Query) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentDocument: null,
  documents: [],
  queries: [],
  isLoading: false,
  error: null,
  setCurrentDocument: (document) => set({ currentDocument: document }),
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [document, ...state.documents] })),
  setQueries: (queries) => set({ queries }),
  addQuery: (query) => set((state) => ({ queries: [query, ...state.queries] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

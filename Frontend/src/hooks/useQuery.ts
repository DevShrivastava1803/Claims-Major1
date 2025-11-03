import { useState } from 'react';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabase';
import { useStore } from '../store/useStore';
import type { Query } from '../types';

export const useQuery = () => {
  const { addQuery } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Query | null>(null);

  const submitQuery = async (queryText: string, documentId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const queryResult = await apiService.queryDocument(queryText);

      // Map backend response shape to frontend expected shape
      const mapped = {
        decision: queryResult.decision,
        claim_amount: queryResult.amount || null,
        justification: queryResult.justification,
        policy_clauses: queryResult.reference_clauses || [],
        query_text: queryText,
      } as any;

      // Show the API result immediately
      setResult(mapped);

      // Save to Supabase in background; do not block UI on failures
      try {
        const savedQuery = await supabaseService.createQuery({
          document_id: documentId,
          query_text: mapped.query_text,
          // backend expects 'response' payload to create and store query
          response: queryResult,
        } as any);
        addQuery(savedQuery);
      } catch (persistErr) {
        console.warn('Failed to persist query to Supabase:', persistErr);
      }

      return mapped as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process query';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    error,
    result,
    submitQuery,
    clearResult,
  };
};

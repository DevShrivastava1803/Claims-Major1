import { apiClient } from '../lib/axios';
import type { Document, Query } from '../types';

export const supabaseService = {
  async createDocument(data: Omit<Document, 'id' | 'uploaded_at'>) {
    const res = await apiClient.post('/api/documents', data);
    return res.data;
  },

  async getDocuments(): Promise<Document[]> {
    const res = await apiClient.get('/api/documents');
    return res.data;
  },

  async getDocumentById(id: string): Promise<Document | null> {
    const res = await apiClient.get(`/api/documents/${id}`);
    return res.data;
  },

  async updateDocument(id: string, updates: Partial<Document>) {
    const res = await apiClient.put(`/api/documents/${id}`, updates);
    return res.data;
  },

  async deleteDocument(id: string) {
    const res = await apiClient.delete(`/api/documents/${id}`);
    return res.data;
  },

  async createQuery(data: Omit<Query, 'id' | 'created_at'>) {
    const res = await apiClient.post('/api/queries', data);
    const r: any = res.data;
    return {
      id: r.id?.toString(),
      document_id: r.document_id,
      query_text: r.query_text,
      decision: r.decision,
      claim_amount: r.amount ? Number(r.amount) : undefined,
      justification: r.justification,
      policy_clauses: r.reference_clauses || [],
      created_at: r.timestamp,
    } as any;
  },

  async getQueriesByDocument(documentId: string): Promise<Query[]> {
    const res = await apiClient.get(`/api/documents/${documentId}/queries`);
    const rows: any[] = res.data || [];
    // Map backend fields to frontend Query type
    return rows.map((r) => ({
      id: r.id?.toString(),
      document_id: r.document_id,
      query_text: r.query_text,
      decision: r.decision,
      claim_amount: r.amount ? Number(r.amount) : undefined,
      justification: r.justification,
      policy_clauses: r.reference_clauses || [],
      created_at: r.timestamp,
    }));
  },

  async getAnalytics() {
    const res = await apiClient.get('/api/queries');
    const data: any[] = res.data || [];
    const analytics = {
      total_claims: data.length,
      approved_claims: data.filter((q: any) => q.decision === 'approved').length,
      rejected_claims: data.filter((q: any) => q.decision === 'rejected').length,
      total_amount: data.reduce((sum: number, q: any) => sum + (Number(q.amount) || 0), 0),
    };
    return analytics;
  },
};

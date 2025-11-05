export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  status: 'processing' | 'completed' | 'failed';
  summary?: string;
  uploaded_at: string;
  processed_at?: string;
}

export interface Query {
  id: string;
  document_id: string;
  query_text: string;
  decision: 'approved' | 'rejected';
  claim_amount?: number;
  justification: string;
  policy_clauses: string[];
  // Rich clause details, when available for current session result
  reference_details?: { label: string; snippet: string }[];
  created_at: string;
}

// Raw response shape from backend /api/query
export interface BackendQueryResponse {
  decision: 'approved' | 'rejected';
  amount?: string | number | null;
  justification: string;
  reference_clauses: string[];
  reference_details?: { label: string; snippet: string }[];
}

export interface AnalyticsData {
  total_claims: number;
  approved_claims: number;
  rejected_claims: number;
  total_amount: number;
  claims_by_category: { category: string; count: number }[];
  claims_over_time: { date: string; approved: number; rejected: number }[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
}

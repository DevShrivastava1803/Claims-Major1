/*
  # Insurance Claim Processing System Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `name` (text) - Original filename
      - `file_url` (text) - Storage URL of the uploaded PDF
      - `file_size` (bigint) - File size in bytes
      - `status` (text) - Processing status: 'processing', 'completed', 'failed'
      - `summary` (text, nullable) - AI-generated summary of the document
      - `uploaded_at` (timestamptz) - Upload timestamp
      - `processed_at` (timestamptz, nullable) - Processing completion timestamp

    - `queries`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key) - Reference to documents table
      - `query_text` (text) - The user's natural language question
      - `decision` (text) - AI decision: 'approved' or 'rejected'
      - `claim_amount` (decimal, nullable) - Claimed amount if applicable
      - `justification` (text) - AI-generated reasoning for the decision
      - `policy_clauses` (text array) - Referenced policy clauses
      - `created_at` (timestamptz) - Query timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (demo application)
    
  3. Indexes
    - Add indexes on foreign keys and frequently queried columns
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  summary text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected')),
  claim_amount decimal(12, 2),
  justification text NOT NULL,
  policy_clauses text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_document_id ON queries(document_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_decision ON queries(decision);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo application)
CREATE POLICY "Allow public read access to documents"
  ON documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to documents"
  ON documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to documents"
  ON documents FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to documents"
  ON documents FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to queries"
  ON queries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to queries"
  ON queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to queries"
  ON queries FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to queries"
  ON queries FOR DELETE
  TO anon, authenticated
  USING (true);

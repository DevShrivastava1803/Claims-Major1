import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Sparkles, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '../hooks/useQuery';
import { supabaseService } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Query as QueryType } from '../types';

export const QueryPage = () => {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('docId') || '';
  const [queryText, setQueryText] = useState('');
  const [expandedClauses, setExpandedClauses] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryType[]>([]);
  const { loading, error, result, submitQuery } = useQuery();

  const sampleQueries = [
    'Is hospitalization covered under this policy?',
    'What is the claim process for dental treatment?',
    'Does the policy cover pre-existing conditions?',
    'What is the maximum claim amount allowed?',
  ];

  useEffect(() => {
    if (documentId) {
      loadQueryHistory();
    }
  }, [documentId]);

  const loadQueryHistory = async () => {
    try {
      const queries = await supabaseService.getQueriesByDocument(documentId);
      setQueryHistory(queries);
    } catch (err) {
      console.error('Failed to load query history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!documentId) {
      toast.error('No document selected. Please upload a document first.');
      return;
    }

    try {
      await submitQuery(queryText, documentId);
      setQueryText('');
      await loadQueryHistory();
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  const handleSampleQuery = (query: string) => {
    setQueryText(query);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Ask AI About Your Policy</h1>
          <p className="text-xl text-gray-600">
            Get instant answers about your insurance policy using natural language
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g., What is the coverage limit for medical expenses?"
                className="text-lg pr-24"
                disabled={loading}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                size="sm"
                isLoading={loading}
                disabled={!queryText.trim() || loading}
              >
                <Send size={18} />
                Ask AI
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center">Try asking:</span>
              {sampleQueries.map((query, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSampleQuery(query)}
                  className="text-xs px-3 py-1.5 bg-accent/30 hover:bg-accent/50 rounded-full transition-colors"
                  disabled={loading}
                >
                  {query}
                </button>
              ))}
            </div>
          </form>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-center justify-center space-x-3 text-secondary"
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-lg">AI is analyzing your question...</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-8"
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/20 to-background/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">AI Decision</CardTitle>
                      <p className="text-gray-600">{result.query_text}</p>
                    </div>
                    <Badge variant={result.decision === 'approved' ? 'success' : 'error'} className="text-lg px-4 py-2">
                      {result.decision === 'approved' ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 mr-2" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {result.claim_amount && (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Claim Amount</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(result.claim_amount)}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-lg mb-3">Justification</h4>
                    <div className="space-y-3 text-gray-700 leading-relaxed">
                      {toParagraphs(result.justification).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>

                  {(result.reference_details && result.reference_details.length > 0) || (result.policy_clauses && result.policy_clauses.length > 0) ? (
                    <div>
                      <button
                        onClick={() => setExpandedClauses(!expandedClauses)}
                        className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3 hover:text-secondary transition-colors"
                      >
                        <span>Referenced Policy Clauses ({(result.reference_details?.length || result.policy_clauses.length)})</span>
                        {expandedClauses ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>

                      <AnimatePresence>
                        {expandedClauses && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 overflow-hidden"
                          >
                            {(result.reference_details && result.reference_details.length > 0
                              ? result.reference_details.map((d, index) => (
                                  <div key={index} className="p-4 bg-accent/20 rounded-lg border border-accent">
                                    <div className="flex items-start justify-between">
                                      <p className="font-medium">{d.label}</p>
                                      <button className="text-xs text-secondary hover:underline flex items-center gap-1" onClick={() => copyText(`${d.label}: ${d.snippet}`)}>
                                        <Copy size={14} /> Copy
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">{d.snippet}</p>
                                  </div>
                                ))
                              : result.policy_clauses.map((clause, index) => (
                                  <div key={index} className="p-3 bg-accent/20 rounded-lg border border-accent">
                                    <p className="text-sm text-gray-700">{clause}</p>
                                  </div>
                                ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {queryHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Query History</h2>
            <div className="space-y-4">
              {queryHistory.map((query) => (
                <Card key={query.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-2">{query.query_text}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{query.justification}</p>
                    </div>
                    <Badge variant={query.decision === 'approved' ? 'success' : 'error'}>
                      {query.decision}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {!documentId && (
          <Card className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No document selected</p>
            <p className="text-gray-500 mb-6">Please upload a policy document first to start asking questions</p>
            <Button onClick={() => window.location.href = '/upload'}>
              Upload Document
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
  const toParagraphs = (text: string) => {
    try {
      const parts = text.split(/(?<=\.)\s+/).filter(Boolean);
      return parts.length > 1 ? parts : [text];
    } catch {
      return [text];
    }
  };

  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {}
  };

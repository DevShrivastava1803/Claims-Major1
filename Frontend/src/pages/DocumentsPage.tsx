import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Grid, List, Search, Trash2, Eye, RefreshCw, FileText, Calendar, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useDocuments } from '../hooks/useDocuments';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { Document } from '../types';

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const { documents, loading, deleteDocument, updateDocument } = useDocuments();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!docToDelete) return;

    try {
      await deleteDocument(docToDelete);
      toast.success('Document deleted successfully');
      setDeleteModalOpen(false);
      setDocToDelete(null);
      if (selectedDoc?.id === docToDelete) {
        setSelectedDoc(null);
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleReanalyze = async (doc: Document) => {
    try {
      await updateDocument(doc.id, { status: 'processing' });
      toast.success('Document reanalysis started');
    } catch (error) {
      toast.error('Failed to start reanalysis');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Document Explorer</h1>
              <p className="text-xl text-gray-600">
                Manage and explore your uploaded policy documents
              </p>
            </div>
            <Button onClick={() => navigate('/upload')}>
              Upload New Document
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
            </p>
            <Button onClick={() => navigate('/upload')}>
              Upload Document
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="w-10 h-10 text-secondary" />
                    <Badge variant={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-3 line-clamp-2">{doc.name}</CardTitle>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <HardDrive size={14} />
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  {doc.summary && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{doc.summary}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <FileText className="w-10 h-10 text-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title="Document Details"
          size="lg"
        >
          {selectedDoc && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">File Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedDoc.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatFileSize(selectedDoc.file_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={getStatusColor(selectedDoc.status)}>
                      {selectedDoc.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">
                      {format(new Date(selectedDoc.uploaded_at), 'PPpp')}
                    </span>
                  </div>
                  {selectedDoc.processed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed:</span>
                      <span className="font-medium">
                        {format(new Date(selectedDoc.processed_at), 'PPpp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDoc.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedDoc.summary}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    navigate(`/query?docId=${selectedDoc.id}`);
                    setSelectedDoc(null);
                  }}
                >
                  <Eye size={18} />
                  Query Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReanalyze(selectedDoc)}
                  disabled={selectedDoc.status === 'processing'}
                >
                  <RefreshCw size={18} />
                  Reanalyze
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDocToDelete(selectedDoc.id);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={18} />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDocToDelete(null);
          }}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDocToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

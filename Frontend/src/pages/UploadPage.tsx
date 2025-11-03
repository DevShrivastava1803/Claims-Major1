import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpload } from '../hooks/useUpload';
import { Button } from '../components/ui/Button';

export const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadProgress, uploadFile, resetUpload } = useUpload();
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        resetUpload();
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  }, [resetUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      const document = await uploadFile(file);
      toast.success('Document uploaded successfully!');
      setTimeout(() => {
        navigate(`/query?docId=${document.id}`);
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    resetUpload();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Upload Policy Document</h1>
          <p className="text-xl text-gray-600">
            Upload your insurance policy PDF to begin AI-powered claim analysis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-secondary bg-accent/20 scale-105'
                  : 'border-gray-300 hover:border-secondary hover:bg-accent/10'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Upload className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your PDF here'}
                </h3>
                <p className="text-gray-600 mb-4">or click to browse files</p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-accent/20 rounded-lg"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <FileText className="w-10 h-10 text-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {uploadProgress.status === 'idle' && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    aria-label="Remove file"
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </motion.div>

              {uploadProgress.status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{uploadProgress.message || 'Uploading...'}</span>
                    <span>{uploadProgress.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-secondary rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    {uploadProgress.status === 'uploading' && (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Uploading document...</span>
                      </>
                    )}
                    {uploadProgress.status === 'processing' && (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing with AI...</span>
                      </>
                    )}
                    {uploadProgress.status === 'success' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Upload complete!</span>
                      </>
                    )}
                    {uploadProgress.status === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">{uploadProgress.message}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {uploadProgress.status === 'idle' && (
                <Button
                  onClick={handleUpload}
                  className="w-full"
                  size="lg"
                >
                  Upload and Process Document
                </Button>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <h4 className="font-semibold mb-3">Supported Features:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>PDF documents up to 10MB</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>Automatic text extraction and analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>AI-powered policy understanding</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>Instant query capability after upload</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';

const DocumentUpload = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      setStatus('success');
      setFile(null);
      
      // Close after success
      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Upload Document</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm font-medium text-slate-600">
                  {file ? file.name : "Click or drag file to upload"}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, TXT, or Markdown</p>
              </div>

              {status === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg font-medium text-center">
                  ✅ Document indexed successfully!
                </div>
              )}
              
              {status === 'error' && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg font-medium text-center">
                  ❌ Upload failed. Please try again.
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
              >
                {uploading ? 'Indexing...' : 'Upload & Index'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DocumentUpload;
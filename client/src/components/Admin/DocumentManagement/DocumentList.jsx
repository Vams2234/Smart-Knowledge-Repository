import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDocuments(page);
  }, [page]);

  const fetchDocuments = async (pageNum) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/documents?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.totalPages);
      setTotalDocs(data.totalDocuments);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await fetch(`http://127.0.0.1:5000/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!scrapeUrl) return;

    setScraping(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/documents/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ url: scrapeUrl })
      });

      if (response.ok) {
        setScrapeUrl('');
        fetchDocuments(1); // Refresh list to first page
        alert('URL scraped successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to scrape URL');
      }
    } catch (error) {
      console.error('Scrape error:', error);
      alert('An error occurred while scraping');
    } finally {
      setScraping(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/documents/upload', {
        method: 'POST',
        // Note: Content-Type is automatically set for FormData
        body: formData
      });
      
      if (response.ok) {
        setUploadFile(null);
        document.getElementById('fileInput').value = '';
        fetchDocuments(1);
        alert('File uploaded successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading documents...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-[calc(100vh-65px)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Document Management</h1>
            <p className="text-slate-500 mt-1">Manage uploaded knowledge base files.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            <form onSubmit={handleUpload} className="flex gap-2 w-full md:w-auto">
              <input 
                id="fileInput"
                type="file" 
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button 
                type="submit" 
                disabled={uploading || !uploadFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 whitespace-nowrap"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>

            <form onSubmit={handleScrape} className="flex gap-2 w-full md:w-auto">
              <input 
                type="url" 
                placeholder="https://example.com/docs" 
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                required
              />
              <button 
                type="submit" 
                disabled={scraping}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 disabled:opacity-70 whitespace-nowrap"
              >
                {scraping ? 'Scraping...' : 'Scrape URL'}
              </button>
            </form>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
            Total Documents: {totalDocs}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 truncate max-w-md" title={doc.title}>{doc.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">
                      {doc.fileType === 'web/html' ? <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{doc.url}</a> : doc.originalName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 uppercase">{doc.fileType === 'web/html' ? 'WEB' : doc.fileType?.split('/')[1] || 'FILE'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{doc.metadata?.size ? (doc.metadata.size / 1024).toFixed(1) + ' KB' : '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {doc.fileType !== 'web/html' && (
                      <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">Download</button>
                    )}
                    <button onClick={() => handleDelete(doc.id)} className="text-rose-500 hover:text-rose-700 text-sm font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && <tr className="text-center text-slate-500"><td colSpan="5" className="py-8">No documents found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
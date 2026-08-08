import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { UploadDropzone } from '../../components/upload/UploadDropzone.jsx';
import { FilePreview } from '../../components/upload/FilePreview.jsx';
import { UploadProgress } from '../../components/upload/UploadProgress.jsx';
import { UploadHistory } from '../../components/upload/UploadHistory.jsx';
import { uploadService } from '../../services/uploadService.js';
import { 
  FiUploadCloud, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFileText, 
  FiDatabase, 
  FiBarChart2, 
  FiZap,
  FiArrowRight,
  FiShield
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const UploadCenter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('Uploading'); // Uploading | Processing | Completed | Failed
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadsList, setUploadsList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch upload history on load
  const fetchUploadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await uploadService.getUploads();
      if (response && response.data) {
        setUploadsList(response.data);
      } else if (Array.isArray(response)) {
        setUploadsList(response);
      }
    } catch (err) {
      console.error('Failed to load upload history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSuccessMessage('');
    setErrorMessage('');
    setUploadProgress(0);
  };

  const handleRemoveSelectedFile = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadStatus('Uploading');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Perform upload with real progress callback
      const result = await uploadService.uploadFile(selectedFile, (progress) => {
        setUploadProgress(Math.min(progress, 90));
      });

      // Switch status to Processing
      setUploadProgress(95);
      setUploadStatus('Processing');

      // Brief artificial delay for smooth UX transition to Completed
      setTimeout(() => {
        setUploadProgress(100);
        setUploadStatus('Completed');
        setSuccessMessage(`File "${selectedFile.name}" successfully uploaded and registered in database!`);
        
        // Reset selected file & reload history
        setSelectedFile(null);
        setUploading(false);
        fetchUploadHistory();
      }, 700);

    } catch (error) {
      console.error('Upload Error:', error);
      setUploadStatus('Failed');
      setUploading(false);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload file. Please check server connection.'
      );
    }
  };

  const handleDeleteFile = async (id) => {
    try {
      await uploadService.deleteUpload(id);
      setUploadsList(prev => prev.filter(u => (u._id !== id && u.id !== id)));
      setSuccessMessage('File record deleted successfully.');
    } catch (err) {
      console.error('Delete File Error:', err);
      setErrorMessage('Failed to delete file. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Upload Center">
      <div className="space-y-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-slate-800">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                <HiSparkles size={14} className="text-indigo-400" /> BizMind Data Processing Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Upload Center & Document Ingestion
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Seamlessly upload financial statements, sales reports, operational expenses, PDFs, and invoices.
              </p>
            </div>

            {/* Micro Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-slate-400">Total Uploads</p>
                <p className="text-lg font-bold text-white mt-0.5">{uploadsList.length}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-slate-400">Accepted Formats</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">CSV, Excel, PDF, Image</p>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-slate-400">System Readiness</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toast / Feedback */}
        {successMessage && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm font-medium shadow-sm">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-emerald-500 shrink-0" size={20} />
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-sm font-medium shadow-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-rose-500 shrink-0" size={20} />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Workspace Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiUploadCloud className="text-indigo-600 dark:text-indigo-400" />
              <span>File Ingestion Workspace</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select or drop your business records below to start file validation and processing
            </p>
          </div>

          {/* Dropzone */}
          <UploadDropzone
            onFileSelected={handleFileSelected}
            disabled={uploading}
          />

          {/* File Preview */}
          {selectedFile && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected File for Upload
              </h4>

              <FilePreview 
                file={selectedFile} 
                onRemove={handleRemoveSelectedFile}
                uploading={uploading}
              />

              {uploading && (
                <UploadProgress 
                  progress={uploadProgress} 
                  status={uploadStatus} 
                  fileName={selectedFile.name} 
                />
              )}

              {!uploading && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleStartUpload}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                  >
                    <FiUploadCloud size={18} />
                    <span>Upload & Process File</span>
                    <FiArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Uploads Table */}
        <UploadHistory
          uploads={uploadsList}
          onDelete={handleDeleteFile}
          onRefresh={fetchUploadHistory}
          loading={loadingHistory}
        />

        {/* Security & System Info Footer */}
        <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <FiShield className="text-indigo-500" size={16} />
            <span>All uploads are encrypted in transit and stored safely in isolated workspace storage.</span>
          </div>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            BizMind AI Engine v2.5
          </span>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UploadCenter;

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { FileDropzone } from '../../components/upload/FileDropzone.jsx';
import { UploadList } from '../../components/upload/UploadList.jsx';
import { ProcessingProgress } from '../../components/upload/ProcessingProgress.jsx';
import { useUpload } from '../../hooks/useUpload.js';
import { Alert } from '../../components/common/Alert.jsx';
import { uploadService } from '../../services/uploadService.js';

export const UploadPage = () => {
  const { upload, uploading, progress, result, error } = useUpload();
  const [currentFile, setCurrentFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const refreshHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await uploadService.getHistory();
      const items = res?.data?.data || res?.data || [];
      setHistory(Array.isArray(items) ? items : []);
    } catch (e) {
      console.warn('Failed to load upload history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    try {
      await upload(file);
      await refreshHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await uploadService.deleteUpload(id);
      await refreshHistory();
    } catch (e) {
      console.error('Failed to delete upload', e);
    }
  };

  const recordsCount = result?.recordsProcessed ?? result?.summary?.total ?? 0;
  const fileName = result?.originalName || currentFile?.name;

  return (
    <DashboardLayout title="Upload Data & Intelligence Processing">
      <div className="space-y-6">
        <FileDropzone onFileSelect={handleFileSelect} uploading={uploading} />

        {uploading && <ProcessingProgress progress={progress} fileName={currentFile?.name} />}

        {error && <Alert type="error" message={error} />}

        {result && (
          <Alert
            type="success"
            message={`File "${fileName}" successfully processed! Extracted ${recordsCount} data entries.`}
          />
        )}

        <UploadList uploads={history} loading={historyLoading} onDelete={handleDelete} />
      </div>
    </DashboardLayout>
  );
};

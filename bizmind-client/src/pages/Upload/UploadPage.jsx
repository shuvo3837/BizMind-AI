import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { FileDropzone } from '../../components/upload/FileDropzone.jsx';
import { UploadList } from '../../components/upload/UploadList.jsx';
import { ProcessingProgress } from '../../components/upload/ProcessingProgress.jsx';
import { useUpload } from '../../hooks/useUpload.js';
import { Alert } from '../../components/common/Alert.jsx';

export const UploadPage = () => {
  const { upload, uploading, progress, result } = useUpload();
  const [currentFile, setCurrentFile] = useState(null);

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    try {
      await upload(file);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout title="Upload Data & Intelligence Processing">
      <div className="space-y-6">
        <FileDropzone onFileSelect={handleFileSelect} uploading={uploading} />

        {uploading && <ProcessingProgress progress={progress} fileName={currentFile?.name} />}

        {result && (
          <Alert type="success" message={`File "${result.originalName}" successfully processed! Extracted ${result.recordsCount} data entries.`} />
        )}

        <UploadList />
      </div>
    </DashboardLayout>
  );
};

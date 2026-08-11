import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { FileDropzone } from '../../components/upload/FileDropzone.jsx';
import { UploadList } from '../../components/upload/UploadList.jsx';
import { ProcessingProgress } from '../../components/upload/ProcessingProgress.jsx';
import { useUpload } from '../../hooks/useUpload.js';
import { Alert } from '../../components/common/Alert.jsx';
import { uploadService } from '../../services/uploadService.js';
import { analyticsService } from '../../services/analyticsService.js';
import { reportService } from '../../services/reportService.js';

export const UploadPage = () => {
  const { upload, uploading, progress, result, error } = useUpload();
  const [currentFile, setCurrentFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [busyActionId, setBusyActionId] = useState(null);

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

  const handleViewAnalysis = async (id) => {
    setBusyActionId(id);
    setActionMessage(null);
    try {
      const res = await analyticsService.getDatasetData(id);
      const payload = res?.data || res;
      const summary = payload?.kpis ? `Revenue: $${Number(payload.kpis.revenue || 0).toLocaleString()} • Profit: $${Number(payload.kpis.profit || 0).toLocaleString()}` : 'Dataset examined successfully.';
      setActionMessage({ type: 'success', text: `Analysis ready for ${payload?.dataset?.fileName || 'selected dataset'} — ${summary}` });
    } catch (e) {
      setActionMessage({ type: 'error', text: e?.message || 'Unable to load dataset analysis.' });
    } finally {
      setBusyActionId(null);
    }
  };

  const handleGenerateReport = async (id) => {
    setBusyActionId(id);
    setActionMessage(null);
    try {
      const res = await reportService.generateDatasetReport(id, { title: 'Dataset Report' });
      const payload = res?.data || res;
      setActionMessage({ type: 'success', text: payload?.title ? `Report created: ${payload.title}` : 'Dataset report generated successfully.' });
      await refreshHistory();
    } catch (e) {
      setActionMessage({ type: 'error', text: e?.message || 'Unable to generate report for dataset.' });
    } finally {
      setBusyActionId(null);
    }
  };

  const recordsCount = result?.recordsProcessed ?? result?.summary?.total ?? 0;
  const fileName = result?.fileName || result?.originalName || currentFile?.name;
  const autoReport = result?.autoReport || result?.data?.autoReport;
  const uploadMessage = (() => {
    if (autoReport && (autoReport.id || autoReport.title)) {
      const rev = Number(autoReport.totalRevenue || 0).toLocaleString();
      const profit = Number(autoReport.totalProfit || 0).toLocaleString();
      return `File "${fileName}" processed (${recordsCount} records). Report ready — Revenue $${rev}, Profit $${profit}.`;
    }
    return result?.message || (result?.success ? 'Upload completed.' : null);
  })();

  return (
    <DashboardLayout title="Upload Data & Intelligence Processing">
      <div className="space-y-6">
        <FileDropzone onFileSelect={handleFileSelect} uploading={uploading} />

        {uploading && <ProcessingProgress progress={progress} fileName={currentFile?.name} />}

        {error && <Alert type="error" message={error} />}

        {result && (
          <Alert
            type="success"
            message={uploadMessage || `File "${fileName}" successfully processed! Extracted ${recordsCount} data entries.`}
          />
        )}

        {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} />}

        <UploadList
          uploads={history}
          loading={historyLoading}
          onDelete={handleDelete}
          onViewAnalysis={handleViewAnalysis}
          onGenerateReport={handleGenerateReport}
          busyActionId={busyActionId}
        />
      </div>
    </DashboardLayout>
  );
};

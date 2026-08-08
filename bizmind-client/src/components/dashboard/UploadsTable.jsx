import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFile, FiFileText, FiImage, FiDownload, FiTrash2, FiEye, FiCheckCircle, FiClock, FiSearch, FiFilter, FiUpload } from 'react-icons/fi';
import { uploadService } from '../../services/uploadService.js';
import { formatDate, formatFileSize } from '../../utils/formatters.js';

export const UploadsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalFile, setModalFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploadsList = async () => {
    setLoading(true);
    try {
      const res = await uploadService.getUploads();
      if (res?.data) {
        setUploads(res.data);
      }
    } catch (err) {
      console.error('Failed to load uploads history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadsList();
  }, []);

  const handleDelete = async (id) => {
    try {
      await uploadService.deleteUpload(id);
      setUploads((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      console.error('Failed to delete upload:', err);
    }
  };

  const getFileIcon = (type = '') => {
    const t = (type || '').toUpperCase();
    if (t.includes('PDF')) return <FiFileText className="text-rose-500" size={18} />;
    if (t.includes('EXCEL') || t.includes('XLS') || t.includes('CSV')) return <FiFile className="text-emerald-500" size={18} />;
    if (t.includes('IMAGE') || t.includes('PNG') || t.includes('JPG')) return <FiImage className="text-blue-500" size={18} />;
    return <FiFile className="text-indigo-500" size={18} />;
  };

  const filteredUploads = uploads.filter((file) => {
    const name = file.originalName || file.fileName || file.name || '';
    const type = file.fileType || file.type || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (file.status || 'Completed').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Data Uploads</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Documents ingested and parsed by the BizMind AI engine</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-48">
            <FiSearch size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
            <FiFilter size={12} className="text-slate-400 ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-medium outline-none py-0.5 pr-1"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-3 px-3">File Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Upload Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {filteredUploads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FiUpload className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No business files uploaded yet</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">Upload your sales ledger, CSV, or Excel spreadsheets to parse metrics into database.</p>
                    <Link to="/upload" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors">
                      <FiUpload size={14} /> Upload Data
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUploads.map((file) => {
                const fileId = file._id || file.id;
                const fileName = file.originalName || file.fileName || file.name;
                const fileType = file.fileType || 'Document';
                const fileSize = file.fileSize ? formatFileSize(file.fileSize) : (file.size || 'N/A');
                const uploadDate = file.uploadedAt || file.createdAt ? formatDate(file.uploadedAt || file.createdAt) : (file.date || 'Recent');
                const status = file.status || 'Completed';

                return (
                  <tr key={fileId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getFileIcon(fileType)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setModalFile(file)}>
                            {fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">{fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{fileType}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{uploadDate}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {status.toLowerCase() === 'completed' || status.toLowerCase() === 'processed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <FiCheckCircle size={12} /> Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          <span className="inline-block animate-spin rounded-full h-2 w-2 border-2 border-indigo-600 border-t-transparent" /> Processing
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalFile(file)}
                          title="View File Summary"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(fileId)}
                          title="Delete File"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* File Inspector Modal */}
      {modalFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {getFileIcon(modalFile.fileType)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{modalFile.originalName || modalFile.fileName}</h4>
                  <p className="text-xs text-slate-500">{modalFile.fileType} • {modalFile.fileSize ? formatFileSize(modalFile.fileSize) : 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setModalFile(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Parsed Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{modalFile.status || 'Completed'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Uploaded Date:</span>
                <span>{modalFile.uploadedAt || modalFile.createdAt ? formatDate(modalFile.uploadedAt || modalFile.createdAt) : 'Recent'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Extracted Summary:</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  {modalFile.extractedData?.summary || `File parsed into database. Generated verified transaction records for analytics calculations.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalFile(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadsTable;

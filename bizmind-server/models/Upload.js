import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    _id: { type: String },
    uploadId: { type: String },
    businessId: { type: String, default: 'biz_default_101', index: true },
    userId: { type: String, default: 'usr_default_101' },
    fileName: { type: String, required: true },
    filename: { type: String },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    fileSize: { type: Number, required: true },
    sizeBytes: { type: Number },
    filePath: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Uploading', 'Processing', 'Completed', 'Failed', 'uploaded', 'processing', 'completed', 'failed'], 
      default: 'Completed' 
    },
    processingStatus: { type: String, default: 'Ready' },
    extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    recordsCount: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

uploadSchema.pre('save', function (next) {
  if (!this.filename) this.filename = this.fileName;
  if (!this.sizeBytes) this.sizeBytes = this.fileSize;
  if (!this.uploadedAt) this.uploadedAt = this.createdAt || new Date();
  next();
});

export default mongoose.models.Upload || mongoose.model('Upload', uploadSchema);

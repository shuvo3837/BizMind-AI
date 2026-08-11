import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
    detectedDataTypes: { type: [String], default: [] },
    recordsProcessed: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

uploadSchema.index({ userId: 1, businessId: 1 });
uploadSchema.index({ userId: 1, businessId: 1, createdAt: -1 });

export default mongoose.models.Upload || mongoose.model('Upload', uploadSchema);

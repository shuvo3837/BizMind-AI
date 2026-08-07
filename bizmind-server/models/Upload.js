import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    recordsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['uploaded', 'processing', 'completed', 'failed'], default: 'uploaded' },
    summary: { type: String, default: '' },
    filePath: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Upload || mongoose.model('Upload', uploadSchema);

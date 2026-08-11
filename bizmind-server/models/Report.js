import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    reportType: { type: String, enum: ['Executive Summary', 'Financial Performance', 'Sales Analysis', 'Inventory Audit', 'Custom AI Report'], default: 'Executive Summary' },
    period: { type: String, default: 'monthly' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiInsights: { type: String, default: '' },
    sections: [{
      heading: String,
      content: String,
      keyTakeaways: [String]
    }],
    downloadUrl: { type: String, default: '' },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' }
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, businessId: 1 });
reportSchema.index({ userId: 1, businessId: 1, createdAt: -1 });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);

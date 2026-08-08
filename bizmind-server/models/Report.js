import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    businessId: { type: String, default: 'biz_default_101' },
    reportName: { type: String, required: true },
    title: { type: String }, // Backwards compatibility
    reportType: { 
      type: String, 
      enum: ['Executive Summary', 'Financial Performance', 'Sales Analysis', 'Inventory Audit', 'Custom AI Report'], 
      default: 'Executive Summary' 
    },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    summary: { type: String, default: '' },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    insights: { type: mongoose.Schema.Types.Mixed, default: [] },
    recommendations: { type: mongoose.Schema.Types.Mixed, default: [] },
    filePath: { type: String, default: '' },
    downloadUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

reportSchema.pre('save', function (next) {
  if (!this.title) this.title = this.reportName;
  if (!this.downloadUrl && this.filePath) this.downloadUrl = this.filePath;
  next();
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);

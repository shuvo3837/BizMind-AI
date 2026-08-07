import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    reportType: { type: String, enum: ['Executive Summary', 'Financial Performance', 'Sales Analysis', 'Inventory Audit', 'Custom AI Report'], default: 'Executive Summary' },
    summary: { type: String, default: '' },
    sections: [{
      heading: String,
      content: String,
      keyTakeaways: [String]
    }],
    downloadUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model('Report', reportSchema);

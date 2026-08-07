import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    period: { type: String, default: 'monthly' }, // daily, weekly, monthly
    totalRevenue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    grossMargin: { type: Number, default: 0 },
    customerGrowthRate: { type: Number, default: 0 },
    keyMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    insights: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    date: { type: Date, default: Date.now, index: true },
    productId: { type: String, default: null },
    productName: { type: String, required: true, trim: true, index: true },
    sku: { type: String, default: null, index: true },
    customer: { type: String, default: null, index: true },
    category: { type: String, default: 'General', index: true },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    cost: { type: Number, default: null },
    profit: { type: Number, default: null },
  },
  { timestamps: true }
);

saleSchema.index({ businessId: 1, date: -1 });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);

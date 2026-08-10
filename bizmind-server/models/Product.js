import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: 'General', index: true },
    sku: { type: String, default: null, index: true },
    price: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    totalUnitsSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

productSchema.index({ businessId: 1, name: 1, category: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, index: true },
    uploadId: { type: String, index: true },
    sku: { type: String, default: '' },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    totalUnitsSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);

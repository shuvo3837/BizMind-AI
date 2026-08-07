import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);

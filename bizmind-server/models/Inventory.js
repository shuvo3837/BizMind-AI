import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    productId: { type: String, default: null },
    productName: { type: String, required: true, trim: true, index: true },
    sku: { type: String, default: null, index: true },
    category: { type: String, default: 'General', index: true },
    quantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: null },
    unitCost: { type: Number, default: 0 },
    inventoryValue: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inventorySchema.index({ businessId: 1, productName: 1, sku: 1 });
inventorySchema.index({ userId: 1, businessId: 1 });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

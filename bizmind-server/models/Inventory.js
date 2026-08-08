import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, index: true },
    uploadId: { type: String, index: true },
    productId: { type: String },
    productName: { type: String },
    category: { type: String, default: 'General' },
    warehouseLocation: { type: String, default: 'Primary Warehouse' },
    currentStock: { type: Number, required: true, default: 0 },
    reservedStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    unitCost: { type: Number, default: 0 },
    lastRestockDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['optimal', 'low_stock', 'out_of_stock', 'Healthy', 'Low Stock', 'Out of Stock'], default: 'optimal' }
  },
  { timestamps: true }
);

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

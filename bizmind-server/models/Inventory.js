import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    warehouseLocation: { type: String, default: 'Primary Warehouse' },
    currentStock: { type: Number, required: true },
    reservedStock: { type: Number, default: 0 },
    lastRestockDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['optimal', 'low_stock', 'out_of_stock'], default: 'optimal' }
  },
  { timestamps: true }
);

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    businessId: { type: String, default: 'biz_default_101' },
    uploadId: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    productName: { type: String, required: true },
    category: { type: String, default: 'General' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    stockAfterSale: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-calculate profit if missing
saleSchema.pre('save', function (next) {
  if (this.revenue !== undefined && this.cost !== undefined && (!this.profit || this.profit === 0)) {
    this.profit = this.revenue - this.cost;
  }
  if (this.quantity > 0 && this.revenue > 0 && (!this.unitPrice || this.unitPrice === 0)) {
    this.unitPrice = this.revenue / this.quantity;
  }
  next();
});

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);

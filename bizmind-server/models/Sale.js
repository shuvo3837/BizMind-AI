import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, default: Date.now },
    productName: { type: String, required: true },
    category: { type: String, default: 'General' },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Credit Card' },
    customerRegion: { type: String, default: 'Domestic' }
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);

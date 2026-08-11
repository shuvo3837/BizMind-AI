import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    date: { type: Date, default: Date.now, index: true },
    category: { type: String, default: 'General', index: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

expenseSchema.index({ businessId: 1, date: -1 });
expenseSchema.index({ userId: 1, businessId: 1 });
expenseSchema.index({ userId: 1, businessId: 1, date: -1 });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

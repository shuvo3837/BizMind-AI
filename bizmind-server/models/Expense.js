import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, index: true },
    uploadId: { type: String, index: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending'], default: 'paid' }
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true }, // e.g., Payroll, Marketing, Logistics, Utilities
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending'], default: 'paid' }
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

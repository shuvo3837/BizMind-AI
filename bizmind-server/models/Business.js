import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, default: 'General Retail' },
    currency: { type: String, default: 'USD' },
    monthlyTarget: { type: Number, default: 50000 },
    employeesCount: { type: Number, default: 5 },
    website: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.Business || mongoose.model('Business', businessSchema);

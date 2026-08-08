import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    businessId: { type: String, sparse: true, index: true },
    ownerId: { type: String, required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    industry: { type: String, default: 'General Retail' },
    businessType: { type: String, default: 'Retail' },
    country: { type: String, default: 'United States' },
    currency: { type: String, default: 'USD' },
    monthlyTarget: { type: Number, default: 50000 },
    employeesCount: { type: Number, default: 5 },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' }
  },
  { timestamps: true }
);

businessSchema.pre('save', function (next) {
  if (!this.businessName && this.companyName) this.businessName = this.companyName;
  if (!this.companyName && this.businessName) this.companyName = this.businessName;
  if (!this.businessId) this.businessId = this._id ? this._id.toString() : 'biz_' + Date.now();
  next();
});

export default mongoose.models.Business || mongoose.model('Business', businessSchema);

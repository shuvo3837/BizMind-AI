import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner', 'analyst', 'viewer'], default: 'owner' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);

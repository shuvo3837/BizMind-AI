import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'analyst', 'viewer'], default: 'owner' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null, index: true },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.models.User || mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const chatHistorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionTitle: { type: String, default: 'BI Strategy Session' },
    messages: [chatMessageSchema]
  },
  { timestamps: true }
);

chatHistorySchema.index({ userId: 1, businessId: 1, sessionId: 1 });

export default mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

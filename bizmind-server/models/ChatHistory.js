import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const chatHistorySchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    sessionTitle: { type: String, default: 'BI Strategy Session' },
    messages: [chatMessageSchema]
  },
  { timestamps: true }
);

export default mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

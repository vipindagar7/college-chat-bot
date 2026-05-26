import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  widgetId: { type: String, default: 'default' },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });
export default mongoose.model('ChatSession', schema);

import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'bot'], required: true },
  message: { type: String, required: true },
  intent: { type: String },
}, { timestamps: true });
export default mongoose.model('Message', schema);

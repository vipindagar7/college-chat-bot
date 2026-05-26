import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String },
  courseInterest: { type: String },
  qualification: { type: String },
  city: { type: String },
  state: { type: String },
  passingYear: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'lost'], default: 'new' },
  notes: { type: String },
}, { timestamps: true });
export default mongoose.model('Lead', schema);

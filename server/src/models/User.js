import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  passwordHash: { type: String },
}, { timestamps: true });
export default mongoose.model('User', userSchema);

import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import OtpVerification from '../models/OtpVerification.js';
import { sendOTP } from '../utils/sendOtp.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtpHandler = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Valid name required' });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'Valid 10-digit Indian mobile number required' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

    await OtpVerification.deleteMany({ phone });
    await OtpVerification.create({ phone, otp, expiresAt });
    await User.findOneAndUpdate({ phone }, { name: name.trim(), phone }, { upsert: true, new: true });

    await sendOTP(phone, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Try again.' });
  }
};

export const verifyOtpHandler = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'Valid phone required' });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Valid 6-digit OTP required' });

    const record = await OtpVerification.findOne({ phone, verified: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    if (record.attempts >= 5) return res.status(400).json({ error: 'Too many attempts. Request a new OTP.' });
    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
      await OtpVerification.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      return res.status(400).json({ error: `Incorrect OTP. ${4 - record.attempts} attempts remaining.` });
    }

    await OtpVerification.findByIdAndUpdate(record._id, { verified: true });
    const user = await User.findOneAndUpdate({ phone }, { isVerified: true }, { new: true });

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Verification failed. Try again.' });
  }
};

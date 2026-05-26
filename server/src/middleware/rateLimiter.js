import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Too many OTP requests. Please wait 1 minute.' },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Sending messages too fast. Please slow down.' },
});

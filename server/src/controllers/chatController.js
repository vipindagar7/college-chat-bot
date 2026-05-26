import { v4 as uuidv4 } from 'uuid';
import ChatSession from '../models/ChatSession.js';
import Message from '../models/Message.js';
import Lead from '../models/Lead.js';
import { getBotResponse } from '../services/botEngine.js';

export const startSession = async (req, res) => {
  try {
    const { widgetId = 'default' } = req.body;
    const sessionId = uuidv4();
    await ChatSession.create({ sessionId, userId: req.user._id, widgetId });
    res.json({ success: true, sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
    if (message.length > 500) return res.status(400).json({ error: 'Message too long' });

    const session = await ChatSession.findOne({ sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Save user message
    await Message.create({ sessionId, role: 'user', message: message.trim() });

    // Get bot response
    const response = getBotResponse(message.trim());

    // Save bot message
    await Message.create({ sessionId, role: 'bot', message: response.text });

    // Update session
    await ChatSession.findOneAndUpdate({ sessionId }, { lastActivity: new Date() });

    res.json({ success: true, reply: response.text, type: response.type, data: response.courses || null });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
};

export const saveLead = async (req, res) => {
  try {
    const { sessionId, courseInterest, qualification, city, state, passingYear } = req.body;
    const existing = await Lead.findOne({ userId: req.user._id });
    if (existing) {
      await Lead.findByIdAndUpdate(existing._id, { courseInterest, qualification, city, state, passingYear });
    } else {
      await Lead.create({ userId: req.user._id, sessionId, courseInterest, qualification, city, state, passingYear });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save lead' });
  }
};

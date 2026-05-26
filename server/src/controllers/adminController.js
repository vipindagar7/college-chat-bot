import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import ChatSession from '../models/ChatSession.js';
import Message from '../models/Message.js';

export const adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: 'admin' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, phone: user.phone, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, phone, password, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SECRET_KEY) return res.status(403).json({ error: 'Invalid secret key' });
    const hash = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ phone }, { name, phone, passwordHash: hash, role: 'admin', isVerified: true }, { upsert: true });
    res.json({ success: true, message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalLeads, totalUsers, totalSessions, newLeads, converted] = await Promise.all([
      Lead.countDocuments(),
      User.countDocuments({ role: 'student', isVerified: true }),
      ChatSession.countDocuments(),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'converted' }),
    ]);
    res.json({ success: true, stats: { totalLeads, totalUsers, totalSessions, newLeads, converted } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

export const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    let leads = await Lead.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (search) {
      const s = search.toLowerCase();
      leads = leads.filter(l =>
        l.userId?.name?.toLowerCase().includes(s) ||
        l.userId?.phone?.includes(s) ||
        l.courseInterest?.toLowerCase().includes(s)
      );
    }

    const total = await Lead.countDocuments(query);
    res.json({ success: true, leads, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leads' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndUpdate(id, req.body, { new: true }).populate('userId', 'name phone');
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const sessions = await ChatSession.find()
      .populate('userId', 'name phone')
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ChatSession.countDocuments();
    res.json({ success: true, sessions, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Export accepts token via query param so browser can download directly
export const exportLeads = async (req, res) => {
  try {
    // Verify token from query string (Authorization header not possible for direct downloads)
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'Token required. Use the Export button in the admin panel.' });
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const leads = await Lead.find().populate('userId', 'name phone').sort({ createdAt: -1 });
    const csv = [
      'Name,Phone,Course Interest,Qualification,City,State,Passing Year,Status,Date',
      ...leads.map(l =>
        `"${l.userId?.name || ''}","${l.userId?.phone || ''}","${l.courseInterest || ''}","${l.qualification || ''}","${l.city || ''}","${l.state || ''}","${l.passingYear || ''}","${l.status}","${new Date(l.createdAt).toLocaleDateString('en-IN')}"`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${new Date().toISOString().slice(0,10)}.csv`);
    res.send('\uFEFF' + csv); // BOM prefix so Excel opens UTF-8 correctly
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

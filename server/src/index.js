import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], frameAncestors: ['*'] } } }));

const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5174').split(',');
app.use(cors({ origin: (o, cb) => (!o || origins.includes(o) || origins.includes('*')) ? cb(null, true) : cb(new Error('CORS')), credentials: true }));

app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);

// Serve widget.js
app.get('/widget.js', (_, res) => {
  try {
    const widgetPath = join(__dirname, '../widget/widget.js');

    console.log('Widget path:', widgetPath);

    const file = readFileSync(widgetPath, 'utf-8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send(file);
  } catch (err) {
    console.error(err);

    res.status(404).send('// Widget not found');
  }
});

// Public college config (theme only — no sensitive data)
app.get('/config', (req, res) => {
  try {
    const data = JSON.parse(readFileSync(join(__dirname, './data/college-data.json'), 'utf-8'));
    res.json({ theme: data.theme, college: { name: data.college.name, phone: data.college.phone } });
  } catch {
    res.status(500).json({ error: 'Config error' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('*', (_, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🤖 Bot engine: rule-based (no AI API needed)`);
  console.log(`📋 Admin: POST /api/admin/create to set up admin user`);
});

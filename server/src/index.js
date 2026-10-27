import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs/promises';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import inquiryRoutes from './routes/inquiries.js';
import productRoutes from './routes/products.js';

const uploadsDirectory = path.resolve('uploads');
await fs.mkdir(uploadsDirectory, { recursive: true }).catch(() => {});

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB database successfully.');
} catch (mongoError) {
  console.error('\n======================================================');
  console.error('❌ MongoDB Connection Error!');
  console.error('Make sure MongoDB is installed & running locally (or use MongoDB Atlas URI in server/.env).');
  console.error('Command to start local MongoDB: net start MongoDB');
  console.error('======================================================\n');
  throw mongoError;
}
const app = express();
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: [process.env.CLIENT_ORIGIN, 'http://localhost:4200', 'http://127.0.0.1:4200'], methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/products', productRoutes);

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(uploadsDirectory));
app.use((req, res) => res.status(404).json({ message: 'Not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid inquiry ID.' });
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Jay Bhavani API listening on port ${port}`));

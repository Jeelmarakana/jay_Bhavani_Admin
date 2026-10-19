import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error('Set MONGODB_URI, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in .env.');
}

await mongoose.connect(MONGODB_URI);
const email = ADMIN_EMAIL.trim().toLowerCase();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true, runValidators: true });
console.log(`Admin account ready for ${email}`);
await mongoose.disconnect();

import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { rateLimit } from 'express-rate-limit';
import Inquiry from '../models/Inquiry.js';
import { requireAdmin } from '../middleware/auth.js';
import { acceptReferenceImage, uploadDirectory } from '../middleware/upload.js';

const router = Router();
const submissionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many inquiries. Please try again later.' }
});

router.post('/', submissionLimit, acceptReferenceImage, async (req, res, next) => {
  try {
    const clientName = String(req.body.clientName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const productName = String(req.body.productName || '').trim();
    const message = String(req.body.message || '').trim();
    const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!clientName || clientName.length > 100 || !phone || phone.length > 30 ||
      !productName || productName.length > 120 || !message || message.length > 2000 || !emailValid) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Please check the required fields and email address.' });
    }

    const inquiry = await Inquiry.create({
      clientName, phone, email, productName, message,
      referenceImageName: req.file?.filename || null
    });
    return res.status(201).json({ message: 'Your inquiry has been sent successfully.', id: inquiry.id });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return next(error);
  }
});

router.use('/admin', requireAdmin);

router.get('/admin/dashboard', async (_req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [total, fresh, contacted, closed, today] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments({ status: 'contacted' }),
      Inquiry.countDocuments({ status: 'closed' }),
      Inquiry.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);
    return res.json({ total, new: fresh, contacted, closed, today });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/inquiries', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (['new', 'contacted', 'closed'].includes(req.query.status)) filter.status = req.query.status;
    const from = req.query.from ? new Date(`${req.query.from}T00:00:00.000Z`) : null;
    const to = req.query.to ? new Date(`${req.query.to}T00:00:00.000Z`) : null;
    if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
      return res.status(400).json({ message: 'Invalid date filter.' });
    }
    if (from && to && from > to) return res.status(400).json({ message: 'Start date must not be after end date.' });
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lt = new Date(to.getTime() + 24 * 60 * 60 * 1000);
    }
    if (req.query.search) {
      const search = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['clientName', 'phone', 'productName', 'email'].map((field) => ({
        [field]: { $regex: search, $options: 'i' }
      }));
    }

    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .select('-referenceImageName -adminNote').lean(),
      Inquiry.countDocuments(filter)
    ]);
    return res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/inquiries/:id', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).lean();
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
    const { referenceImageName, ...details } = inquiry;
    return res.json({ ...details, hasReferenceImage: Boolean(referenceImageName) });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/inquiries/:id/image', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).select('referenceImageName').lean();
    if (!inquiry?.referenceImageName) return res.status(404).json({ message: 'This inquiry has no reference image.' });
    return res.sendFile(path.join(uploadDirectory, path.basename(inquiry.referenceImageName)), (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/admin/inquiries/:id', async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status !== undefined) {
      if (!['new', 'contacted', 'closed'].includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid inquiry status.' });
      }
      update.status = req.body.status;
    }
    if (req.body.adminNote !== undefined) {
      if (typeof req.body.adminNote !== 'string' || req.body.adminNote.length > 2000) {
        return res.status(400).json({ message: 'Admin note must be 2000 characters or fewer.' });
      }
      update.adminNote = req.body.adminNote.trim();
    }
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select('-referenceImageName');
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
    return res.json(inquiry);
  } catch (error) {
    return next(error);
  }
});

router.delete('/admin/inquiries/:id', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
    if (inquiry.referenceImageName) {
      await fs.unlink(path.join(uploadDirectory, path.basename(inquiry.referenceImageName))).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

export default router;

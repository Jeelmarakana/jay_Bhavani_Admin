import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import Product from '../models/Product.js';

const uploadDirectory = path.resolve('uploads');
await fs.mkdir(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  }
});

export const productMulterUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPG, PNG, and WebP images are accepted.'));
    }
    return callback(null, true);
  }
});

const productImageUpload = async (req, res, next) => {
  productMulterUpload.single('image')(req, res, async (error) => {
    if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
      .json({ message: error.message });
    if (!req.file) return next();

    try {
      const detected = await fileTypeFromFile(req.file.path);
      if (!detected || !allowedMimeTypes.has(detected.mime)) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: 'The uploaded file is not a valid JPG, PNG, or WebP image.' });
      }
      const safeFilename = `${randomUUID()}.${detected.ext}`;
      await fs.rename(req.file.path, path.join(uploadDirectory, safeFilename));
      req.file.filename = safeFilename;
      req.file.path = path.join(uploadDirectory, safeFilename);
      return next();
    } catch (validationError) {
      await fs.unlink(req.file.path).catch(() => {});
      return next(validationError);
    }
  });
};

const router = Router();

router.post('/', productImageUpload, async (req, res, next) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name || price === undefined || price === null || price === '') {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Name and price are required.' });
    }
    const product = await Product.create({
      name: String(name).trim(),
      description: String(description || '').trim(),
      price: Number(price),
      category: String(category || '').trim(),
      images: req.file ? [req.file.filename] : []
    });
    const doc = product.toObject ? product.toObject() : product;
    return res.status(201).json({
      message: 'Product added successfully.',
      product: {
        ...doc,
        image: doc.images && doc.images.length > 0 ? doc.images[0] : null
      }
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).select('-__v').lean();
    const formatted = products.map((p) => ({
      ...p,
      image: p.images && p.images.length > 0 ? p.images[0] : null
    }));
    return res.json(formatted);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v').lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : null
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', productImageUpload, async (req, res, next) => {
  try {
    const update = {};
    if (req.body.name !== undefined) update.name = String(req.body.name).trim();
    if (req.body.description !== undefined) update.description = String(req.body.description || '').trim();
    if (req.body.price !== undefined && req.body.price !== '') update.price = Number(req.body.price);
    if (req.body.category !== undefined) update.category = String(req.body.category || '').trim();

    if (req.file) {
      update.images = [req.file.filename];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : null
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

export default router;
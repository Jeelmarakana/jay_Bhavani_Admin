import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';

export const uploadDirectory = path.resolve('uploads');
await fs.mkdir(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  }
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPG, PNG, and WebP images are accepted.'));
    }
    return callback(null, true);
  }
});

export function acceptReferenceImage(req, res, next) {
  multerUpload.single('referenceImage')(req, res, async (error) => {
    if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
      .json({ message: error.message });
    if (!req.file) return next();

    try {
      const detected = await fileTypeFromFile(req.file.path);
      if (!detected || !allowedMimeTypes.has(detected.mime)) {
        await fs.unlink(req.file.path);
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
}

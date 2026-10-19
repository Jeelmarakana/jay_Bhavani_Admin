import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  productName: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  referenceImageName: { type: String, default: null },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
  adminNote: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);

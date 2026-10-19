import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, trim: true },
  images: [{ type: String, default: [] }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
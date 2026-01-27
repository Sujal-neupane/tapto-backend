
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  discount?: number;
  size: string[];
  colors: string[];
  tags: string[];
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    tags: [{ type: String }],
    createdBy: { type: String, required: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
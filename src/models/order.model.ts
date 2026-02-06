
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface ITracking {
  status: string;
  description: string;
  timestamp: Date;
  location?: string;
  metadata?: any;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  shippingAddress: {
    id: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    id: string;
    type: string;
    last4?: string;
  };
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'outForDelivery' | 'delivered' | 'cancelled' | 'refunded';
  trackingNumber?: string;
  tracking: ITracking[];
  cancellationReason?: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    driverId?: string; // Reference to DeliveryDriver _id
    avatarUrl?: string;
  };
  liveLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  size: { type: String },
  color: { type: String },
});

const TrackingSchema = new Schema({
  status: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
});

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      id: { type: String, required: true },
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      id: { type: String, required: true },
      type: { type: String, required: true },
      last4: { type: String },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 10 },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'outForDelivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    trackingNumber: { type: String, unique: true, sparse: true },
    tracking: [TrackingSchema],
    cancellationReason: { type: String },
    deliveryPerson: {
      name: { type: String },
      phone: { type: String },
      vehicle: { type: String },
      rating: { type: Number },
      driverId: { type: Schema.Types.ObjectId, ref: 'DeliveryDriver' },
      avatarUrl: { type: String },
    },
    liveLocation: {
      lat: { type: Number },
      lng: { type: Number },
      lastUpdated: { type: Date },
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ trackingNumber: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
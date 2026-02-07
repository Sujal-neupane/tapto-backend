// models/delivery_driver.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IDeliveryDriver extends Document {
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

const DeliveryDriverSchema = new Schema<IDeliveryDriver>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model<IDeliveryDriver>('DeliveryDriver', DeliveryDriverSchema);

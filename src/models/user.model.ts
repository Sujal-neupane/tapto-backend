import mongoose, { Document, Schema } from 'mongoose';
import { UserType } from '../types/user.types';

const UserSchema: Schema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true },
        shoppingPreference: { type: String, enum: ['Mens Fashion', 'Womens Fashion'] },
        phoneNumber: { type: String },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        profilePicture: { type: String }, // Add profile picture path
        country: { type: String }, // Add country field
        otp: { type: String, required: false },
        otpExpiry: { type: Date, required: false },
    },
    {
        timestamps: true,
    }
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    otp?: string;
    otpExpiry?: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);

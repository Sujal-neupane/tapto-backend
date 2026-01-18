import mongoose, { Document, Schema } from 'mongoose';
import { UserType } from '../types/user.types';

const UserSchema: Schema = new Schema<UserType>(
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
    },
    {
        timestamps: true,
    }
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);

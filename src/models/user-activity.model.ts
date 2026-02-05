import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const UserActivitySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET',
      'PROFILE_UPDATE',
      'PROFILE_PICTURE_UPDATE',
      'ACCOUNT_DELETED'
    ],
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ action: 1, timestamp: -1 });

export const UserActivityModel = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
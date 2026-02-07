import { UserModel } from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { profile } from 'console';
import {sendEmail} from '../config/email'
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { JWT_SECRET } from '../config';

const CLIENT_URL = process.env.CLIENT_URL as string;
export class UserService {
  async createUser(userData: any) {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = new UserModel({
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      shoppingPreference: userData.shoppingPreference,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'user', // Default to 'user'
      profilePicture: userData.profilePicture || '', // ADD PROFILE PICTURE
      country: userData.country, // ADD COUNTRY
    });

    await user.save();

    //  Include role in JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role //  ADD ROLE TO TOKEN
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        shoppingPreference: user.shoppingPreference,
        phoneNumber: user.phoneNumber,
        role: user.role, //  RETURN ROLE
        isAdmin: user.role === 'admin', //  ADD isAdmin FLAG
        profilePicture: user.profilePicture, // ADD PROFILE PICTURE
        country: user.country, // ADD COUNTRY
      },
    };
  }

  async loginUser(loginData: any) {
    const user = await UserModel.findOne({ email: loginData.email });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isValidPassword = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    //  Include role in JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role //  ADD ROLE TO TOKEN
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        shoppingPreference: user.shoppingPreference,
        phoneNumber: user.phoneNumber,
        role: user.role, //  RETURN ROLE
        isAdmin: user.role === 'admin', //  ADD isAdmin FLAG
        profilePicture: user.profilePicture, // ADD PROFILE PICTURE
        country: user.country, // ADD COUNTRY
      },
    };
  }

  async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      shoppingPreference: user.shoppingPreference,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isAdmin: user.role === 'admin',
      profilePicture: user.profilePicture, // ADD PROFILE PICTURE
      country: user.country, // ADD COUNTRY
    };
  }

  async updateUser(userId: string, updateData: any) {

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      shoppingPreference: user.shoppingPreference,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isAdmin: user.role === 'admin',
      profilePicture: user.profilePicture, // ADD PROFILE PICTURE
      country: user.country, // ADD COUNTRY
    };
  }

  async sendResetPasswordEmail(email?: string) {
        if (!email) {
          throw new HttpError(400, "Email is required");
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
          throw new HttpError(404, "User not found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        const html = `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP will expire in 10 minutes.</p>`;
        await sendEmail(user.email, "Password Reset OTP", html);
        return user;

    }

    async resetPassword(otp?: string, newPassword?: string, email?: string) {
        try {
          if (!otp || !newPassword || !email) {
            throw new HttpError(400, "OTP, new password, and email are required");
          }
          const user = await UserModel.findOne({ email, otp });
          if (!user) {
            throw new HttpError(404, "Invalid OTP or email");
          }
          if (user.otpExpiry && user.otpExpiry < new Date()) {
            throw new HttpError(400, "OTP has expired");
          }
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;
          user.otp = undefined; // clear OTP
          user.otpExpiry = undefined;
          await user.save();
          return user;
        } catch (error) {
          throw new HttpError(400, "Invalid or expired OTP");
        }
    }
}


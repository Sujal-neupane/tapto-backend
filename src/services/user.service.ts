import { UserModel } from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { profile } from 'console';

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
    });

    await user.save();

    // ✅ Include role in JWT token
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

    // ✅ Include role in JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role // ✅ ADD ROLE TO TOKEN
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
    };
  }
}
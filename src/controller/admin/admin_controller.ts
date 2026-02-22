import { Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import { successResponse, errorResponse } from '../../utils/response';
import orderService from '../../services/order.service';
import productService from '../../services/product.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      pendingOrders
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.collection.db?.collection('orders').countDocuments() || 0,
      UserModel.collection.db?.collection('products').countDocuments() || 0,
      UserModel.collection.db?.collection('orders').countDocuments({ status: 'pending' }) || 0
    ]);

    return successResponse(res, {
      totalUsers,
      totalOrders,
      totalProducts,
      pendingOrders
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(query)
    ]);

    return successResponse(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      return errorResponse(res, 'User already exists', 400);
    }

    const user = new UserModel(userData);
    await user.save();

    return successResponse(res, user, 'User created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow password updates through this endpoint
    delete updateData.password;

    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, null, 'User deleted successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

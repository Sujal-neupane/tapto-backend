import { Request, Response } from 'express';
import Order from '../../models/order.model';
import  { UserModel } from '../../models/user.model';
import Product from '../../models/product.model';
import { normalizeUploadedImage } from '../../utils/image';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get counts
    const totalOrders = await Order.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    // Calculate revenue
    const orders = await Order.find({ status: 'delivered' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      status: 'delivered',
      deliveredAt: { $gte: today },
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Pending orders
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'processing'] },
    });
    
    // Low stock products
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 10 },
    });
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    // Monthly sales (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
        todayRevenue,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        monthlySales,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

  // Create user (admin)
  export const createUser = async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, shoppingPreference, phoneNumber, role } = req.body;
      let profilePicture = '';
      if (req.file) {
        const normalizedFile = await normalizeUploadedImage(req.file);
        // Store relative path for web access
        profilePicture = `/uploads/users/${normalizedFile.filename}`;
      }
      // Check if user exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserModel({
        fullName,
        email,
        password: hashedPassword,
        shoppingPreference,
        phoneNumber,
        role: role || 'user',
        profilePicture,
      });
      await user.save();
      
      // Return user without password
      const { password: _password, ...userResponse } = user.toObject() as any;
      
      res.status(201).json({ success: true, message: 'User created', data: userResponse });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get user by ID (admin)
  export const getUserById = async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Update user (admin)
  export const updateUser = async (req: Request, res: Response) => {
    try {
      const { fullName, email, shoppingPreference, phoneNumber, role } = req.body;
      let updateData: any = { fullName, email, shoppingPreference, phoneNumber, role };
      if (req.file) {
        const normalizedFile = await normalizeUploadedImage(req.file);
        // Store relative path for web access
        updateData.profilePicture = `/uploads/users/${normalizedFile.filename}`;
      }
      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      const user = await UserModel.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, message: 'User updated', data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Delete user (admin)
  export const deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

import { Request, Response } from 'express';
import Order from '../../models/order.model';
import  { UserModel } from '../../models/user.model';
import Product from '../../models/product.model';

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
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};
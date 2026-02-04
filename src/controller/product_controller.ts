import { Request, Response } from 'express';
import Product from '../models/product.model';

/**
 * Get all active products with optional filtering
 * Query params:
 * - category: Filter by category (e.g., "Men", "Women")
 * - search: Search in name and description
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - tags: Comma-separated tags to filter by
 * - limit: Number of products to return (default: 50)
 * - page: Page number for pagination (default: 1)
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      tags,
      limit = 50,
      page = 1,
    } = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    // Filter by category (fashion type)
    if (category) {
      filter.category = { $regex: new RegExp(category as string, 'i') };
    }

    // Search in name and description
    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search as string, 'i') } },
        { description: { $regex: new RegExp(search as string, 'i') } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Tags filter
    if (tags) {
      const tagList = (tags as string).split(',').map(t => t.trim());
      filter.tags = { $in: tagList };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

/**
 * Get products by category/fashion type
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({
      category: { $regex: new RegExp(category, 'i') },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

/**
 * Get product categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

/**
 * Get personalized product recommendations based on user preferences
 */
export const getPersonalizedProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 20 } = req.query;

    let categoryFilter = {};

    // If user is authenticated, filter by their shopping preference
    if (userId) {
      const User = require('../models/user.model').UserModel;
      const user = await User.findById(userId);

      if (user && user.shoppingPreference) {
        // Map user preference to product category
        if (user.shoppingPreference === 'Mens Fashion') {
          categoryFilter = { category: 'Men' };
        } else if (user.shoppingPreference === 'Womens Fashion') {
          categoryFilter = { category: 'Women' };
        }
      }
    }

    const products = await Product.find({
      ...categoryFilter,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personalized products',
      error: error.message,
    });
  }
};

import { Request, Response } from 'express';
import productService from '../services/product.service';
import { CreateProductDTO, UpdateProductDTO, ProductFilterDTO } from '../dtos/product.dtos';
import { successResponse, errorResponse } from '../utils/response';


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

    // Filter by category (fashion type) - exact match
    if (category) {
      filter.category = category;
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

    const products = await productService.getAllProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      tags: tags ? (tags as string).split(',').map(t => t.trim()) : undefined,
      isActive: true,
      limit: limitNum,
      page: pageNum - 1
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        pages: Math.ceil(products.length / limitNum),
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
    
    const product = await productService.getProductById(productId);

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
    
    const products = await productService.getProductsByCategory(category);

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
    // Get all products and extract unique categories
    const products = await productService.getAllProducts({ isActive: true });
    const categories = [...new Set(products.map(p => p.category))];

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

    const products = await productService.getAllProducts({
      ...categoryFilter,
      isActive: true,
      limit: Number(limit),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    } as any);

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

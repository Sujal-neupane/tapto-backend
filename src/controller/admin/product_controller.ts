import { Request, Response } from 'express';
import Product from '../../models/product.model';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
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

export const addProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const {
      name,
      description,
      price,
      category,
      subcategory,
      stock,
      discount,
      tags,
      sizes,
      colors,
    } = req.body;

    // Handle images from upload
    const images = (req.files as any[])?.map(file => `/uploads/products/${file.filename}`) || [];

    const product = new Product({
      name,
      description,
      price,
      images,
      category, // Men or Women
      subcategory, // T-Shirts, Jeans, etc.
      stock,
      isActive: true,
      sizes: sizes || [],
      colors: colors || [],
      discount: discount || 0,
      tags: tags || [],
      createdBy: userId,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Handle new images if uploaded
    if (req.files && (req.files as any[]).length > 0) {
      updateData.images = (req.files as any[]).map(
        file => `/uploads/products/${file.filename}`
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

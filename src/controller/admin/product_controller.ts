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
    const { existingImages, imagesToRemove, ...updateData } = req.body;

    // Get current product to handle images properly
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Handle images: keep existing, remove specified, add new
    let finalImages: string[] = [];
    
    // Parse existing images (may come as JSON string or array)
    let existingImagesArray: string[] = [];
    if (existingImages) {
      try {
        existingImagesArray = typeof existingImages === 'string' 
          ? JSON.parse(existingImages) 
          : existingImages;
      } catch {
        existingImagesArray = Array.isArray(existingImages) ? existingImages : [];
      }
    }

    // Parse images to remove
    let removeArray: string[] = [];
    if (imagesToRemove) {
      try {
        removeArray = typeof imagesToRemove === 'string'
          ? JSON.parse(imagesToRemove)
          : imagesToRemove;
      } catch {
        removeArray = Array.isArray(imagesToRemove) ? imagesToRemove : [];
      }
    }

    // Filter out removed images from existing
    finalImages = existingImagesArray.filter(img => !removeArray.includes(img));

    // Add new uploaded images
    if (req.files && (req.files as any[]).length > 0) {
      const newImages = (req.files as any[]).map(
        file => `/uploads/products/${file.filename}`
      );
      finalImages = [...finalImages, ...newImages];
    }

    // Only update images if we have some or if explicitly clearing
    if (finalImages.length > 0 || existingImages !== undefined) {
      updateData.images = finalImages;
    }

    // Parse sizes and colors if they come as strings
    if (updateData.sizes && typeof updateData.sizes === 'string') {
      try {
        updateData.sizes = JSON.parse(updateData.sizes);
      } catch {
        updateData.sizes = updateData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (updateData.colors && typeof updateData.colors === 'string') {
      try {
        updateData.colors = JSON.parse(updateData.colors);
      } catch {
        updateData.colors = updateData.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
      }
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
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

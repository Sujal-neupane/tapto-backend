import { Request, Response } from 'express';
import productService from '../../services/product.service';
import { successResponse, errorResponse } from '../../utils/response';
import { CreateProductDTO, UpdateProductDTO } from '../../dtos/product.dtos';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      isActive
    } = req.query;

    const filter: any = {
      page: Number(page) - 1,
      limit: Number(limit)
    };

    if (category) filter.category = category as string;
    if (search) filter.search = search as string;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const products = await productService.getAllProducts(filter);

    return successResponse(res, products);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    
    // Handle uploaded images
    if (req.files && Array.isArray(req.files)) {
      productData.images = req.files.map((file: Express.Multer.File) => `/uploads/products/${file.filename}`);
    }

    const product = await productService.createProduct(productData);

    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Handle uploaded images
    if (req.files && Array.isArray(req.files)) {
      const newImages = req.files.map((file: Express.Multer.File) => `/uploads/products/${file.filename}`);
      updateData.images = updateData.images 
        ? [...updateData.images, ...newImages]
        : newImages;
    }

    const product = await productService.updateProduct(productId, updateData);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const success = await productService.deleteProduct(productId);

    if (!success) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, null, 'Product deleted successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

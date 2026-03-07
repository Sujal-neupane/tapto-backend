import { Request, Response } from 'express';
import productService from '../../services/product.service';
import { successResponse, errorResponse } from '../../utils/response';
import { CreateProductDTO, UpdateProductDTO } from '../../dtos/product.dtos';

const normalizeImagePaths = (value: any): string[] => {
  const collect = (input: any): string[] => {
    if (input === undefined || input === null) return [];

    if (Array.isArray(input)) {
      return input.flatMap((item) => collect(item));
    }

    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) return [];

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          return collect(parsed);
        } catch {
          return [trimmed];
        }
      }

      return [trimmed];
    }

    return [];
  };

  return Array.from(new Set(collect(value)));
};

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
    const authUser = (req as any).user;
    const createdBy = authUser?.id || authUser?.userId;

    if (!createdBy) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const { name, description, price, category, stock, discount } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return errorResponse(
        res,
        'Missing required fields: name, price, category',
        400
      );
    }

    // Validate price is a valid number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return errorResponse(
        res,
        'Price must be a valid positive number',
        400
      );
    }

    // Check if images were uploaded
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return errorResponse(
        res,
        'At least one product image is required',
        400
      );
    }

    // Prepare product data
    const productData: any = {
      name: name.trim(),
      description: (description || '').trim(),
      price: parsedPrice,
      category: category.trim(),
      stock: parseInt(stock) || 0,
      discount: parseFloat(discount) || 0,
      createdBy,
    };

    // Handle uploaded images
    if (req.files && Array.isArray(req.files)) {
      productData.images = req.files.map(
        (file: Express.Multer.File) => `/uploads/products/${file.filename}`
      );
    }

    console.log('Creating product with data:', productData);
    const product = await productService.createProduct(productData);

    return successResponse(
      res,
      product,
      'Product created successfully',
      201
    );
  } catch (error: any) {
    console.error('Product creation error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to create product',
      500
    );
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Validate productId
    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    // Validate and parse numeric fields if provided
    if (updateData.price !== undefined) {
      const parsedPrice = parseFloat(updateData.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return errorResponse(
          res,
          'Price must be a valid positive number',
          400
        );
      }
      updateData.price = parsedPrice;
    }

    if (updateData.stock !== undefined) {
      updateData.stock = parseInt(updateData.stock);
      if (isNaN(updateData.stock)) {
        return errorResponse(res, 'Stock must be a valid number', 400);
      }
    }

    if (updateData.discount !== undefined) {
      updateData.discount = parseFloat(updateData.discount);
      if (isNaN(updateData.discount)) {
        return errorResponse(res, 'Discount must be a valid number', 400);
      }
    }

    const existingImagesRaw = (req.body as any).existingImages;
    const existingImages = normalizeImagePaths(existingImagesRaw);

    // Handle uploaded images and explicit existing images list from frontend
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files.map(
        (file: Express.Multer.File) => `/uploads/products/${file.filename}`
      );
      updateData.images = [...existingImages, ...newImages];
    } else if (existingImagesRaw !== undefined) {
      updateData.images = existingImages;
    } else if (updateData.images !== undefined) {
      updateData.images = normalizeImagePaths(updateData.images);
    }

    delete (updateData as any).existingImages;

    console.log('Updating product:', productId, updateData);
    const product = await productService.updateProduct(productId, updateData);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    console.error('Product update error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to update product',
      500
    );
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

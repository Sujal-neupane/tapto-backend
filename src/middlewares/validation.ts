import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, addressId, paymentMethodId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse(res, 'Items are required and must be an array', 400);
  }

  if (!addressId) {
    return errorResponse(res, 'Shipping address is required', 400);
  }

  if (!paymentMethodId) {
    return errorResponse(res, 'Payment method is required', 400);
  }

  // Validate each item
  for (const item of items) {
    if (!item.productId || !item.productName || !item.price || !item.quantity) {
      return errorResponse(res, 'Invalid item data', 400);
    }

    if (item.quantity <= 0) {
      return errorResponse(res, 'Quantity must be greater than 0', 400);
    }

    if (item.price <= 0) {
      return errorResponse(res, 'Price must be greater than 0', 400);
    }
  }

  next();
};
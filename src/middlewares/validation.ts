import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, addressId, paymentMethodId, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse(res, 'Items are required and must be an array', 400);
  }

  // Check for either stored address/payment or direct address/payment
  if (!addressId && !shippingAddress) {
    return errorResponse(res, 'Shipping address is required', 400);
  }

  if (!paymentMethodId && !paymentMethod) {
    return errorResponse(res, 'Payment method is required', 400);
  }

  // Validate each item - allow minimal data, service will populate rest
  for (const item of items) {
    if (!item.productId) {
      return errorResponse(res, 'Product ID is required for each item', 400);
    }

    if (!item.quantity || item.quantity <= 0) {
      return errorResponse(res, 'Valid quantity is required for each item', 400);
    }
  }

  next();
};
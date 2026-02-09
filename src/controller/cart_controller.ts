import { Request, Response } from 'express';
import cartService from '../services/cart.service';
import { successResponse, errorResponse } from '../utils/response';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cart = await cartService.getCart(userId);
    return successResponse(res, cart);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity, size, color } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }
    if (!quantity || quantity <= 0) {
      return errorResponse(res, 'Valid quantity is required', 400);
    }

    const cart = await cartService.addItem(userId, {
      productId,
      quantity,
      size,
      color,
    });

    return successResponse(res, cart, 'Item added to cart', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateItemQuantity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity, size, color } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }
    if (quantity === undefined || quantity === null) {
      return errorResponse(res, 'Quantity is required', 400);
    }

    const cart = await cartService.updateItemQuantity(
      userId,
      productId,
      quantity,
      size,
      color
    );

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    return successResponse(res, cart, 'Cart updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;
    const { size, color } = req.query;

    const cart = await cartService.removeItem(
      userId,
      productId,
      size as string | undefined,
      color as string | undefined
    );

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    return successResponse(res, cart, 'Item removed from cart');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cart = await cartService.clearCart(userId);

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    return successResponse(res, cart, 'Cart cleared');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const syncCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return errorResponse(res, 'Items array is required', 400);
    }

    const cart = await cartService.syncCart(userId, items);
    return successResponse(res, cart, 'Cart synced successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

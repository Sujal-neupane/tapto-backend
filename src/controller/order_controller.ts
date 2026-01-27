import { Request, Response } from 'express';
import orderService, { OrderService } from '../services/order.service';
import { successResponse, errorResponse } from '../utils/response';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // From auth middleware
    const { items, addressId, paymentMethodId, shippingAddress, paymentMethod } = req.body;

    // Validate
    if (!items || items.length === 0) {
      return errorResponse(res, 'Items are required', 400);
    }

    const order = await orderService.createOrder({
      userId,
      items,
      addressId,
      paymentMethodId,
      shippingAddress,
      paymentMethod,
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await orderService.getMyOrders(userId);
    return successResponse(res, orders);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const tracking = await orderService.trackOrder(orderId);
    return successResponse(res, tracking);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Cancellation reason is required', 400);
    }

    const order = await orderService.cancelOrder(orderId, reason);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order cancelled successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order status updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateLiveLocation = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { lat, lng } = req.body;

    const order = await orderService.updateLiveLocation(orderId, lat, lng);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Location updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

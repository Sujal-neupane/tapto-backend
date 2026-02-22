import { Request, Response } from 'express';
import orderService from '../../services/order.service';
import { successResponse, errorResponse } from '../../utils/response';
import { UpdateOrderStatusDTO } from '../../dtos/order.dtos';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      userId
    } = req.query;

    const filter: any = {
      page: Number(page) - 1,
      limit: Number(limit)
    };

    if (status) filter.status = status as string;
    if (userId) filter.userId = userId as string;

    // Get all orders through service
    // Note: You may need to add a getAllOrders method to orderService
    const orders = await orderService.getMyOrders(userId as string || '');

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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order status updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

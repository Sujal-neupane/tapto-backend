import { Request, Response } from 'express';
import driverService from '../../services/driver.service';
import orderService from '../../services/order.service';
import { successResponse, errorResponse } from '../../utils/response';

export const assignDriverToOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return errorResponse(res, 'Driver ID is required', 400);
    }

    // Get driver details
    const driver = await driverService.getDriverById(driverId);
    if (!driver) {
      return errorResponse(res, 'Driver not found', 404);
    }

    // Get order
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Update order with driver information
    const driverData = {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicleNumber,
      rating: 4.5, // You might want to add rating to the driver model
      avatarUrl: driver.avatarUrl
    };

    // Assign driver to order
    order.deliveryPerson = driverData as any;
    
    // Update order status to shipped or outForDelivery
    await orderService.updateOrderStatus(orderId, 'outForDelivery');

    return successResponse(res, order, 'Driver assigned successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

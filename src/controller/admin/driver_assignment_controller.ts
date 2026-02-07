import { Request, Response } from 'express';
import Order from '../../models/order.model';
import DeliveryDriver from '../../models/delivery_driver.model';

// Admin: Assign a delivery driver to an order
export const assignDriverToOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const driver = await DeliveryDriver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Assign driver info to order.deliveryPerson
    order.deliveryPerson = {
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicleNumber,
      rating: 5, // Default or fetch from reviews if available
      driverId: driver._id.toString(),
      avatarUrl: driver.avatarUrl,
    };

    await order.save();

    return res.json({
      success: true,
      message: 'Driver assigned to order',
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

import { Request, Response } from 'express';
import Order from '../../models/order.model';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price images');
    
    res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;

    // Add tracking event
    const trackingEvents: { [key: string]: any } = {
      confirmed: {
        status: 'Order Confirmed',
        description: 'Payment confirmed and order is being processed',
        location: 'Payment Gateway',
      },
      processing: {
        status: 'Processing',
        description: 'Your items are being picked and packed',
        location: 'TapTo Warehouse',
      },
      shipped: {
        status: 'Shipped',
        description: 'Package handed over to delivery partner',
        location: 'TapTo Distribution Hub',
      },
      outForDelivery: {
        status: 'Out for Delivery',
        description: 'Delivery partner is on the way',
        location: 'Delivery Hub',
      },
      delivered: {
        status: 'Delivered',
        description: 'Package successfully delivered',
        location: 'Customer Address',
        deliveredAt: new Date(),
      },
    };

    if (trackingEvents[status]) {
      order.tracking.push({
        ...trackingEvents[status],
        timestamp: new Date(),
      } as any);

      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

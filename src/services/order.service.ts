import Order, {IOrder, IOrderItem, ITracking} from '../models/order.model';
import Product from '../models/product.model';

export class OrderService {
    async createOrder(data: {
    userId: string;
    items: Partial<IOrderItem>[];
    addressId?: string;
    paymentMethodId?: string;
    shippingAddress?: any;
    paymentMethod?: any;
  }): Promise<IOrder> {
    // Populate item details from products
    const populatedItems: IOrderItem[] = [];
    for (const item of data.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      populatedItems.push({
        productId: item.productId!,
        productName: product.name,
        productImage: product.images?.[0] || '',
        quantity: item.quantity!,
        price: product.price,
        size: item.size,
        color: item.color,
      });
    }

    // Calculate totals
    const subtotal = populatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const taxRate = this.getTaxRate(data.shippingAddress?.country || 'United States');
    const tax = subtotal * taxRate;
    const total = subtotal + shippingFee + tax;

    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    // Create order
    const order = new Order({
      userId: data.userId,
      items: populatedItems,
      shippingAddress: data.shippingAddress || data.addressId,
      paymentMethod: data.paymentMethod || data.paymentMethodId,
      subtotal,
      shippingFee,
      tax,
      total,
      trackingNumber,
      status: 'pending',
      tracking: [
        {
          status: 'Order Placed',
          description: 'Your order has been received and confirmed',
          timestamp: new Date(),
          location: 'TapTo Online Platform',
        },
      ],
    });

    await order.save();

    // Simulate order confirmation
    setTimeout(async () => {
      await this.updateOrderStatus(order._id.toString(), 'confirmed');
    }, 5000);

    return order;
  }

  async getMyOrders(userId: string): Promise<IOrder[]> {
    return Order.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    return Order.findById(orderId).exec();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    order.status = status as any;

    // Add tracking event
    const trackingEvents: { [key: string]: { status: string; description: string; location: string } } = {
      confirmed: {
        status: 'Order Confirmed',
        description: 'Payment confirmed and order is being processed',
        location: 'Payment Gateway',
      },
      processing: {
        status: 'Processing',
        description: 'Your items are being picked and packed',
        location: 'TapTo Warehouse, Kathmandu',
      },
      shipped: {
        status: 'Shipped',
        description: 'Package handed over to delivery partner',
        location: 'TapTo Distribution Hub',
      },
      outForDelivery: {
        status: 'Out for Delivery',
        description: 'Delivery partner is on the way',
        location: 'Kathmandu Delivery Hub',
      },
      delivered: {
        status: 'Delivered',
        description: 'Package successfully delivered',
        location: 'Customer Address',
      },
    };

    if (trackingEvents[status]) {
      order.tracking.push({
        ...trackingEvents[status],
        timestamp: new Date(),
      } as any);
    }

    // Set delivery person for outForDelivery status
    if (status === 'outForDelivery') {
      order.deliveryPerson = {
        name: 'Rajesh Kumar',
        phone: '+977 98XXXXXXXX',
        vehicle: 'Bike - KTM 1234',
        rating: 4.8,
      };

      // Set initial location (Kathmandu center)
      order.liveLocation = {
        lat: 27.7172,
        lng: 85.324,
        lastUpdated: new Date(),
      };
    }

    // Set delivered timestamp
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    return order;
  }

  async trackOrder(orderId: string): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Calculate distance and ETA (mock data)
    const distanceKm = order.status === 'outForDelivery' ? 2.5 : 15;
    const estimatedMinutes = order.status === 'outForDelivery' ? 15 : 60;

    return {
      orderId: order._id,
      deliveryPerson: order.deliveryPerson,
      currentLocation: order.liveLocation
        ? {
            lat: order.liveLocation.lat,
            lng: order.liveLocation.lng,
            address: 'Near Boudha Stupa, Kathmandu',
          }
        : null,
      destination: {
        lat: 27.7172,
        lng: 85.324,
      },
      distanceRemaining: `${distanceKm} km`,
      estimatedTime: `${estimatedMinutes} mins`,
      timeline: order.tracking,
    };
  }

  async cancelOrder(orderId: string, reason: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error('Cannot cancel this order');
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.tracking.push({
      status: 'Cancelled',
      description: `Order cancelled. Reason: ${reason}`,
      timestamp: new Date(),
      location: 'System',
    } as any);

    await order.save();
    return order;
  }

  async updateLiveLocation(orderId: string, lat: number, lng: number): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    order.liveLocation = {
      lat,
      lng,
      lastUpdated: new Date(),
    };

    await order.save();
    return order;
  }

  private generateTrackingNumber(): string {
    const prefix = 'TRK';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  private getTaxRate(country: string): number {
    switch (country?.toLowerCase()) {
      case 'united states':
        return 0.08; // 8% tax
      case 'india':
        return 0.18; // 18% GST
      case 'nepal':
        return 0.13; // 13% VAT
      default:
        return 0.08; // Default 8%
    }
  }
}

export default new OrderService();

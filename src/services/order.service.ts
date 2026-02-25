import { IOrder, IOrderItem, ITracking } from '../models/order.model';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AddressRepository } from '../repositories/address.repository';
import { UserModel } from '../models/user.model';

export class OrderService {
    private orderRepository: OrderRepository;
    private productRepository: ProductRepository;
    private addressRepository: AddressRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
        this.addressRepository = new AddressRepository();
    }

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
      const product = await this.productRepository.getProductById(item.productId!);
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

    // Get shipping address details
    let finalShippingAddress = data.shippingAddress;
    if (data.addressId && !data.shippingAddress) {
      const address = await this.addressRepository.getAddressById(data.addressId);
      if (!address) {
        throw new Error('Shipping address not found');
      }
      finalShippingAddress = {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      };
    }

    // Calculate totals
    const subtotal = populatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const taxRate = this.getTaxRate(finalShippingAddress?.country || 'United States');
    const tax = subtotal * taxRate;
    const total = subtotal + shippingFee + tax;

    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    // Create order
    const order = await this.orderRepository.createOrder({
      userId: data.userId,
      items: populatedItems,
      shippingAddress: finalShippingAddress,
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
    } as any);

    // Simulate order confirmation
    setTimeout(async () => {
      await this.updateOrderStatus(order._id.toString(), 'confirmed');
    }, 5000);

    return order;
  }

  async getMyOrders(userId: string): Promise<IOrder[]> {
    const orders = await this.orderRepository.getOrdersByUserId(userId);
    return this.hydrateUsers(orders);
  }

  async getAllOrders(filter?: any): Promise<IOrder[]> {
    const orders = await this.orderRepository.getAllOrders(filter);
    return this.hydrateUsers(orders);
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    const order = await this.orderRepository.getOrderById(orderId);
    if (!order) return null;
    return await this.hydrateUser(order);
  }

  private async hydrateUsers(orders: IOrder[]): Promise<any[]> {
    return Promise.all(orders.map((order) => this.hydrateUser(order)));
  }

  private async hydrateUser(order: IOrder): Promise<any> {
    // Convert Mongoose document to plain object for proper serialization
    const plainOrder = order.toObject?.() || JSON.parse(JSON.stringify(order));
    const currentUser = plainOrder.userId;

    if (currentUser && typeof currentUser === 'object') {
      const fullName = currentUser.fullName || currentUser.name;
      plainOrder.userId = {
        _id: currentUser._id,
        name: fullName,
        fullName,
        email: currentUser.email,
      };
      return plainOrder;
    }

    if (typeof currentUser === 'string') {
      const user = await UserModel.findById(currentUser).select('fullName email').lean();
      if (user) {
        plainOrder.userId = {
          _id: user._id,
          name: user.fullName,
          fullName: user.fullName,
          email: user.email,
        };
      } else {
        plainOrder.userId = {
          _id: currentUser,
          name: 'Unknown User',
          fullName: 'Unknown User',
          email: 'N/A',
        };
      }
    }

    return plainOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<IOrder | null> {
    const order = await this.orderRepository.getOrderById(orderId);
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

      // Set initial location (Kathmandu center, away from Boudha Stupa)
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

    return await this.orderRepository.updateOrder(orderId, order);
  }

  async trackOrder(orderId: string): Promise<any> {
    const order = await this.orderRepository.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    // Boudha Stupa coordinates as destination
    const destinationLat = 27.7215;
    const destinationLng = 85.3621;

    // Simulate live location updates for outForDelivery orders
    if (order.status === 'outForDelivery') {
      if (!order.liveLocation) {
        // Set initial location (somewhere in Kathmandu, away from Boudha)
        order.liveLocation = {
          lat: 27.7172, // Kathmandu center
          lng: 85.324,
          lastUpdated: new Date(),
        };
      } else {
        // Simulate movement towards Boudha Stupa
        const currentLat = order.liveLocation.lat;
        const currentLng = order.liveLocation.lng;
        
        // Calculate direction vector towards destination
        const deltaLat = destinationLat - currentLat;
        const deltaLng = destinationLng - currentLng;
        
        // Calculate distance
        const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
        
        if (distance > 0.001) { // If not very close to destination
          // Move 10% closer each time (simulate gradual movement)
          const moveFraction = 0.1;
          const newLat = currentLat + deltaLat * moveFraction;
          const newLng = currentLng + deltaLng * moveFraction;
          
          order.liveLocation = {
            lat: newLat,
            lng: newLng,
            lastUpdated: new Date(),
          };
        }
      }
      
      await this.orderRepository.updateOrder(orderId, order);
    }

    // Calculate distance and ETA based on current location
    let distanceKm = 15; // Default
    let estimatedMinutes = 60; // Default
    
    if (order.liveLocation) {
      const currentLat = order.liveLocation.lat;
      const currentLng = order.liveLocation.lng;
      
      // Calculate actual distance to destination
      const deltaLat = destinationLat - currentLat;
      const deltaLng = destinationLng - currentLng;
      const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
      
      // Convert to approximate km (rough approximation)
      distanceKm = distance * 111; // 1 degree ≈ 111 km
      estimatedMinutes = Math.max(5, Math.round(distanceKm * 20)); // Rough ETA calculation
    }

    return {
      orderId: order._id,
      deliveryPerson: order.deliveryPerson,
      currentLocation: order.liveLocation
        ? {
            lat: order.liveLocation.lat,
            lng: order.liveLocation.lng,
            address: order.status === 'outForDelivery' ? 'Approaching Your Location' : 'Kathmandu',
          }
        : null,
      destination: {
        lat: destinationLat,
        lng: destinationLng,
      },
      distanceRemaining: `${distanceKm.toFixed(1)} km`,
      estimatedTime: `${estimatedMinutes} mins`,
      timeline: order.tracking,
    };
  }

  async cancelOrder(orderId: string, reason: string): Promise<IOrder | null> {
    const order = await this.orderRepository.getOrderById(orderId);
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

    return await this.orderRepository.updateOrder(orderId, order);
  }

  async updateLiveLocation(orderId: string, lat: number, lng: number): Promise<IOrder | null> {
    return await this.orderRepository.updateLiveLocation(orderId, { lat, lng });
  }

  async assignDriver(orderId: string, driverData: any): Promise<IOrder | null> {
    return await this.orderRepository.assignDriver(orderId, driverData);
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

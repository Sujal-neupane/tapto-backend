// Order Status Types
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Payment Method Type
export interface PaymentMethod {
  id?: string;
  type: string;
  last4?: string;
}

// Shipping Address Type
export interface ShippingAddress {
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order Item Type
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

// Tracking Type
export interface OrderTracking {
  status: OrderStatus;
  timestamp: Date;
  location?: string;
  notes?: string;
}

// Live Location Type
export interface LiveLocation {
  lat: number;
  lng: number;
  timestamp?: Date;
}

// Delivery Person Type
export interface DeliveryPerson {
  id?: string;
  name: string;
  phone: string;
  vehicle?: string;
  rating?: number;
  avatarUrl?: string;
}

// Order Response Type
export interface OrderResponse {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  tracking: OrderTracking[];
  deliveryPerson?: DeliveryPerson;
  liveLocation?: LiveLocation;
  createdAt: Date;
  updatedAt: Date;
}

// Order Filter Type
export interface OrderFilter {
  userId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}

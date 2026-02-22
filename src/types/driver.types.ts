// Driver Status Type
export type DriverStatus = 'available' | 'busy' | 'offline';

// Delivery Driver Response Type
export interface DriverResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  avatarUrl?: string;
  isAvailable: boolean;
  rating?: number;
  totalDeliveries?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Driver Assignment Type
export interface DriverAssignment {
  driverId: string;
  orderId: string;
  assignedAt: Date;
  status: 'assigned' | 'accepted' | 'completed' | 'rejected';
}

// Driver Stats Type
export interface DriverStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  averageRating: number;
  totalEarnings: number;
}

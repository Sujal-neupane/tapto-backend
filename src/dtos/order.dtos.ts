import z from 'zod';

// Order Item DTO
export const OrderItemDTO = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productImage: z.string().min(1, 'Product image is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  size: z.string().optional(),
  color: z.string().optional(),
});
export type OrderItemDTO = z.infer<typeof OrderItemDTO>;

// Create Order DTO
export const CreateOrderDTO = z.object({
  items: z.array(OrderItemDTO).min(1, 'At least one item is required'),
  addressId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  shippingAddress: z.object({
    id: z.string().optional(),
    fullName: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
  paymentMethod: z.object({
    id: z.string().optional(),
    type: z.string().min(1),
    last4: z.string().optional(),
  }).optional(),
});
export type CreateOrderDTO = z.infer<typeof CreateOrderDTO>;

// Update Order Status DTO
export const UpdateOrderStatusDTO = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'outForDelivery', 'delivered', 'cancelled', 'refunded']),
});
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusDTO>;

// Cancel Order DTO
export const CancelOrderDTO = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});
export type CancelOrderDTO = z.infer<typeof CancelOrderDTO>;

// Update Live Location DTO
export const UpdateLiveLocationDTO = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type UpdateLiveLocationDTO = z.infer<typeof UpdateLiveLocationDTO>;

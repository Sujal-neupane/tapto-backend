import z from 'zod';

// Add to Cart DTO
export const AddToCartDTO = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});
export type AddToCartDTO = z.infer<typeof AddToCartDTO>;

// Update Cart Item DTO
export const UpdateCartItemDTO = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  size: z.string().optional(),
  color: z.string().optional(),
});
export type UpdateCartItemDTO = z.infer<typeof UpdateCartItemDTO>;

// Remove from Cart DTO
export const RemoveFromCartDTO = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});
export type RemoveFromCartDTO = z.infer<typeof RemoveFromCartDTO>;

// Sync Cart DTO (for syncing local cart to server)
export const SyncCartDTO = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
});
export type SyncCartDTO = z.infer<typeof SyncCartDTO>;

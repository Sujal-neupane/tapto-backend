import z from 'zod';

// Create Product DTO
export const CreateProductDTO = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  images: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required'), // Men or Women
  subcategory: z.string().optional(), // T-Shirts, Jeans, etc.
  stock: z.number().min(0, 'Stock must be positive').default(0),
  discount: z.number().min(0).max(100).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});
export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

// Update Product DTO
export const UpdateProductDTO = CreateProductDTO.partial();
export type UpdateProductDTO = z.infer<typeof UpdateProductDTO>;

// Product Filter DTO
export const ProductFilterDTO = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.string().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
});
export type ProductFilterDTO = z.infer<typeof ProductFilterDTO>;

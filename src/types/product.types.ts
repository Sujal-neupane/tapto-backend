// Product Category Type
export type ProductCategory = 'Men' | 'Women';

// Product Subcategory Types
export type MenSubcategory = 'T-Shirts' | 'Jeans' | 'Jackets' | 'Shirts' | 'Shorts' | 'Sweaters';
export type WomenSubcategory = 'Dresses' | 'Tops' | 'Jeans' | 'Skirts' | 'Jackets' | 'Sweaters';
export type ProductSubcategory = MenSubcategory | WomenSubcategory;

// Product Response Type
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  stock: number;
  isActive: boolean;
  discount?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  createdBy?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product Filter Type
export interface ProductFilter {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isActive?: boolean;
  inStock?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Product Stats Type
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
}

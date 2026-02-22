// Cart Item Type
export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

// Cart Response Type
export interface CartResponse {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Summary Type
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
}

// Cart Validation Result
export interface CartValidationResult {
  isValid: boolean;
  errors: {
    productId: string;
    message: string;
  }[];
  updatedItems: CartItem[];
}

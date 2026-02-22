import { ICart, ICartItem } from '../models/cart.model';
import { IProduct } from '../models/product.model';
import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Get the user's cart (or an empty cart structure if none exists).
   */
  async getCart(userId: string): Promise<ICart> {
    let cart = await this.cartRepository.getCartByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.createCart(userId);
    }
    return cart;
  }

  /**
   * Add an item to the cart. If the same product+size+color exists, increment quantity.
   * Populates name, image, price from the Product collection for data integrity.
   */
  async addItem(
    userId: string,
    data: { productId: string; quantity: number; size?: string; color?: string }
  ): Promise<ICart> {
    const product = await this.productRepository.getProductById(data.productId);
    if (!product) {
      throw new Error(`Product ${data.productId} not found`);
    }

    const cart = await this.cartRepository.addItem(userId, {
      productId: data.productId,
      productName: product.name,
      productImage: product.images?.[0] || '',
      quantity: data.quantity,
      price: product.price,
      size: data.size,
      color: data.color,
    });
    
    if (!cart) {
      throw new Error('Failed to add item to cart');
    }

    return cart;
  }

  /**
   * Update the quantity of a specific cart item.
   * Removes the item if quantity <= 0.
   */
  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ): Promise<ICart | null> {
    if (quantity <= 0) {
      return await this.cartRepository.removeItem(userId, productId);
    }
    
    return await this.cartRepository.updateItem(userId, productId, { quantity, size, color });
  }

  /**
   * Remove a specific item from the cart.
   */
  async removeItem(
    userId: string,
    productId: string,
    size?: string,
    color?: string
  ): Promise<ICart | null> {
    return await this.cartRepository.removeItem(userId, productId);
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(userId: string): Promise<ICart | null> {
    return await this.cartRepository.clearCart(userId);
  }

  /**
   * Sync: Replace the entire cart with a new set of items.
   * Used when the client pushes its local cart to the server.
   * Validates and populates product data for each item.
   */
  async syncCart(
    userId: string,
    items: Array<{ productId: string; quantity: number; size?: string; color?: string }>
  ): Promise<ICart> {
    // Populate each item with fresh product data
    const populatedItems: ICartItem[] = [];
    for (const item of items) {
      const product = await this.productRepository.getProductById(item.productId);
      if (!product) {
        // Skip items with invalid products rather than failing the whole sync
        continue;
      }

      populatedItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.images?.[0] || '',
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color,
      });
    }

    const cart = await this.cartRepository.syncCart(userId, populatedItems);
    if (!cart) {
      throw new Error('Failed to sync cart');
    }
    return cart;
  }
}

export default new CartService();

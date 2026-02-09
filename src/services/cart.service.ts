import Cart, { ICart, ICartItem } from '../models/cart.model';
import Product from '../models/product.model';

export class CartService {
  /**
   * Get the user's cart (or an empty cart structure if none exists).
   */
  async getCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
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
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new Error(`Product ${data.productId} not found`);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if same product + size + color already exists
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId === data.productId &&
        (item.size || '') === (data.size || '') &&
        (item.color || '') === (data.color || '')
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += data.quantity;
      // Refresh price from product in case it changed
      cart.items[existingIndex].price = product.price;
      cart.items[existingIndex].productName = product.name;
      cart.items[existingIndex].productImage = product.images?.[0] || '';
    } else {
      cart.items.push({
        productId: data.productId,
        productName: product.name,
        productImage: product.images?.[0] || '',
        quantity: data.quantity,
        price: product.price,
        size: data.size,
        color: data.color,
      });
    }

    await cart.save();
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
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    if (quantity <= 0) {
      // Remove the item
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId === productId &&
            (item.size || '') === (size || '') &&
            (item.color || '') === (color || '')
          )
      );
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId === productId &&
          (item.size || '') === (size || '') &&
          (item.color || '') === (color || '')
      );

      if (itemIndex < 0) {
        throw new Error('Item not found in cart');
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return cart;
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
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          (item.size || '') === (size || '') &&
          (item.color || '') === (color || '')
        )
    );

    await cart.save();
    return cart;
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(userId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    cart.items = [];
    await cart.save();
    return cart;
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
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Populate each item with fresh product data
    const populatedItems: ICartItem[] = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
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

    cart.items = populatedItems;
    await cart.save();
    return cart;
  }
}

export default new CartService();

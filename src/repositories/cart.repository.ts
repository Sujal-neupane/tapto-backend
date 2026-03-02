import CartModel, { ICart } from '../models/cart.model';

export interface ICartRepository {
    createCart(userId: string): Promise<ICart>;
    getCartByUserId(userId: string): Promise<ICart | null>;
    addItem(userId: string, item: any): Promise<ICart | null>;
    updateItem(userId: string, productId: string, updateData: any): Promise<ICart | null>;
    removeItem(userId: string, productId: string): Promise<ICart | null>;
    clearCart(userId: string): Promise<ICart | null>;
    syncCart(userId: string, items: any[]): Promise<ICart | null>;
    getCartItemsCount(userId: string): Promise<number>;
}

export class CartRepository implements ICartRepository {
    async createCart(userId: string): Promise<ICart> {
        const cart = new CartModel({ userId, items: [] });
        return await cart.save();
    }

    async getCartByUserId(userId: string): Promise<ICart | null> {
        return await CartModel.findOne({ userId })
            .populate('items.productId');
    }

    async addItem(userId: string, item: any): Promise<ICart | null> {
        let cart = await CartModel.findOne({ userId });
        
        if (!cart) {
            return await CartModel.findOneAndUpdate(
                { userId },
                { $push: { items: item } },
                { new: true, upsert: true }
            ).populate('items.productId');
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (i: any) => i.productId.toString() === item.productId && 
                       i.size === item.size && 
                       i.color === item.color
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item
            cart.items.push(item);
        }

        return await cart.save();
    }

    async updateItem(userId: string, productId: string, updateData: any): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId, 'items.productId': productId },
            { 
                $set: { 
                    'items.$.quantity': updateData.quantity,
                    'items.$.size': updateData.size,
                    'items.$.color': updateData.color
                } 
            },
            { new: true }
        ).populate('items.productId');
    }

    async removeItem(userId: string, productId: string): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } },
            { new: true }
        ).populate('items.productId');
    }

    async clearCart(userId: string): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { items: [] },
            { new: true }
        );
    }

    async syncCart(userId: string, items: any[]): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { items },
            { new: true, upsert: true }
        ).populate('items.productId');
    }

    async getCartItemsCount(userId: string): Promise<number> {
        const cart = await CartModel.findOne({ userId });
        if (!cart) return 0;
        
        return cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
    }
}

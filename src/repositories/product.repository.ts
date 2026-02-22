import ProductModel, { IProduct } from '../models/product.model';
import { ProductFilter } from '../types/product.types';

export interface IProductRepository {
    createProduct(productData: Partial<IProduct>): Promise<IProduct>;
    getProductById(id: string): Promise<IProduct | null>;
    getAllProducts(filter?: ProductFilter): Promise<IProduct[]>;
    updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<IProduct | null>;
    searchProducts(searchTerm: string): Promise<IProduct[]>;
    getProductsByCategory(category: string): Promise<IProduct[]>;
    getProductsBySubcategory(subcategory: string): Promise<IProduct[]>;
    getLowStockProducts(threshold?: number): Promise<IProduct[]>;
}

export class ProductRepository implements IProductRepository {
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        const product = new ProductModel(productData);
        return await product.save();
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await ProductModel.findById(id);
    }

    async getAllProducts(filter?: ProductFilter): Promise<IProduct[]> {
        const query: any = {};
        
        if (filter?.category) query.category = filter.category;
        if (filter?.subcategory) query.subcategory = filter.subcategory;
        if (filter?.isActive !== undefined) query.isActive = filter.isActive;
        if (filter?.inStock) query.stock = { $gt: 0 };
        
        if (filter?.minPrice || filter?.maxPrice) {
            query.price = {};
            if (filter.minPrice) query.price.$gte = filter.minPrice;
            if (filter.maxPrice) query.price.$lte = filter.maxPrice;
        }

        if (filter?.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: 'i' } },
                { description: { $regex: filter.search, $options: 'i' } },
                { tags: { $in: [new RegExp(filter.search, 'i')] } }
            ];
        }

        if (filter?.tags && filter.tags.length > 0) {
            query.tags = { $in: filter.tags };
        }

        let sortBy: any = { createdAt: -1 };
        if (filter?.sortBy) {
            const order = filter.sortOrder === 'asc' ? 1 : -1;
            sortBy = { [filter.sortBy]: order };
        }

        return await ProductModel.find(query)
            .sort(sortBy)
            .limit(filter?.limit || 50)
            .skip((filter?.page || 0) * (filter?.limit || 50));
    }

    async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteProduct(id: string): Promise<boolean> {
        const result = await ProductModel.findByIdAndDelete(id);
        return result ? true : false;
    }

    async updateStock(id: string, quantity: number): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true }
        );
    }

    async searchProducts(searchTerm: string): Promise<IProduct[]> {
        return await ProductModel.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { tags: { $in: [new RegExp(searchTerm, 'i')] } }
            ],
            isActive: true
        }).limit(20);
    }

    async getProductsByCategory(category: string): Promise<IProduct[]> {
        return await ProductModel.find({ category, isActive: true });
    }

    async getProductsBySubcategory(subcategory: string): Promise<IProduct[]> {
        return await ProductModel.find({ subcategory, isActive: true });
    }

    async getLowStockProducts(threshold: number = 5): Promise<IProduct[]> {
        return await ProductModel.find({ 
            stock: { $lte: threshold, $gt: 0 },
            isActive: true 
        });
    }
}

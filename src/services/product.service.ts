import { IProduct } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';
import { ProductFilter } from '../types/product.types';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    return await this.productRepository.createProduct(data);
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await this.productRepository.getProductById(id);
  }

  async getAllProducts(filter?: ProductFilter): Promise<IProduct[]> {
    return await this.productRepository.getAllProducts(filter);
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await this.productRepository.updateProduct(id, data);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return await this.productRepository.deleteProduct(id);
  }

  async searchProducts(searchTerm: string): Promise<IProduct[]> {
    return await this.productRepository.searchProducts(searchTerm);
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return await this.productRepository.getProductsByCategory(category);
  }

  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    return await this.productRepository.updateStock(id, quantity);
  }

  async getLowStockProducts(threshold: number = 5): Promise<IProduct[]> {
    return await this.productRepository.getLowStockProducts(threshold);
  }
}

export default new ProductService();

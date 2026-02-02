import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
} from '../controller/product_controller';

const router = Router();

// Public product routes (no authentication required)

// Get all products with optional filtering
// GET /api/products?category=Men&search=shoes&minPrice=10&maxPrice=100
router.get('/', getProducts);

// Get product categories
router.get('/categories', getCategories);

// Get products by category/fashion type
// GET /api/products/category/Men
router.get('/category/:category', getProductsByCategory);

// Get single product by ID
router.get('/:productId', getProductById);

export default router;

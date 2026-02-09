import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  syncCart,
} from '../controller/cart_controller';
import { authenticateToken } from '../middlewares/authorized.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/', addItem);

// Update item quantity
router.patch('/', updateItemQuantity);

// Sync entire cart (push local cart to server)
router.put('/sync', syncCart);

// Remove a specific item from cart
router.delete('/:productId', removeItem);

// Clear entire cart
router.delete('/', clearCart);

export default router;

import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  updateOrderStatus,
  updateLiveLocation,
} from '../controller/order_controller';
import { authenticateToken } from '../middlewares/authorized.middleware';
import { validateOrder } from '../middlewares/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create new order
router.post('/', validateOrder, createOrder);

// Get my orders
router.get('/my-orders', getMyOrders);

// Get order by ID
router.get('/:orderId', getOrderById);

// Track order (live tracking)
router.get('/:orderId/track', trackOrder);
 
// Cancel order
router.post('/:orderId/cancel', cancelOrder);

// Update order status (Admin only - add admin middleware)
router.patch('/:orderId/status', updateOrderStatus);

// Update live location (Delivery person only)
router.patch('/:orderId/location', updateLiveLocation);

export default router;
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { adminAuth } from '../middlewares/adminAuth';
import { uploadsUser } from '../middlewares/upload.midleware';
import * as adminController from '../controller/admin/admin_controller';
import {
  getDashboardStats,
  getAllUsers,
} from '../controller/admin/admin_controller';
import {
  getAllActivities,
  getUserActivities,
  getActivityStats,
} from '../controller/admin/activity_controller';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../controller/admin/product_controller';
import {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
} from '../controller/admin/order_management_controller';


// ...existing code...

const router = Router();
import { assignDriverToOrder } from '../controller/admin/driver_assignment_controller';

// All admin routes require admin authentication
router.use(adminAuth);

// Assign a delivery driver to an order
router.patch('/orders/:orderId/assign-driver', assignDriverToOrder);

router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);

// User Activities
router.get('/activities', getAllActivities);
router.get('/activities/stats', getActivityStats);
router.get('/users/:userId/activities', getUserActivities);

// Products
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const MAX_PRODUCT_IMAGE_SIZE_MB = 15;

const upload = multer({
  storage,
  limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.jpeg', '.jpg', '.png', '.webp', '.jfif'];
    const allowedMime = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/jfif',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const extname = allowedExt.includes(ext);
    const mimetype = allowedMime.includes(file.mimetype.toLowerCase());

    if (extname && mimetype) {
      cb(null, true);
    } else {
      const err: any = new Error('Only images are allowed (jpeg, jpg, png, webp, jfif)');
      err.statusCode = 400;
      cb(err);
    }
  },
});

// Admin user CRUD endpoints
router.post('/users', uploadsUser.single('profilePicture'), adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', uploadsUser.single('profilePicture'), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/products', getAllProducts);
router.post('/products', upload.array('images', 5), addProduct);
router.put('/products/:productId', upload.array('images', 5), updateProduct);
router.patch('/products/:productId', upload.array('images', 5), updateProduct);
router.delete('/products/:productId', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrderById);
router.patch('/orders/:orderId/status', updateOrderStatus);

export default router;

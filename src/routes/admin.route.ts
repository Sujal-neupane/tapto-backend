import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { adminAuth } from '../middlewares/adminAuth';
import * as adminController from '../controller/admin/admin_controller';
import {
  getDashboardStats,
  getAllUsers,
} from '../controller/admin/admin_controller';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../controller/admin/product_controller';
import {
  getAllOrders,
  updateOrderStatus,
} from '../controller/admin/order_management_controller';
const router = Router();

// All admin routes require admin authentication
router.use(adminAuth);

router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

router.get('/products', getAllProducts);
router.post('/products', upload.array('images', 5), addProduct);
router.put('/products/:productId', upload.array('images', 5), updateProduct);
router.delete('/products/:productId', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

export default router;

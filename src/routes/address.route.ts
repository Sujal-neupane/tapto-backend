import { Router } from 'express';
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controller/address_controller';
import { authenticateToken } from '../middlewares/authorized.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create new address
router.post('/', createAddress);

// Get all user addresses
router.get('/', getUserAddresses);

// Get specific address
router.get('/:addressId', getAddressById);

// Update address
router.put('/:addressId', updateAddress);

// Delete address
router.delete('/:addressId', deleteAddress);

// Set as default address
router.patch('/:addressId/default', setDefaultAddress);

export default router;
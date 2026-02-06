// routes/delivery_driver.route.ts
import { Router } from 'express';
import { createDriver, getDrivers, updateDriver, deleteDriver } from '../controller/delivery_driver_controller';

const router = Router();

router.post('/', createDriver);
router.get('/', getDrivers);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;

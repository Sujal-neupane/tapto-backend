// controllers/delivery_driver_controller.ts
import { Request, Response } from 'express';
import driverService from '../services/driver.service';
import { CreateDriverDTO, UpdateDriverDTO } from '../dtos/driver.dtos';

export const createDriver = async (req: Request, res: Response) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getDrivers = async (_req: Request, res: Response) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const success = await driverService.deleteDriver(req.params.id);
    if (!success) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// controllers/delivery_driver_controller.ts
import { Request, Response } from 'express';
import DeliveryDriver from '../models/delivery_driver.model';

export const createDriver = async (req: Request, res: Response) => {
  try {
    const driver = await DeliveryDriver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getDrivers = async (_req: Request, res: Response) => {
  try {
    const drivers = await DeliveryDriver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const driver = await DeliveryDriver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const driver = await DeliveryDriver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

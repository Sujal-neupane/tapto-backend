import DeliveryDriverModel, { IDeliveryDriver } from '../models/delivery_driver.model';

export interface IDriverRepository {
    createDriver(driverData: Partial<IDeliveryDriver>): Promise<IDeliveryDriver>;
    getDriverById(id: string): Promise<IDeliveryDriver | null>;
    getAllDrivers(): Promise<IDeliveryDriver[]>;
    getAvailableDrivers(): Promise<IDeliveryDriver[]>;
    updateDriver(id: string, updateData: Partial<IDeliveryDriver>): Promise<IDeliveryDriver | null>;
    deleteDriver(id: string): Promise<boolean>;
    setAvailability(id: string, isAvailable: boolean): Promise<IDeliveryDriver | null>;
    updateLocation(id: string, location: { lat: number; lng: number }): Promise<IDeliveryDriver | null>;
    getDriverByEmail(email: string): Promise<IDeliveryDriver | null>;
}

export class DriverRepository implements IDriverRepository {
    async createDriver(driverData: Partial<IDeliveryDriver>): Promise<IDeliveryDriver> {
        const driver = new DeliveryDriverModel(driverData);
        return await driver.save();
    }

    async getDriverById(id: string): Promise<IDeliveryDriver | null> {
        return await DeliveryDriverModel.findById(id);
    }

    async getAllDrivers(): Promise<IDeliveryDriver[]> {
        return await DeliveryDriverModel.find().sort({ createdAt: -1 });
    }

    async getAvailableDrivers(): Promise<IDeliveryDriver[]> {
        return await DeliveryDriverModel.find({ isAvailable: true });
    }

    async updateDriver(id: string, updateData: Partial<IDeliveryDriver>): Promise<IDeliveryDriver | null> {
        return await DeliveryDriverModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteDriver(id: string): Promise<boolean> {
        const result = await DeliveryDriverModel.findByIdAndDelete(id);
        return result ? true : false;
    }

    async setAvailability(id: string, isAvailable: boolean): Promise<IDeliveryDriver | null> {
        return await DeliveryDriverModel.findByIdAndUpdate(
            id,
            { isAvailable },
            { new: true }
        );
    }

    async updateLocation(id: string, location: { lat: number; lng: number }): Promise<IDeliveryDriver | null> {
        return await DeliveryDriverModel.findByIdAndUpdate(
            id,
            { currentLocation: location },
            { new: true }
        );
    }

    async getDriverByEmail(email: string): Promise<IDeliveryDriver | null> {
        return await DeliveryDriverModel.findOne({ email });
    }
}

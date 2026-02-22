import { IDeliveryDriver } from '../models/delivery_driver.model';
import { DriverRepository } from '../repositories/driver.repository';

export class DriverService {
  private driverRepository: DriverRepository;

  constructor() {
    this.driverRepository = new DriverRepository();
  }

  async createDriver(data: Partial<IDeliveryDriver>): Promise<IDeliveryDriver> {
    return await this.driverRepository.createDriver(data);
  }

  async getDriverById(id: string): Promise<IDeliveryDriver | null> {
    return await this.driverRepository.getDriverById(id);
  }

  async getAllDrivers(): Promise<IDeliveryDriver[]> {
    return await this.driverRepository.getAllDrivers();
  }

  async getAvailableDrivers(): Promise<IDeliveryDriver[]> {
    return await this.driverRepository.getAvailableDrivers();
  }

  async updateDriver(id: string, data: Partial<IDeliveryDriver>): Promise<IDeliveryDriver | null> {
    return await this.driverRepository.updateDriver(id, data);
  }

  async deleteDriver(id: string): Promise<boolean> {
    return await this.driverRepository.deleteDriver(id);
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<IDeliveryDriver | null> {
    return await this.driverRepository.setAvailability(id, isAvailable);
  }

  async updateLocation(id: string, location: { lat: number; lng: number }): Promise<IDeliveryDriver | null> {
    return await this.driverRepository.updateLocation(id, location);
  }

  async getDriverByEmail(email: string): Promise<IDeliveryDriver | null> {
    return await this.driverRepository.getDriverByEmail(email);
  }
}

export default new DriverService();

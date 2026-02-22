import { IAddress } from '../models/address.model';
import { AddressRepository } from '../repositories/address.repository';

export class AddressService {
  private addressRepository: AddressRepository;

  constructor() {
    this.addressRepository = new AddressRepository();
  }

  async createAddress(data: {
    userId: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<IAddress> {
    return await this.addressRepository.createAddress(data as any);
  }

  async getUserAddresses(userId: string): Promise<IAddress[]> {
    return await this.addressRepository.getAddressesByUserId(userId);
  }

  async getAddressById(addressId: string, userId: string): Promise<IAddress | null> {
    const address = await this.addressRepository.getAddressById(addressId);
    // Verify the address belongs to the user
    if (address && address.userId.toString() !== userId) {
      return null;
    }
    return address;
  }

  async updateAddress(
    addressId: string,
    userId: string,
    updates: Partial<{
      fullName: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      isDefault: boolean;
    }>
  ): Promise<IAddress | null> {
    // Verify ownership first
    const address = await this.getAddressById(addressId, userId);
    if (!address) return null;

    return await this.addressRepository.updateAddress(addressId, updates);
  }

  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    // Verify ownership first
    const address = await this.getAddressById(addressId, userId);
    if (!address) return false;

    return await this.addressRepository.deleteAddress(addressId);
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<IAddress | null> {
    // Verify ownership first
    const address = await this.getAddressById(addressId, userId);
    if (!address) return null;

    return await this.addressRepository.setDefaultAddress(userId, addressId);
  }
}

export default new AddressService();
import { AddressModel, IAddress } from '../models/address.model';

export class AddressService {
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
    // If this is the default address, unset other defaults
    if (data.isDefault) {
      await AddressModel.updateMany(
        { userId: data.userId },
        { isDefault: false }
      );
    }

    const address = new AddressModel(data);
    return address.save();
  }

  async getUserAddresses(userId: string): Promise<IAddress[]> {
    return AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async getAddressById(addressId: string, userId: string): Promise<IAddress | null> {
    return AddressModel.findOne({ _id: addressId, userId });
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
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await AddressModel.updateMany(
        { userId, _id: { $ne: addressId } },
        { isDefault: false }
      );
    }

    return AddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      updates,
      { new: true }
    );
  }

  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    const result = await AddressModel.findOneAndDelete({ _id: addressId, userId });
    return result !== null;
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<IAddress | null> {
    // Unset all defaults for this user
    await AddressModel.updateMany({ userId }, { isDefault: false });

    // Set the specified address as default
    return AddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { isDefault: true },
      { new: true }
    );
  }
}

export default new AddressService();
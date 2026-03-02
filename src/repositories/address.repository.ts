import { AddressModel, IAddress } from '../models/address.model';

export interface IAddressRepository {
    createAddress(addressData: Partial<IAddress>): Promise<IAddress>;
    getAddressById(id: string): Promise<IAddress | null>;
    getAddressesByUserId(userId: string): Promise<IAddress[]>;
    getDefaultAddress(userId: string): Promise<IAddress | null>;
    updateAddress(id: string, updateData: Partial<IAddress>): Promise<IAddress | null>;
    deleteAddress(id: string): Promise<boolean>;
    setDefaultAddress(userId: string, addressId: string): Promise<IAddress | null>;
}

export class AddressRepository implements IAddressRepository {
    async createAddress(addressData: Partial<IAddress>): Promise<IAddress> {
        // If this is set as default, unset other default addresses
        if (addressData.isDefault && addressData.userId) {
            await AddressModel.updateMany(
                { userId: addressData.userId },
                { isDefault: false }
            );
        }

        const address = new AddressModel(addressData);
        return await address.save();
    }

    async getAddressById(id: string): Promise<IAddress | null> {
        return await AddressModel.findById(id);
    }

    async getAddressesByUserId(userId: string): Promise<IAddress[]> {
        return await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    }

    async getDefaultAddress(userId: string): Promise<IAddress | null> {
        return await AddressModel.findOne({ userId, isDefault: true });
    }

    async updateAddress(id: string, updateData: Partial<IAddress>): Promise<IAddress | null> {
        const address = await AddressModel.findById(id);
        if (!address) return null;

        // If setting as default, unset other default addresses
        if (updateData.isDefault && address.userId) {
            await AddressModel.updateMany(
                { userId: address.userId, _id: { $ne: id } },
                { isDefault: false }
            );
        }

        return await AddressModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteAddress(id: string): Promise<boolean> {
        const result = await AddressModel.findByIdAndDelete(id);
        return result ? true : false;
    }

    async setDefaultAddress(userId: string, addressId: string): Promise<IAddress | null> {
        // Unset all default addresses for this user
        await AddressModel.updateMany(
            { userId },
            { isDefault: false }
        );

        // Set the specified address as default
        return await AddressModel.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true }
        );
    }
}

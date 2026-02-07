import { Request, Response } from 'express';
import addressService, { AddressService } from '../services/address.service';
import { successResponse, errorResponse } from '../utils/response';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !phone || !street || !city || !state || !zipCode || !country) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    const address = await addressService.createAddress({
      userId,
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });

    return successResponse(res, address, 'Address created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const addresses = await addressService.getUserAddresses(userId);
    return successResponse(res, addresses);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getAddressById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId } = req.params;

    const address = await addressService.getAddressById(addressId, userId);
    if (!address) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, address);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId } = req.params;
    const updates = req.body;

    const address = await addressService.updateAddress(addressId, userId, updates);
    if (!address) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, address, 'Address updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId } = req.params;

    const deleted = await addressService.deleteAddress(addressId, userId);
    if (!deleted) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, null, 'Address deleted successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId } = req.params;

    const address = await addressService.setDefaultAddress(addressId, userId);
    if (!address) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, address, 'Default address set successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
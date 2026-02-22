import z from 'zod';

// Create Address DTO
export const CreateAddressDTO = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional().default(false),
});
export type CreateAddressDTO = z.infer<typeof CreateAddressDTO>;

// Update Address DTO
export const UpdateAddressDTO = CreateAddressDTO.partial();
export type UpdateAddressDTO = z.infer<typeof UpdateAddressDTO>;

// Set Default Address DTO
export const SetDefaultAddressDTO = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
});
export type SetDefaultAddressDTO = z.infer<typeof SetDefaultAddressDTO>;

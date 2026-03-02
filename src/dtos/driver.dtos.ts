import z from 'zod';

// Create Delivery Driver DTO
export const CreateDriverDTO = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  avatarUrl: z.string().optional(),
  isAvailable: z.boolean().optional().default(true),
});
export type CreateDriverDTO = z.infer<typeof CreateDriverDTO>;

// Update Driver DTO
export const UpdateDriverDTO = CreateDriverDTO.partial();
export type UpdateDriverDTO = z.infer<typeof UpdateDriverDTO>;

// Assign Driver DTO
export const AssignDriverDTO = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
});
export type AssignDriverDTO = z.infer<typeof AssignDriverDTO>;

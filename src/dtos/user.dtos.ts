import z from 'zod';
import { UserSchema } from '../types/user.types';

// Register DTO - extends from UserSchema
export const CreateUserDTO = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string().min(1), // Allow any password length
    shoppingPreference: z.enum(["Mens Fashion", "Womens Fashion"]).optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(1), // Allow any password length
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema
    .omit({ role: true, password: true, email: true })
    .partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
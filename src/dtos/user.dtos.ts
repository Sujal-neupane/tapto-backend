import z from 'zod';
import { UserSchema } from '../types/user.types';

// Register DTO - extends from UserSchema
export const CreateUserDTO = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin"]).optional(),


});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

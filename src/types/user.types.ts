import z from 'zod';

export const UserSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    shoppingPreference: z.enum(['streetwear', 'both']).optional(),
    role: z.enum(['user', 'admin']).default('user'),
});

export type UserType = z.infer<typeof UserSchema>;

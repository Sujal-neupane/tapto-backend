import z from 'zod';


export const UserSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    shoppingPreference: z.enum(['Mens Fashion', 'Womens Fashion']).optional(),
    role: z.enum(['user', 'admin']).default('user'),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;

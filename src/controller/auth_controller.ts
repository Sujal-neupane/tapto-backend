import { UserService } from '../services/user.service';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dtos/user.dtos';
import { Request, Response } from 'express';
import z from 'zod';
import { normalizeUploadedImage } from '../utils/image';

const userService = new UserService();

// Extend Express Request interface to include 'user'
interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export class AuthController {
    // Upload profile picture
    async uploadProfilePicture(req: Request, res: Response) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const normalizedFile = await normalizeUploadedImage(req.file);
            // Always use the actual filename saved by multer
            const filePath = `/uploads/users/${normalizedFile.filename}`;
            // Save file path to user
            const updatedUser = await userService.updateUser(userId, { profilePicture: filePath });
            return res.status(200).json({
                success: true,
                message: 'Profile picture uploaded successfully',
                data: { profilePicture: filePath, user: updatedUser }
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    }

    async register(req: Request, res: Response) {
        try {
            console.log('=== REGISTER REQUEST ===');
            console.log('Body:', JSON.stringify(req.body, null, 2));
            
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                console.log('Validation failed:', parsedData.error.issues);
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues
                });
            }
            console.log('Validated data:', parsedData.data);
            
            const userData: CreateUserDTO = parsedData.data;
            const { token, user } = await userService.createUser(userData);
            console.log('User created successfully:', user.email);
            
            return res.status(201).json({
                success: true,
                message: 'User Created',
                data: user,
                token
            });
        } catch (error: Error | any) {
            console.log('Register error:', error.message);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            console.log('=== LOGIN REQUEST ===');
            console.log('Email:', req.body.email);
            
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                console.log('Validation failed:', parsedData.error.issues);
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues
                });
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            console.log('Login successful:', user.email, 'Role:', user.role);
            
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: user,
                token
            });
        } catch (error: Error | any) {
            console.log('Login error:', error.message);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    }

    async getUser(req: Request, res: Response) {
        try{
            const userId = (req as AuthenticatedRequest).user?.id;
            if(!userId){
                return res.status(401).json(
                    {success: false, message: 'Unauthorized'}
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                {success: true, message: 'User fetched successfully', data: user}
            );
        } catch (error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {
                    success: false,
                    message: error.message || 'Internal Server Error'
                }
                )
            }
        }

    async updateUser(req: Request, res: Response) {
        try{
            const userId = (req as AuthenticatedRequest).user?.id;
            if(!userId){
                return res.status(401).json(
                    {success: false, message: 'Unauthorized'}
                );
            }
            const parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues
                });
            }
            const updateData: UpdateUserDTO = parsedData.data;
            const updatedUser = await userService.updateUser(userId, updateData);
            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {
                    success: false,
                    message: error.message || 'Internal Server Error'
                }
                )
            }
        }

        // PUT /api/auth/:id (with Multer)
        async updateUserById(req: Request, res: Response) {
            try {
                const userId = req.params.id;
                let updateData: any = req.body;
                if (req.file) {
                    const normalizedFile = await normalizeUploadedImage(req.file);
                    updateData.profilePicture = `/uploads/users/${normalizedFile.filename}`;
                    console.log("📸 File uploaded and normalized:", {
                        original: req.file.filename,
                        normalized: normalizedFile.filename,
                        path: updateData.profilePicture
                    });
                }
                // Remove undefined fields
                Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
                console.log("📝 Updating user with data:", updateData);
                const updatedUser = await userService.updateUser(userId, updateData);
                console.log("✅ User updated, returning:", updatedUser);
                return res.status(200).json({
                    success: true,
                    message: 'User updated successfully',
                    data: updatedUser
                });
            } catch (error: Error | any) {
                console.error("❌ Error updating user:", error);
                return res.status(error.statusCode ?? 500).json({
                    success: false,
                    message: error.message || 'Internal Server Error'
                });
            }
        }

        async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

           const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
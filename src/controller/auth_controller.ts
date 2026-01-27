import { UserService } from '../services/user.service';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dtos/user.dtos';
import { Request, Response } from 'express';
import z from 'zod';

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
            // Always use the actual filename saved by multer
            const filePath = `/uploads/${req.file.filename}`;
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
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues
                });
            }
            const userData: CreateUserDTO = parsedData.data;
            const { token, user } = await userService.createUser(userData);
            return res.status(201).json({
                success: true,
                message: 'User Created',
                data: user,
                token
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues
                });
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: user,
                token
            });
        } catch (error: Error | any) {
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
}
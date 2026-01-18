import { CreateUserDTO, LoginUserDTO } from '../dtos/user.dtos';
import { UserRepository } from '../repositories/user.repository';
import bcryptjs from 'bcryptjs';
import { HttpError } from '../errors/http-error';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

const userRepository = new UserRepository();

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Create a new user
     */
    async createUser(data: CreateUserDTO) {
        // Check if email already exists
        const emailCheck = await this.userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, 'Email already in use');
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;

        // Create user
        const newUser = await this.userRepository.createUser(data);
        
        // Generate JWT token for new user
        const payload = {
            id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            phoneNumber: newUser.phoneNumber,
            shoppingPreference: newUser.shoppingPreference
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        return { token, user: payload };
    }

    /**
     * Login user and generate JWT token
     */
    async loginUser(data: LoginUserDTO) {
        const user = await this.userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        // Compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if (!validPassword) {
            throw new HttpError(401, 'Invalid credentials');
        }

        // Generate JWT
        const payload = {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phoneNumber: user.phoneNumber,
            shoppingPreference: user.shoppingPreference
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        return { token, user: payload };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        return this.formatUserResponse(user);
    }

    /**
     * Format user response (exclude sensitive data)
     */
    private formatUserResponse(user: any) {
        return {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            shoppingPreference: user.shoppingPreference,
            PhoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
        };
    }
}
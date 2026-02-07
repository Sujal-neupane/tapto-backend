
import { Router } from 'express';
import { AuthController } from '../controller/auth_controller';
import { authenticateToken } from '../middlewares/authorized.middleware';
import { uploadsUser } from '../middlewares/upload.midleware';

const authController = new AuthController();
const router = Router();
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.resetPassword);

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authenticateToken, authController.getUser);

router.put('/update-profile', authenticateToken, authController.updateUser);

// Update user by ID with Multer (for admin or self)
router.put('/:id', authenticateToken, uploadsUser.single('profilePicture'), authController.updateUserById);

// Profile picture upload route
router.post('/upload-profile-picture', authenticateToken, uploadsUser.single('profilePicture'), authController.uploadProfilePicture);

export default router; 
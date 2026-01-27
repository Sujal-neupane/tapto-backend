
import { Router } from 'express';
import { AuthController } from '../controller/auth_controller';
import { authenticateToken } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.midleware';

const authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.put('/update-profile', authenticateToken, authController.updateUser);

// Profile picture upload route
router.post('/upload-profile-picture', authenticateToken, uploads.single('profilePicture'), authController.uploadProfilePicture);

export default router;
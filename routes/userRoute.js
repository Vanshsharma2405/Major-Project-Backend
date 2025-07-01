import express from 'express';
import { loginUser,registerUser,adminLogin,googleLogin,forgotPassword,updateProfilePicture,removeProfilePicture,getUserProfile } from '../controllers/userController.js';
import { authUser } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/google-login', googleLogin);
userRouter.post('/forgot-password', forgotPassword);

// Protected routes (require authentication)
userRouter.get('/profile', authUser, getUserProfile);
userRouter.put('/profile-picture', authUser, updateProfilePicture);
userRouter.delete('/profile-picture', authUser, removeProfilePicture);

export default userRouter;
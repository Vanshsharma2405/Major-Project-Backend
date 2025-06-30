import express from 'express';
import { loginUser,registerUser,adminLogin,googleLogin,forgotPassword } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/google-login', googleLogin);
userRouter.post('/forgot-password', forgotPassword);

export default userRouter;
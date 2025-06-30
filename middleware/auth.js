import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Middleware to verify JWT token
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Please login again.'
            });
        }

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        // Add user to request object
        req.user = user;
        req.body.userId = decoded.id; // Keep for backward compatibility
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Middleware to verify admin
const authAdmin = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Admin login required.'
            });
        }

        // For admin, we use a different token structure
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's admin token (simple check for now)
        if (decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Admin access required.'
            });
        }

    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid admin token'
        });
    }
};

export { authUser, authAdmin };
export default authUser;

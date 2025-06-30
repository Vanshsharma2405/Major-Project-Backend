import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { OAuth2Client } from 'google-auth-library';

const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
}

// Initialize Google OAuth client
let client;
try {
    if (process.env.GOOGLE_CLIENT_ID) {
        client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    } else {
        console.warn('GOOGLE_CLIENT_ID not found in environment variables. Google OAuth will not work.');
    }
} catch (error) {
    console.error('Failed to initialize Google OAuth client:', error.message);
}

// Route for User Login
const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;

        console.log('🔍 Login attempt for email:', email);

        // Validate email & password
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Find user by email (case insensitive)
        const user = await userModel.findOne({email: email.toLowerCase()});
        console.log('👤 User found:', user ? `Yes (${user.name})` : 'No');

        // Check if user exists
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: "User doesn't exist. Please check your email or sign up."
            });
        }

        // Check if password matches
        console.log('🔐 Checking password for user:', user.email);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔐 Password match:', isMatch ? 'Yes' : 'No');

        if (isMatch) {
            // Create token
            const token = createToken(user._id);
            console.log('✅ Login successful for:', user.email);

            // Return success response with token and user data
            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            console.log('❌ Password mismatch for:', user.email);
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// Route for User register
const registerUser = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();
        console.log('📧 Registration attempt for email:', normalizedEmail);

        // Check if user already exists
        const exists = await userModel.findOne({email: normalizedEmail});

        if (exists) {
            console.log('❌ User already exists:', normalizedEmail);
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new userModel({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        console.log('👤 Creating new user:', normalizedEmail);

        // Save user to database
        const user = await newUser.save();

        // Create token
        const token = createToken(user._id);

        // Return success response with token and user data
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// Route for Admin Login
const adminLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        }

        else{
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }

}

// Route for Google OAuth Login
const googleLogin = async(req, res) => {
    try {
        const { token } = req.body;

        // Check if Google OAuth is configured
        if (!client) {
            return res.status(500).json({
                success: false,
                message: "Google OAuth is not configured properly"
            });
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google token is required"
            });
        }

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user already exists
        let user = await userModel.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = new userModel({
                name,
                email,
                password: '', // No password for Google OAuth users
                isGoogleUser: true,
                profilePicture: picture
            });
            await user.save();
        }

        // Create JWT token
        const jwtToken = createToken(user._id);

        res.status(200).json({
            success: true,
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({
            success: false,
            message: "Google authentication failed"
        });
    }
}

// Route for Forgot Password
const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address"
            });
        }

        // For now, just return success message
        // In production, you would send an actual email with reset link
        res.status(200).json({
            success: true,
            message: "Password reset instructions have been sent to your email"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

export{loginUser, registerUser, adminLogin, googleLogin, forgotPassword}
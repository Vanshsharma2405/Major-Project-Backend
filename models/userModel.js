import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: function() {
            return !this.isGoogleUser;
        }
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;

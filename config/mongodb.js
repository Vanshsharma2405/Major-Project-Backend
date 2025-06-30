import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
    try {
        // Check if MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Set up MongoDB connection events
        mongoose.connection.on('connected', () => {
            console.log("✅ MongoDB Connected Successfully");
            console.log(`📊 Database: stepstyle`);
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ MongoDB Disconnected");
        });

        // Connect to MongoDB with improved options
        await mongoose.connect(`${process.env.MONGODB_URI}/stepstyle`, {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);

        if (retries > 0) {
            console.log(`🔄 Retrying connection... (${retries} attempts left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            console.error('💀 All connection attempts failed. Exiting...');
            process.exit(1);
        }
    }
}

export default connectDB;
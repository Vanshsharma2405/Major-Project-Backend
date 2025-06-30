const mongoose = require('mongoose');

// MongoDB connection string
// Replace with your actual MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/stepstyle';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;

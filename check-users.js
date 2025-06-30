// Check users in database
import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import 'dotenv/config';

async function checkUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URI}/stepstyle`);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await userModel.find({});
        console.log(`📊 Total users in database: ${users.length}`);
        
        if (users.length > 0) {
            console.log('\n👥 Users in database:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, ID: ${user._id}`);
            });
        } else {
            console.log('❌ No users found in database');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

checkUsers();

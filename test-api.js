// Test API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:4000/api';

// Test user registration
async function testRegister() {
    try {
        console.log('🧪 Testing user registration...');
        
        const response = await fetch(`${API_BASE_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            }),
        });

        const data = await response.json();
        console.log('📝 Registration Response:', data);
        
        if (data.success) {
            console.log('✅ Registration successful!');
            return data.token;
        } else {
            console.log('❌ Registration failed:', data.message);
        }
    } catch (error) {
        console.error('💥 Registration error:', error.message);
    }
}

// Test user login
async function testLogin() {
    try {
        console.log('🧪 Testing user login...');
        
        const response = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            }),
        });

        const data = await response.json();
        console.log('📝 Login Response:', data);
        
        if (data.success) {
            console.log('✅ Login successful!');
            return data.token;
        } else {
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.error('💥 Login error:', error.message);
    }
}

// Test server health
async function testHealth() {
    try {
        console.log('🧪 Testing server health...');
        
        const response = await fetch('http://localhost:4000/');
        const text = await response.text();
        
        console.log('📝 Health Response:', text);
        console.log('✅ Server is running!');
    } catch (error) {
        console.error('💥 Server health error:', error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API tests...\n');
    
    await testHealth();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testRegister();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testLogin();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🏁 Tests completed!');
}

runTests();

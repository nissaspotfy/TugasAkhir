const axios = require('axios');

async function testAddressCreation() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'user@example.com',
            password: 'password123'
        });
        const token = loginRes.data.data.token;
        console.log('Login successful, token obtained.');

        // 2. Create Address
        const addressData = {
            recipient_name: "Test User",
            phone_number: "08123456789",
            address_line: "Jalan Test 123",
            city: "Jakarta",
            postal_code: "12345",
            latitude: -6.175392,
            longitude: 106.827153,
            is_primary: true
        };

        const createRes = await axios.post('http://localhost:3000/v1/addresses', addressData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Address Creation Response Data:', createRes.data);
        
        if (createRes.data.data && createRes.data.data.id) {
            console.log('SUCCESS: Address created with ID:', createRes.data.data.id);
        } else {
            console.error('FAILURE: Address created but ID is missing:', createRes.data.data);
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testAddressCreation();

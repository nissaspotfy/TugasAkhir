const http = require('http');

function postRequest(path, data, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function test() {
    try {
        // 1. Login
        const loginData = JSON.stringify({ email: 'user@example.com', password: 'password123' });
        console.log('Logging in...');
        const loginRes = await postRequest('/v1/auth/login', loginData);
        
        if (loginRes.statusCode !== 200) {
            console.error('Login failed:', loginRes.data);
            return;
        }
        
        const token = loginRes.data.data.token;
        console.log('Login successful.');

        // 2. Create Address
        const addressData = JSON.stringify({
            recipient_name: "Test User 2",
            phone_number: "08123456789",
            address_line: "Jalan Test 456",
            city: "Jakarta",
            postal_code: "12345",
            latitude: -6.175392,
            longitude: 106.827153,
            is_primary: true
        });

        console.log('Creating address...');
        const createRes = await postRequest('/v1/addresses', addressData, token);
        
        console.log('Address Creation Response:', JSON.stringify(createRes.data, null, 2));

        if (createRes.data.data && createRes.data.data.id) {
            console.log('SUCCESS: ID present:', createRes.data.data.id);
        } else {
            console.log('FAILURE: ID missing');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();

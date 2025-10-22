// Smart Waste Management System - API Testing Examples
// This file contains examples and utilities for testing the API endpoints

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
    BASE_URL: 'http://localhost:5000',
    TIMEOUT: 5000
};

// Sample test data
const SAMPLE_BINS = [
    {
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'Empty'
    },
    {
        latitude: 40.7589,
        longitude: -73.9851,
        status: 'Half-Full'
    },
    {
        latitude: 40.7505,
        longitude: -73.9934,
        status: 'Full'
    }
];

/**
 * Make HTTP request (Promise-based)
 * @param {string} method - HTTP method
 * @param {string} path - API endpoint path
 * @param {object} data - Request data (for POST/PUT)
 * @returns {Promise} Response data
 */
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(CONFIG.BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Smart-Waste-Test-Client/1.0'
            },
            timeout: CONFIG.TIMEOUT
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Test server health check
 */
async function testHealthCheck() {
    console.log('🏥 Testing health check...');
    try {
        const response = await makeRequest('GET', '/health');
        if (response.statusCode === 200) {
            console.log('✅ Health check passed');
            console.log('📊 Server status:', response.data);
            return true;
        } else {
            console.log('❌ Health check failed:', response.statusCode);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

/**
 * Test getting all bins
 */
async function testGetBins() {
    console.log('📦 Testing GET /api/bins...');
    try {
        const response = await makeRequest('GET', '/api/bins');
        if (response.statusCode === 200) {
            console.log('✅ GET bins successful');
            console.log(`📊 Found ${response.data.count} bins`);
            return response.data.data;
        } else {
            console.log('❌ GET bins failed:', response.statusCode);
            return [];
        }
    } catch (error) {
        console.log('❌ GET bins error:', error.message);
        return [];
    }
}

/**
 * Test adding a new bin
 */
async function testAddBin(binData) {
    console.log('➕ Testing POST /api/bins...');
    try {
        const response = await makeRequest('POST', '/api/bins', binData);
        if (response.statusCode === 201) {
            console.log('✅ POST bin successful');
            console.log('📍 Created bin:', response.data.data._id);
            return response.data.data;
        } else {
            console.log('❌ POST bin failed:', response.statusCode);
            console.log('📄 Error:', response.data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ POST bin error:', error.message);
        return null;
    }
}

/**
 * Test updating bin status
 */
async function testUpdateBin(binId, newStatus) {
    console.log('🔄 Testing PUT /api/bins/:id...');
    try {
        const response = await makeRequest('PUT', `/api/bins/${binId}`, { status: newStatus });
        if (response.statusCode === 200) {
            console.log('✅ PUT bin successful');
            console.log('📝 Updated status to:', newStatus);
            return response.data.data;
        } else {
            console.log('❌ PUT bin failed:', response.statusCode);
            console.log('📄 Error:', response.data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ PUT bin error:', error.message);
        return null;
    }
}

/**
 * Test deleting a bin
 */
async function testDeleteBin(binId) {
    console.log('🗑️ Testing DELETE /api/bins/:id...');
    try {
        const response = await makeRequest('DELETE', `/api/bins/${binId}`);
        if (response.statusCode === 200) {
            console.log('✅ DELETE bin successful');
            return true;
        } else {
            console.log('❌ DELETE bin failed:', response.statusCode);
            return false;
        }
    } catch (error) {
        console.log('❌ DELETE bin error:', error.message);
        return false;
    }
}

/**
 * Test nearby bins endpoint
 */
async function testNearbyBins(lat = 40.7128, lng = -74.0060, radius = 5) {
    console.log('🎯 Testing GET /api/bins/nearby...');
    try {
        const response = await makeRequest('GET', `/api/bins/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        if (response.statusCode === 200) {
            console.log('✅ Nearby bins test successful');
            console.log(`📊 Found ${response.data.count} bins within ${radius}km`);
            return response.data.data;
        } else {
            console.log('❌ Nearby bins test failed:', response.statusCode);
            return [];
        }
    } catch (error) {
        console.log('❌ Nearby bins test error:', error.message);
        return [];
    }
}

/**
 * Run comprehensive API tests
 */
async function runAllTests() {
    console.log('🚀 Starting API Test Suite...\n');

    // Test 1: Health Check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.log('🛑 Server is not healthy. Please start the server first.');
        return;
    }
    console.log('');

    // Test 2: Get all bins
    const existingBins = await testGetBins();
    console.log('');

    // Test 3: Add new bins
    console.log('📝 Adding sample bins...');
    const createdBins = [];
    for (let i = 0; i < SAMPLE_BINS.length; i++) {
        const bin = SAMPLE_BINS[i];
        const created = await testAddBin(bin);
        if (created) {
            createdBins.push(created);
        }
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('');

    // Test 4: Update bin status
    if (createdBins.length > 0) {
        const binToUpdate = createdBins[0];
        await testUpdateBin(binToUpdate._id, 'Full');
        console.log('');
    }

    // Test 5: Test nearby bins
    await testNearbyBins();
    console.log('');

    // Test 6: Get all bins again to see changes
    const finalBins = await testGetBins();
    console.log('');

    // Test 7: Clean up (delete test bins)
    if (createdBins.length > 0) {
        console.log('🧹 Cleaning up test data...');
        for (const bin of createdBins) {
            await testDeleteBin(bin._id);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('');
    }

    // Final summary
    console.log('📊 Test Suite Summary:');
    console.log(`   Initial bins: ${existingBins.length}`);
    console.log(`   Created bins: ${createdBins.length}`);
    console.log(`   Final bins: ${finalBins.length}`);
    console.log('\n✅ API Test Suite completed!');
}

/**
 * Test error handling
 */
async function testErrorHandling() {
    console.log('🚨 Testing error handling...\n');

    // Test invalid data
    console.log('Testing invalid bin data...');
    await testAddBin({ latitude: 'invalid', longitude: 'invalid', status: 'invalid' });
    console.log('');

    // Test missing required fields
    console.log('Testing missing required fields...');
    await testAddBin({ latitude: 40.7128 }); // Missing longitude and status
    console.log('');

    // Test out of range coordinates
    console.log('Testing out of range coordinates...');
    await testAddBin({ latitude: 91, longitude: 181, status: 'Empty' });
    console.log('');

    // Test invalid bin ID
    console.log('Testing invalid bin ID...');
    await testUpdateBin('invalid-id', 'Empty');
    console.log('');

    console.log('✅ Error handling tests completed!');
}

/**
 * Performance test - add multiple bins quickly
 */
async function performanceTest(count = 10) {
    console.log(`⚡ Running performance test with ${count} bins...\n`);

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < count; i++) {
        const bin = {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            status: ['Empty', 'Half-Full', 'Full'][Math.floor(Math.random() * 3)]
        };
        promises.push(testAddBin(bin));
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successful = results.filter(result => result !== null).length;

    console.log(`📊 Performance Test Results:`);
    console.log(`   Total requests: ${count}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${count - successful}`);
    console.log(`   Total time: ${duration}ms`);
    console.log(`   Average time per request: ${(duration / count).toFixed(2)}ms`);

    // Clean up performance test data
    console.log('\n🧹 Cleaning up performance test data...');
    const bins = await testGetBins();
    const testBins = bins.slice(-successful); // Get the last 'successful' bins

    for (const bin of testBins) {
        await testDeleteBin(bin._id);
    }

    console.log('✅ Performance test completed!');
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    switch (command.toLowerCase()) {
        case 'health':
            testHealthCheck();
            break;
        case 'get':
            testGetBins();
            break;
        case 'add':
            testAddBin(SAMPLE_BINS[0]);
            break;
        case 'nearby':
            testNearbyBins();
            break;
        case 'errors':
            testErrorHandling();
            break;
        case 'performance':
            const count = parseInt(args[1]) || 10;
            performanceTest(count);
            break;
        case 'all':
        default:
            runAllTests();
            break;
    }
}

// Export functions for use in other modules
module.exports = {
    makeRequest,
    testHealthCheck,
    testGetBins,
    testAddBin,
    testUpdateBin,
    testDeleteBin,
    testNearbyBins,
    runAllTests,
    testErrorHandling,
    performanceTest,
    SAMPLE_BINS,
    CONFIG
};

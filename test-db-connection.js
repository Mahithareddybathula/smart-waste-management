#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Smart Waste Management System
 *
 * This script tests the database connection and performs basic operations
 * Run with: node test-db-connection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function header(message) {
    console.log('\n' + '='.repeat(60));
    log(message, 'cyan');
    console.log('='.repeat(60));
}

// Test database connection
async function testConnection() {
    header('MongoDB Connection Test');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_waste_management';

    info(`Testing connection to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });

        success('Successfully connected to MongoDB!');

        // Get connection info
        const connection = mongoose.connection;
        info(`Database: ${connection.db.databaseName}`);
        info(`Host: ${connection.host}`);
        info(`Port: ${connection.port}`);

        return true;
    } catch (err) {
        error(`Connection failed: ${err.message}`);

        if (err.message.includes('authentication failed')) {
            warning('Check your username and password in MONGO_URI');
        } else if (err.message.includes('timeout')) {
            warning('Check your network connection and MongoDB Atlas network access settings');
        } else if (err.message.includes('ENOTFOUND')) {
            warning('Check your MongoDB cluster URL in MONGO_URI');
        }

        return false;
    }
}

// Test basic database operations
async function testOperations() {
    header('Database Operations Test');

    try {
        // Create a simple test schema
        const testSchema = new mongoose.Schema({
            name: String,
            timestamp: { type: Date, default: Date.now },
            testData: mongoose.Schema.Types.Mixed
        });

        const TestModel = mongoose.model('Test', testSchema);

        // Test 1: Create a document
        info('Test 1: Creating test document...');
        const testDoc = new TestModel({
            name: 'Database Connection Test',
            testData: {
                status: 'testing',
                version: '1.0.0',
                features: ['bins', 'users', 'collections']
            }
        });

        const savedDoc = await testDoc.save();
        success(`Document created with ID: ${savedDoc._id}`);

        // Test 2: Read the document
        info('Test 2: Reading test document...');
        const foundDoc = await TestModel.findById(savedDoc._id);
        if (foundDoc) {
            success(`Document found: ${foundDoc.name}`);
        } else {
            error('Document not found');
        }

        // Test 3: Update the document
        info('Test 3: Updating test document...');
        foundDoc.testData.status = 'updated';
        await foundDoc.save();
        success('Document updated successfully');

        // Test 4: Count documents
        info('Test 4: Counting documents...');
        const count = await TestModel.countDocuments();
        info(`Total test documents: ${count}`);

        // Test 5: Delete the test document
        info('Test 5: Cleaning up test document...');
        await TestModel.findByIdAndDelete(savedDoc._id);
        success('Test document deleted');

        // Drop the test collection
        await TestModel.collection.drop().catch(() => {
            // Collection might not exist, ignore error
        });

        success('All database operations completed successfully!');
        return true;

    } catch (err) {
        error(`Database operations failed: ${err.message}`);
        return false;
    }
}

// Test bin collection operations (specific to your app)
async function testBinCollection() {
    header('Bin Collection Test');

    try {
        // Import your actual Bin model
        const Bin = require('./backend/models/Bin').catch(() => {
            // If model doesn't exist, create a simple one
            const binSchema = new mongoose.Schema({
                name: String,
                type: String,
                status: { type: String, enum: ['Empty', 'Half-Full', 'Full'], default: 'Empty' },
                location: {
                    latitude: Number,
                    longitude: Number,
                    address: String
                },
                capacity: { type: Number, default: 100 },
                currentLevel: { type: Number, default: 0 },
                lastEmptied: Date,
                createdAt: { type: Date, default: Date.now }
            });

            return mongoose.model('Bin', binSchema);
        });

        // Test creating a sample bin
        info('Creating sample waste bin...');
        const sampleBin = new Bin({
            name: 'Test Bin - Connection Verification',
            type: 'General',
            status: 'Empty',
            location: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'Test Location, New York, NY'
            },
            capacity: 100,
            currentLevel: 0
        });

        const savedBin = await sampleBin.save();
        success(`Sample bin created with ID: ${savedBin._id}`);

        // Count existing bins
        const binCount = await Bin.countDocuments();
        info(`Total bins in database: ${binCount}`);

        // Clean up test bin
        await Bin.findByIdAndDelete(savedBin._id);
        success('Test bin cleaned up');

        return true;
    } catch (err) {
        error(`Bin collection test failed: ${err.message}`);
        return false;
    }
}

// Check environment variables
function checkEnvironment() {
    header('Environment Variables Check');

    const requiredVars = ['MONGO_URI'];
    const optionalVars = ['NODE_ENV', 'PORT'];

    let allRequired = true;

    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            success(`${varName} is set`);
        } else {
            error(`${varName} is missing`);
            allRequired = false;
        }
    });

    optionalVars.forEach(varName => {
        if (process.env[varName]) {
            info(`${varName}: ${process.env[varName]}`);
        } else {
            warning(`${varName} is not set (optional)`);
        }
    });

    if (!allRequired) {
        error('Some required environment variables are missing');
        info('Create a .env file in your project root with:');
        console.log('\nMONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_waste_management\n');
    }

    return allRequired;
}

// Main test function
async function runTests() {
    console.log(colors.cyan + `
🧪 MongoDB Database Connection Test
Smart Waste Management System
` + colors.reset);

    let passed = 0;
    let failed = 0;

    // Test 1: Environment variables
    if (checkEnvironment()) {
        passed++;
    } else {
        failed++;
        process.exit(1);
    }

    // Test 2: Database connection
    if (await testConnection()) {
        passed++;
    } else {
        failed++;
        process.exit(1);
    }

    // Test 3: Basic operations
    if (await testOperations()) {
        passed++;
    } else {
        failed++;
    }

    // Test 4: Bin collection specific operations
    if (await testBinCollection()) {
        passed++;
    } else {
        failed++;
    }

    // Close connection
    await mongoose.connection.close();

    // Results
    header('Test Results');
    success(`Passed: ${passed} tests`);
    if (failed > 0) {
        error(`Failed: ${failed} tests`);
    }

    if (failed === 0) {
        success('🎉 All tests passed! Your database is ready for production.');
        info('You can now deploy your application with confidence.');
    } else {
        error('❌ Some tests failed. Please fix the issues before deploying.');
    }

    process.exit(failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', async () => {
    log('\n🛑 Test interrupted by user', 'yellow');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('unhandledRejection', async (err) => {
    error(`Unhandled rejection: ${err.message}`);
    await mongoose.connection.close();
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    runTests().catch(async (err) => {
        error(`Test suite failed: ${err.message}`);
        await mongoose.connection.close();
        process.exit(1);
    });
}

module.exports = {
    testConnection,
    testOperations,
    testBinCollection,
    checkEnvironment
};

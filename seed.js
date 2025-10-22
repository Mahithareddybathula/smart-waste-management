const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const { seedDatabase } = require('./backend/sample-data');

// Load environment variables
dotenv.config({ path: './backend/.env' });

/**
 * Database Seeding Script
 * Run this script to populate the database with sample data
 *
 * Usage: node seed.js
 */

const runSeed = async () => {
    console.log('🌱 Starting database seeding process...\n');

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Database connection established\n');

        // Seed the database
        console.log('🌱 Seeding database with sample data...');
        const bins = await seedDatabase();

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`📊 Total bins created: ${bins.length}`);

        // Display sample data summary
        const stats = {
            empty: bins.filter(bin => bin.status === 'Empty').length,
            halfFull: bins.filter(bin => bin.status === 'Half-Full').length,
            full: bins.filter(bin => bin.status === 'Full').length
        };

        console.log('\n📈 Sample Data Summary:');
        console.log(`   🟢 Empty bins: ${stats.empty}`);
        console.log(`   🟡 Half-Full bins: ${stats.halfFull}`);
        console.log(`   🔴 Full bins: ${stats.full}`);

        console.log('\n🚀 You can now start the server with: npm start');
        console.log('🌐 Then open frontend/index.html in your browser\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Database seeding failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Make sure MongoDB is running');
            console.log('   2. Check your MONGO_URI in backend/.env');
            console.log('   3. For local MongoDB: mongodb://localhost:27017/smart_waste_management');
        }

        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Seeding process interrupted');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Seeding process terminated');
    process.exit(0);
});

// Run the seeding process
runSeed();

// Smart Waste Management System - Sample Dataset
// This file contains sample data for testing the application

const sampleBins = [
    {
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'Empty',
        addedAt: new Date('2024-01-15T08:30:00.000Z')
    },
    {
        latitude: 40.7589,
        longitude: -73.9851,
        status: 'Half-Full',
        addedAt: new Date('2024-01-15T09:15:00.000Z')
    },
    {
        latitude: 40.7505,
        longitude: -73.9934,
        status: 'Full',
        addedAt: new Date('2024-01-15T10:00:00.000Z')
    },
    {
        latitude: 40.7614,
        longitude: -73.9776,
        status: 'Empty',
        addedAt: new Date('2024-01-15T11:30:00.000Z')
    },
    {
        latitude: 40.7282,
        longitude: -73.7949,
        status: 'Half-Full',
        addedAt: new Date('2024-01-15T12:45:00.000Z')
    },
    {
        latitude: 40.6782,
        longitude: -73.9442,
        status: 'Full',
        addedAt: new Date('2024-01-15T13:20:00.000Z')
    },
    {
        latitude: 40.7831,
        longitude: -73.9712,
        status: 'Empty',
        addedAt: new Date('2024-01-15T14:10:00.000Z')
    },
    {
        latitude: 40.7580,
        longitude: -73.9855,
        status: 'Half-Full',
        addedAt: new Date('2024-01-15T15:00:00.000Z')
    },
    {
        latitude: 40.7488,
        longitude: -73.9857,
        status: 'Full',
        addedAt: new Date('2024-01-15T16:30:00.000Z')
    },
    {
        latitude: 40.7424,
        longitude: -74.0061,
        status: 'Empty',
        addedAt: new Date('2024-01-15T17:15:00.000Z')
    },
    {
        latitude: 40.7350,
        longitude: -73.9906,
        status: 'Half-Full',
        addedAt: new Date('2024-01-16T08:00:00.000Z')
    },
    {
        latitude: 40.7255,
        longitude: -73.9969,
        status: 'Full',
        addedAt: new Date('2024-01-16T09:30:00.000Z')
    }
];

// Function to seed the database with sample data
const seedDatabase = async () => {
    try {
        const Bin = require('./models/Bin');

        // Clear existing data
        await Bin.deleteMany({});
        console.log('Cleared existing bin data');

        // Insert sample data
        const insertedBins = await Bin.insertMany(sampleBins);
        console.log(`Successfully inserted ${insertedBins.length} sample bins`);

        // Display summary
        const stats = {
            total: insertedBins.length,
            empty: insertedBins.filter(bin => bin.status === 'Empty').length,
            halfFull: insertedBins.filter(bin => bin.status === 'Half-Full').length,
            full: insertedBins.filter(bin => bin.status === 'Full').length
        };

        console.log('Sample data summary:', stats);
        return insertedBins;

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};

// Function to add a single sample bin
const addSampleBin = async (binData) => {
    try {
        const Bin = require('./models/Bin');
        const newBin = new Bin(binData);
        const savedBin = await newBin.save();
        console.log('Sample bin added:', savedBin);
        return savedBin;
    } catch (error) {
        console.error('Error adding sample bin:', error);
        throw error;
    }
};

// Export functions and data
module.exports = {
    sampleBins,
    seedDatabase,
    addSampleBin
};

// If this file is run directly, seed the database
if (require.main === module) {
    const connectDB = require('./config/db');

    const runSeed = async () => {
        try {
            await connectDB();
            await seedDatabase();
            console.log('Database seeding completed successfully!');
            process.exit(0);
        } catch (error) {
            console.error('Database seeding failed:', error);
            process.exit(1);
        }
    };

    runSeed();
}

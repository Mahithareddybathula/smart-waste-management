// Smart Waste Management System - Demo Server (No Database Required)
// This version uses in-memory storage for testing without MongoDB

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// In-memory storage (simulates database)
let bins = [
    {
        _id: '1',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'Empty',
        addedAt: new Date('2024-01-15T08:30:00.000Z'),
        updatedAt: new Date('2024-01-15T08:30:00.000Z')
    },
    {
        _id: '2',
        latitude: 40.7589,
        longitude: -73.9851,
        status: 'Half-Full',
        addedAt: new Date('2024-01-15T09:15:00.000Z'),
        updatedAt: new Date('2024-01-15T09:15:00.000Z')
    },
    {
        _id: '3',
        latitude: 40.7505,
        longitude: -73.9934,
        status: 'Full',
        addedAt: new Date('2024-01-15T10:00:00.000Z'),
        updatedAt: new Date('2024-01-15T10:00:00.000Z')
    },
    {
        _id: '4',
        latitude: 40.7614,
        longitude: -73.9776,
        status: 'Empty',
        addedAt: new Date('2024-01-15T11:30:00.000Z'),
        updatedAt: new Date('2024-01-15T11:30:00.000Z')
    },
    {
        _id: '5',
        latitude: 40.7282,
        longitude: -73.7949,
        status: 'Half-Full',
        addedAt: new Date('2024-01-15T12:45:00.000Z'),
        updatedAt: new Date('2024-01-15T12:45:00.000Z')
    }
];

let nextId = 6;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Utility functions
const validateCoordinates = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const validateStatus = (status) => {
    return ['Empty', 'Half-Full', 'Full'].includes(status);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Routes

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Smart Waste Management System API (Demo Mode)',
        version: '1.0.0-demo',
        mode: 'In-Memory Storage',
        endpoints: {
            'GET /api/bins': 'Get all bins',
            'POST /api/bins': 'Add a new bin',
            'PUT /api/bins/:id': 'Update bin status',
            'DELETE /api/bins/:id': 'Delete a bin',
            'GET /api/bins/nearby': 'Get nearby bins (query: lat, lng, radius)'
        },
        currentBins: bins.length
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'demo',
        storage: 'in-memory',
        binsCount: bins.length
    });
});

// Get all bins
app.get('/api/bins', (req, res) => {
    try {
        res.status(200).json({
            success: true,
            count: bins.length,
            data: bins
        });
    } catch (error) {
        console.error('Error fetching bins:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bins'
        });
    }
});

// Add new bin
app.post('/api/bins', (req, res) => {
    try {
        const { latitude, longitude, status } = req.body;

        // Validate required fields
        if (!latitude || !longitude || !status) {
            return res.status(400).json({
                success: false,
                error: 'Please provide latitude, longitude, and status'
            });
        }

        // Convert to numbers
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || !validateCoordinates(lat, lng)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180'
            });
        }

        // Validate status
        if (!validateStatus(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either Empty, Half-Full, or Full'
            });
        }

        // Create new bin
        const newBin = {
            _id: nextId.toString(),
            latitude: lat,
            longitude: lng,
            status: status,
            addedAt: new Date(),
            updatedAt: new Date()
        };

        bins.push(newBin);
        nextId++;

        res.status(201).json({
            success: true,
            message: 'Bin added successfully',
            data: newBin
        });

    } catch (error) {
        console.error('Error adding bin:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add bin'
        });
    }
});

// Update bin status
app.put('/api/bins/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find bin
        const binIndex = bins.findIndex(bin => bin._id === id);
        if (binIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Bin not found'
            });
        }

        // Validate status
        if (!validateStatus(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either Empty, Half-Full, or Full'
            });
        }

        // Update bin
        bins[binIndex].status = status;
        bins[binIndex].updatedAt = new Date();

        res.status(200).json({
            success: true,
            message: 'Bin status updated successfully',
            data: bins[binIndex]
        });

    } catch (error) {
        console.error('Error updating bin:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update bin'
        });
    }
});

// Delete bin
app.delete('/api/bins/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Find bin
        const binIndex = bins.findIndex(bin => bin._id === id);
        if (binIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Bin not found'
            });
        }

        // Remove bin
        const deletedBin = bins.splice(binIndex, 1)[0];

        res.status(200).json({
            success: true,
            message: 'Bin deleted successfully',
            data: deletedBin
        });

    } catch (error) {
        console.error('Error deleting bin:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete bin'
        });
    }
});

// Get nearby bins
app.get('/api/bins/nearby', (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Please provide latitude (lat) and longitude (lng) query parameters'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInKm = parseFloat(radius);

        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates or radius'
            });
        }

        // Filter bins within radius
        const nearbyBins = bins.filter(bin => {
            const distance = calculateDistance(latitude, longitude, bin.latitude, bin.longitude);
            return distance <= radiusInKm;
        });

        res.status(200).json({
            success: true,
            count: nearbyBins.length,
            radius: `${radiusInKm} km`,
            data: nearbyBins
        });

    } catch (error) {
        console.error('Error fetching nearby bins:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nearby bins'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
🚀 Smart Waste Management System - DEMO SERVER
📡 Server running on port ${PORT}
🌍 Mode: In-Memory Storage (No Database Required)
📊 API Base URL: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/health
📦 Sample bins loaded: ${bins.length}

✅ Ready to test! Open frontend/index.html in your browser
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down demo server...');
    server.close(() => {
        console.log('Demo server terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down demo server...');
    server.close(() => {
        console.log('Demo server terminated');
    });
});

module.exports = app;

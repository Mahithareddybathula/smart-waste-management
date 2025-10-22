const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');

/**
 * @route   GET /api/bins
 * @desc    Get all bins from the database
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const bins = await Bin.find().sort({ addedAt: -1 });

        res.status(200).json({
            success: true,
            count: bins.length,
            data: bins
        });
    } catch (error) {
        console.error('Error fetching bins:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server Error - Unable to fetch bins'
        });
    }
});

/**
 * @route   POST /api/bins
 * @desc    Add a new bin to the database
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { latitude, longitude, status } = req.body;

        // Validate required fields
        if (!latitude || !longitude || !status) {
            return res.status(400).json({
                success: false,
                error: 'Please provide latitude, longitude, and status'
            });
        }

        // Validate latitude and longitude ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                error: 'Latitude must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                error: 'Longitude must be between -180 and 180'
            });
        }

        // Validate status
        const validStatuses = ['Empty', 'Half-Full', 'Full'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either Empty, Half-Full, or Full'
            });
        }

        // Create new bin
        const newBin = new Bin({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status
        });

        const savedBin = await newBin.save();

        res.status(201).json({
            success: true,
            message: 'Bin added successfully',
            data: savedBin
        });

    } catch (error) {
        console.error('Error adding bin:', error.message);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server Error - Unable to add bin'
        });
    }
});

/**
 * @route   PUT /api/bins/:id
 * @desc    Update bin status by ID
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Empty', 'Half-Full', 'Full'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either Empty, Half-Full, or Full'
            });
        }

        const updatedBin = await Bin.findByIdAndUpdate(
            id,
            { status, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedBin) {
            return res.status(404).json({
                success: false,
                error: 'Bin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bin status updated successfully',
            data: updatedBin
        });

    } catch (error) {
        console.error('Error updating bin:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid bin ID'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server Error - Unable to update bin'
        });
    }
});

/**
 * @route   DELETE /api/bins/:id
 * @desc    Delete a bin by ID
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBin = await Bin.findByIdAndDelete(id);

        if (!deletedBin) {
            return res.status(404).json({
                success: false,
                error: 'Bin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bin deleted successfully',
            data: deletedBin
        });

    } catch (error) {
        console.error('Error deleting bin:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid bin ID'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server Error - Unable to delete bin'
        });
    }
});

/**
 * @route   GET /api/bins/nearby
 * @desc    Get bins within a certain radius of given coordinates
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query; // radius in km, default 5km

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Please provide latitude (lat) and longitude (lng) query parameters'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInKm = parseFloat(radius);

        // Simple distance calculation using bounding box
        // For more accurate results, you could use MongoDB's geospatial queries
        const latDelta = radiusInKm / 111; // Rough conversion: 1 degree ≈ 111 km
        const lngDelta = radiusInKm / (111 * Math.cos(latitude * Math.PI / 180));

        const nearbyBins = await Bin.find({
            latitude: {
                $gte: latitude - latDelta,
                $lte: latitude + latDelta
            },
            longitude: {
                $gte: longitude - lngDelta,
                $lte: longitude + lngDelta
            }
        }).sort({ addedAt: -1 });

        res.status(200).json({
            success: true,
            count: nearbyBins.length,
            radius: `${radiusInKm} km`,
            data: nearbyBins
        });

    } catch (error) {
        console.error('Error fetching nearby bins:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server Error - Unable to fetch nearby bins'
        });
    }
});

module.exports = router;

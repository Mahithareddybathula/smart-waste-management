const mongoose = require('mongoose');

/**
 * Bin Schema for MongoDB
 * Defines the structure for waste bin data in the database
 */
const binSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
    },
    status: {
        type: String,
        required: [true, 'Bin status is required'],
        enum: {
            values: ['Empty', 'Half-Full', 'Full'],
            message: 'Status must be either Empty, Half-Full, or Full'
        },
        default: 'Empty'
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
binSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better query performance
binSchema.index({ latitude: 1, longitude: 1 });
binSchema.index({ status: 1 });
binSchema.index({ addedAt: -1 });

const Bin = mongoose.model('Bin', binSchema);

module.exports = Bin;

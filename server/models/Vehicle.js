import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true,
    },
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    licensePlate: {
        type: String,
        default: '',
    },
    vin: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '',
    },
    mileage: {
        type: Number,
        default: 0,
    },
    dailyRate: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance', 'unavailable'],
        default: 'available',
    },
    documents: [{
        documentType: String,
        filename: String,
        filepath: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    images: [{
        filename: String,
        filepath: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes
vehicleSchema.index({ hostId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vin: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;

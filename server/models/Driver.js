import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    licenseNumber: {
        type: String,
        default: '',
    },
    licenseExpiry: {
        type: Date,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
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
driverSchema.index({ userId: 1 });
driverSchema.index({ licenseNumber: 1 });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;

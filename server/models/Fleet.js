import mongoose from 'mongoose';

const fleetSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    vehicleIds: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
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
fleetSchema.index({ hostId: 1 });
fleetSchema.index({ status: 1 });

const Fleet = mongoose.model('Fleet', fleetSchema);

export default Fleet;

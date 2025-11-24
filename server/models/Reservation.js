import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
    },
    driverId: {
        type: String,
        required: true,
    },
    hostId: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending',
    },
    pickupLocation: {
        type: String,
        default: '',
    },
    dropoffLocation: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
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
reservationSchema.index({ vehicleId: 1 });
reservationSchema.index({ driverId: 1 });
reservationSchema.index({ hostId: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ startDate: 1, endDate: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;

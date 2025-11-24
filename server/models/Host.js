import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        default: '',
    },
    parkMyShareLocation: {
        type: String,
        default: 'Atlanta, GA',
    },
    serviceTier: {
        type: String,
        enum: ['basic', 'pro', 'enterprise', 'none'],
        default: 'none',
    },
    monthlySubscriptionFee: {
        type: Number,
        default: 0,
    },
    onboardingStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'cancelled'],
        default: 'pending',
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
    stripeSubscriptionId: {
        type: String,
        default: null,
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
hostSchema.index({ userId: 1 });
hostSchema.index({ stripeCustomerId: 1 });
hostSchema.index({ stripeSubscriptionId: 1 });

const Host = mongoose.model('Host', hostSchema);

export default Host;

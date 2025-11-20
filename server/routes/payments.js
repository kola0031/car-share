import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { updateHost } from '../database/hosts.js';
import { updateUser } from '../database/users.js';
import {
    createPaymentIntent,
    createCustomer,
    createSubscription,
    createSetupIntent,
    SUBSCRIPTION_TIERS,
} from '../services/payment.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
        });
    }
    next();
};

// Get subscription tiers
router.get('/tiers', (req, res) => {
    res.json({ tiers: SUBSCRIPTION_TIERS });
});

// Create payment intent for one-time payment
router.post('/create-payment-intent', [
    authenticateToken,
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('tier').optional().isIn(['basic', 'pro', 'enterprise']),
    validate,
], async (req, res) => {
    try {
        const { amount, tier } = req.body;
        const userId = req.user.userId;

        const result = await createPaymentIntent(amount, 'usd', { userId, tier });

        res.json(result);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// Create Stripe customer
router.post('/create-customer', [
    authenticateToken,
    validate,
], async (req, res) => {
    try {
        const { email, name } = req.user;
        const userId = req.user.userId;

        const result = await createCustomer(email, name, { userId });

        // Update user with Stripe customer ID
        await updateUser(userId, { stripeCustomerId: result.customerId });

        res.json(result);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Failed to create customer' });
    }
});

// Create subscription
router.post('/create-subscription', [
    authenticateToken,
    body('tier').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid tier'),
    validate,
], async (req, res) => {
    try {
        const { tier } = req.body;
        const userId = req.user.userId;
        const hostId = req.user.hostId;

        // Get or create Stripe customer
        let customerId = req.user.stripeCustomerId;
        if (!customerId) {
            const customerResult = await createCustomer(req.user.email, req.user.name, { userId });
            customerId = customerResult.customerId;
            await updateUser(userId, { stripeCustomerId: customerId });
        }

        // Create subscription
        const tierConfig = SUBSCRIPTION_TIERS[tier];
        const result = await createSubscription(customerId, tierConfig.priceId, {
            userId,
            hostId,
            tier,
        });

        // Update host with subscription info
        if (hostId) {
            await updateHost(hostId, {
                serviceTier: tierConfig.name,
                monthlySubscriptionFee: tierConfig.price / 100, // Convert cents to dollars
                subscriptionStatus: 'pending',
                stripeSubscriptionId: result.subscriptionId,
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
});

// Create setup intent for saving payment method
router.post('/create-setup-intent', [
    authenticateToken,
    validate,
], async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get or create Stripe customer
        let customerId = req.user.stripeCustomerId;
        if (!customerId) {
            const customerResult = await createCustomer(req.user.email, req.user.name, { userId });
            customerId = customerResult.customerId;
            await updateUser(userId, { stripeCustomerId: customerId });
        }

        const result = await createSetupIntent(customerId);

        res.json(result);
    } catch (error) {
        console.error('Error creating setup intent:', error);
        res.status(500).json({ message: 'Failed to create setup intent' });
    }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('Stripe webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object.id);
            // Handle successful payment
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            // Handle failed payment
            break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            const hostId = subscription.metadata.hostId;
            if (hostId) {
                await updateHost(hostId, {
                    subscriptionStatus: subscription.status,
                    stripeSubscriptionId: subscription.id,
                });
            }
            break;
        case 'customer.subscription.deleted':
            const deletedSub = event.data.object;
            const deletedHostId = deletedSub.metadata.hostId;
            if (deletedHostId) {
                await updateHost(deletedHostId, {
                    subscriptionStatus: 'canceled',
                });
            }
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

export default router;

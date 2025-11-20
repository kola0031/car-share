import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development', {
    apiVersion: '2023-10-16',
});

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
    basic: {
        name: 'Basic',
        price: 29900, // $299.00 in cents
        priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
        features: [
            'Up to 5 vehicles',
            'Basic analytics',
            'Email support',
            'ParkMyShare integration',
        ],
    },
    pro: {
        name: 'Pro',
        price: 49900, // $499.00 in cents
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        features: [
            'Up to 20 vehicles',
            'Advanced analytics',
            'Priority support',
            'AI pricing optimization',
            'Custom branding',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        price: 99900, // $999.00 in cents
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
        features: [
            'Unlimited vehicles',
            'Real-time analytics',
            '24/7 phone support',
            'AI pricing + automation',
            'White-label solution',
            'Dedicated account manager',
        ],
    },
};

/**
 * Create a payment intent for subscription
 */
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

/**
 * Create a Stripe customer
 */
export const createCustomer = async (email, name, metadata = {}) => {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
            metadata,
        });

        return {
            success: true,
            customerId: customer.id,
        };
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

/**
 * Create a subscription for a customer
 */
export const createSubscription = async (customerId, priceId, metadata = {}) => {
    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata,
        });

        return {
            success: true,
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        };
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId) => {
    try {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        return {
            success: true,
            subscription,
        };
    } catch (error) {
        console.error('Error canceling subscription:', error);
        throw error;
    }
};

/**
 * Update a subscription
 */
export const updateSubscription = async (subscriptionId, newPriceId) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [{
                id: subscription.items.data[0].id,
                price: newPriceId,
            }],
        });

        return {
            success: true,
            subscription: updatedSubscription,
        };
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
};

/**
 * Retrieve subscription details
 */
export const getSubscription = async (subscriptionId) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        return {
            success: true,
            subscription,
        };
    } catch (error) {
        console.error('Error retrieving subscription:', error);
        throw error;
    }
};

/**
 * Create a setup intent for saving payment method
 */
export const createSetupIntent = async (customerId) => {
    try {
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
        });

        return {
            success: true,
            clientSecret: setupIntent.client_secret,
        };
    } catch (error) {
        console.error('Error creating setup intent:', error);
        throw error;
    }
};

export default {
    createPaymentIntent,
    createCustomer,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    getSubscription,
    createSetupIntent,
    SUBSCRIPTION_TIERS,
};

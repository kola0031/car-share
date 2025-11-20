import { useState } from 'react';
import PropTypes from 'prop-types';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

const CARD_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

const PaymentForm = ({ clientSecret, onSuccess, onError, tier = 'basic' }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !cardComplete) {
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (error) {
                onError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }
        } catch (err) {
            onError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form className="payment-form" onSubmit={handleSubmit}>
            <div className="tier-info">
                <h3>Subscribe to {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</h3>
            </div>

            <div className="card-element-container">
                <label>Card Details</label>
                <CardElement
                    options={CARD_OPTIONS}
                    onChange={(e) => setCardComplete(e.complete)}
                />
            </div>

            <button
                type="submit"
                className="btn-primary btn-payment"
                disabled={!stripe || processing || !cardComplete}
            >
                {processing ? 'Processing...' : 'Subscribe Now'}
            </button>

            <div className="payment-security">
                <span>🔒 Secure payment powered by Stripe</span>
            </div>
        </form>
    );
};

PaymentForm.propTypes = {
    clientSecret: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    tier: PropTypes.string,
};

export default PaymentForm;

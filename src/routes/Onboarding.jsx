import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { hostsAPI, vehiclesAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import VehicleForm from '../components/VehicleForm';
import DocumentUpload from '../components/DocumentUpload';
import PaymentForm from '../components/PaymentForm';
import './Onboarding.css';

// Initialize Stripe (use test key for now)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy');

const STEPS = {
  COMPANY: 1,
  VEHICLE: 2,
  DOCUMENTS: 3,
  PAYMENT: 4,
  COMPLETE: 5,
};

const Onboarding = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.COMPANY);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [hostId, setHostId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);

  const [companyData, setCompanyData] = useState({
    companyName: '',
    parkMyShareLocation: 'Atlanta, GA',
  });

  const initializeOnboarding = useCallback(async () => {
    setInitializing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let currentUser = user;
      if (!currentUser?.hostId && refreshUser) {
        currentUser = await refreshUser();
      }

      if (!currentUser?.hostId) {
        setError('Host profile not found. Please contact support.');
        setInitializing(false);
        return;
      }

      setHostId(currentUser.hostId);

      // Check if onboarding is already completed
      const host = await hostsAPI.getOne(currentUser.hostId);
      if (host.onboardingStatus === 'completed') {
        navigate('/dashboard');
        return;
      }

      // Pre-fill company data
      if (host.companyName) {
        setCompanyData(prev => ({ ...prev, companyName: host.companyName }));
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setError(error.message || 'Failed to initialize onboarding.');
    } finally {
      setInitializing(false);
    }
  }, [user, refreshUser, navigate]);

  useEffect(() => {
    if (!authLoading) {
      initializeOnboarding();
    }
  }, [authLoading, initializeOnboarding]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyData.companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await hostsAPI.update(hostId, {
        companyName: companyData.companyName,
        parkMyShareLocation: companyData.parkMyShareLocation,
      });
      setCurrentStep(STEPS.VEHICLE);
    } catch (err) {
      setError(err.message || 'Failed to save company information');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (vehicleData) => {
    setLoading(true);
    setError('');

    try {
      const newVehicle = await vehiclesAPI.create({
        ...vehicleData,
        hostId,
        status: 'available',
        dailyRate: 0, // Default rate, can be updated later in fleet management
      });
      setVehicleId(newVehicle.id);
      setCurrentStep(STEPS.DOCUMENTS);
    } catch (err) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (uploadData) => {
    if (!vehicleId) {
      setError('No vehicle found. Please go back and add a vehicle first.');
      return;
    }

    try {
      await vehiclesAPI.uploadDocument(vehicleId, uploadData);
    } catch (err) {
      console.error('Document upload failed:', err);
      throw err;
    }
  };

  const handleSkipDocuments = () => {
    setCurrentStep(STEPS.PAYMENT);
  };

  const handleContinueToPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent for subscription
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tier: 'basic' }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Payment API error:', data);
        throw new Error(data.message || 'Failed to initialize payment');
      }

      setPaymentClientSecret(data.clientSecret);
      setCurrentStep(STEPS.PAYMENT);
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. You can skip this step for now.');
      // Still go to payment step so user can see the skip option
      setCurrentStep(STEPS.PAYMENT);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Mark onboarding as completed without payment
      await hostsAPI.update(hostId, {
        onboardingStatus: 'completed',
        subscriptionStatus: 'pending', // Mark as pending instead of active
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setCurrentStep(STEPS.COMPLETE);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);

    try {
      // Mark onboarding as completed
      await hostsAPI.update(hostId, {
        onboardingStatus: 'completed',
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setCurrentStep(STEPS.COMPLETE);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  if (authLoading || initializing) {
    return (
      <ProtectedRoute>
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <h1>Welcome to HostPilot!</h1>
              <p>Loading your account...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <h1>Welcome to HostPilot!</h1>
            <p>Let's get your fleet set up</p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= STEPS.COMPANY ? 'active' : ''} ${currentStep > STEPS.COMPANY ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Company</span>
            </div>
            <div className={`step ${currentStep >= STEPS.VEHICLE ? 'active' : ''} ${currentStep > STEPS.VEHICLE ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Vehicle</span>
            </div>
            <div className={`step ${currentStep >= STEPS.DOCUMENTS ? 'active' : ''} ${currentStep > STEPS.DOCUMENTS ? 'completed' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Documents</span>
            </div>
            <div className={`step ${currentStep >= STEPS.PAYMENT ? 'active' : ''} ${currentStep > STEPS.PAYMENT ? 'completed' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Payment</span>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="onboarding-content">
            {/* Step 1: Company Information */}
            {currentStep === STEPS.COMPANY && (
              <div className="step-content">
                <h2>Company Information</h2>
                <form onSubmit={handleCompanySubmit}>
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      placeholder="Your company name"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">ParkMyShare Location</label>
                    <select
                      id="location"
                      value={companyData.parkMyShareLocation}
                      onChange={(e) => setCompanyData({ ...companyData, parkMyShareLocation: e.target.value })}
                      disabled={loading}
                    >
                      <option value="Atlanta, GA">Atlanta, GA</option>
                      <option value="Miami, FL">Miami, FL</option>
                      <option value="Los Angeles, CA">Los Angeles, CA</option>
                      <option value="New York, NY">New York, NY</option>
                      <option value="Chicago, IL">Chicago, IL</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Add Vehicle */}
            {currentStep === STEPS.VEHICLE && (
              <div className="step-content">
                <h2>Add Your First Vehicle</h2>
                <p>Tell us about the vehicle you want to add to your fleet</p>
                <VehicleForm onSubmit={handleVehicleSubmit} loading={loading} />
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === STEPS.DOCUMENTS && (
              <div className="step-content">
                <h2>Upload Vehicle Documents</h2>
                <p>Add insurance, registration, or other documents (optional)</p>

                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  documentType="insurance"
                  label="Insurance Certificate"
                  accept="image/*,application/pdf"
                />

                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  documentType="registration"
                  label="Vehicle Registration"
                  accept="image/*,application/pdf"
                />

                <div className="button-group">
                  <button onClick={handleSkipDocuments} className="btn-secondary">
                    Skip for Now
                  </button>
                  <button onClick={handleContinueToPayment} className="btn-primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Continue to Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === STEPS.PAYMENT && (
              <div className="step-content">
                <h2>Subscribe to HostPilot</h2>
                <p>Complete your subscription to start earning</p>

                {paymentClientSecret ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      clientSecret={paymentClientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      tier="basic"
                    />
                  </Elements>
                ) : (
                  <div className="payment-placeholder">
                    <div className="info-box">
                      <p>⚠️ Payment processing is not configured yet.</p>
                      <p>You can skip this step and set up payment later from your dashboard.</p>
                    </div>
                    <div className="button-group">
                      <button onClick={handleSkipPayment} className="btn-primary" disabled={loading}>
                        {loading ? 'Completing...' : 'Skip & Complete Onboarding'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === STEPS.COMPLETE && (
              <div className="step-content success">
                <div className="success-icon">✅</div>
                <h2>All Set!</h2>
                <p>Your account is ready. Redirecting to dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Onboarding;
